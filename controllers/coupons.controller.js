import { asyncHandler, ErrorResponse } from "../middlewares/index.js";
import models from "../models/index.js";
import {
  createShapeHandler,
  deleteListShapeHandler,
  deleteOneShapeHandler,
  readListShapeHandler,
  readOneShapeHandler,
  updateOneShapeHandler,
} from "../utils/shapes.util.js";
import { fetchCoupon } from "../utils/coupon.util.js";
import { fetchManyPriceData } from "../utils/order.util.js";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

export const addCoupon = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    code,
    discount_type,
    value,
    quantity,
    exclusive,
    stackable,
    starts_at,
    expires_at,
    active,
  } = req.body;
  const data = {
    name,
    description,
    code,
    discount_type,
    value,
    quantity,
    exclusive,
    stackable,
    starts_at,
    expires_at,
    active,
  };
  res.status(200).json(await createShapeHandler(models.coupons, data));
  next();
});

export const listCoupons = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readListShapeHandler(req.query, models.coupons, {}, ["-__v"]));
  next();
});

export const getCoupon = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readOneShapeHandler(models.coupons, { _id: req.params.id }, ["-__v"]));
  next();
});

export const editCoupon = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    code,
    discount_type,
    value,
    quantity,
    exclusive,
    stackable,
    starts_at,
    expires_at,
    active,
  } = req.body;
  const data = {
    name,
    description,
    code,
    discount_type,
    value,
    quantity,
    exclusive,
    stackable,
    starts_at,
    expires_at,
    active,
  };
  res.status(200).json(await updateOneShapeHandler(models.coupons, data, { _id: req.params.id }, ["-__v"]));
  next();
});

export const removeCoupons = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteListShapeHandler(req.query, models.coupons, {}));
  next();
});

export const removeCoupon = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteOneShapeHandler(models.coupons, { _id: req.params.id }));
  next();
});

//
// ────────────────────────────────────────────────────── I ──────────
//   :::::: C O U P O N S : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────
//

export async function applyCoupon(coupon, entities) {
  let markup_total = 0;
  let discounted_total = 0;
  let applicable_entity_count = 0;

  // mark entity for which coupon is applicable
  entities.forEach((entity) => {
    // check if a coupon is exclusive to certain products
    entity.coupon_applicable = true;
    if (Object.keys(coupon?.exclusive ?? {}).length) {
      entity.coupon_applicable = (coupon.exclusive[entity.entity_type] ?? [])?.indexOf?.(entity.entity_id) !== -1;
    }

    // count applicable entities
    if (entity.coupon_applicable) applicable_entity_count += 1;
  });

  if (applicable_entity_count === 0) {
    logger.info("Coupon not applicable to items in cart");
    logger.debug(`coupon: ${coupon} | entities: ${entities} | coupon.exclusive: ${coupon.exclusive}`);
    throw new ErrorResponse("Coupon not applicable to items in cart", 400);
  }

  entities.forEach((entity) => {
    markup_total += entity.markup_price ?? 0;

    // skip if coupon not applicable for entity
    if (!entity.coupon_applicable) {
      // calculate stats
      discounted_total += entity.offer_price ?? entity.markup_price;
      return;
    }

    // if coupon is not stackable, base_price is markup_price
    // if coupon is stackable, base_price is offer_price if exists, else markup_price
    const base_price = coupon.stackable ? entity.offer_price ?? entity.markup_price : entity.markup_price;

    // apply coupon on entity
    if (coupon.discount_type === "fixed") {
      entity.discounted_price = base_price - coupon.value / applicable_entity_count;
    } else if (coupon.discount_type === "percentage") {
      entity.discounted_price = base_price * (1 - coupon.value / 100);
    } else if (coupon.discount_type === "free") {
      entity.discounted_price = 0;
    }

    // calculate stats
    discounted_total += entity.discounted_price;
  });

  if (discounted_total <= 0 && coupon.discount_type !== "free") {
    logger.info("Coupon cannot be applied");
    logger.debug(`coupon: ${coupon} | entities: ${entities} | discounted_total: ${discounted_total}`);
    throw new ErrorResponse("Coupon cannot be applied", 400);
  }

  return { coupon, entities, markup_total, discounted_total };
}

export const applyCouponWrapper = asyncHandler(async (req, res, next) => {
  const { code, entities } = req.body;

  // validate and fetch coupon details
  const { errors, ...coupon } = await fetchCoupon(code);
  if (errors?.length) throw new ErrorResponse(errors.join(", "), 400);

  // collect price data
  const entities_with_price = await fetchManyPriceData(entities);
  // error on invalid entity
  const invalid_entities = entities_with_price.filter((e) => !e.valid && e.error);
  if (invalid_entities?.length) {
    const errors = [...new Set(invalid_entities.map((e) => e.error))];
    throw new ErrorResponse(errors.join(", "), 400);
  }

  res.status(200).json(await applyCoupon(coupon, entities_with_price));
  next();
});
