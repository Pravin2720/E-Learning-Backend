import { asyncHandler, ErrorResponse } from "../middlewares/index.js";
import models from "../models/index.js";
import { fetchCoupon } from "../utils/coupon.util.js";
import { checkTestEmail, fetchManyPriceData } from "../utils/order.util.js";
import { readListShapeHandler, readOneShapeHandler } from "../utils/shapes.util.js";
import { applyCoupon } from "./coupons.controller.js";
import { createOrder } from "./razorpay.controller.js";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

export const listOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readListShapeHandler(req.query, models.orders, {}, ["-data", "-__v"]));
  next();
});

export const getOrder = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readOneShapeHandler(models.orders, { _id: req.params.id }, ["-data", "-__v"]));
  next();
});

export const initOrder = asyncHandler(async (req, res, next) => {
  const { entities, coupon_code, client_total, first_name, last_name, email, contact } = req.body;
  const notes = { first_name, last_name, email, contact };
  let order = { entities: entities, coupon_applied: null, notes: notes, amount: 0 };

  // collect price data
  order.entities = await fetchManyPriceData(entities);
  // error on invalid entity
  const invalid_entities = order.entities.filter((e) => !e.valid && e.error);
  if (invalid_entities?.length) {
    const errors = [...new Set(invalid_entities.map((e) => e.error))];
    throw new ErrorResponse(errors.join(", "), 400);
  }

  if (coupon_code) {
    // validate and fetch coupon details
    const { errors, ...coupon } = await fetchCoupon(coupon_code);
    if (errors?.length) throw new ErrorResponse(errors.join(", "), 400);

    // apply coupon details if applicable
    const coupon_applied = await applyCoupon(coupon, order.entities);

    // deduct coupon quantity
    if (Number.isInteger(coupon.quantity)) {
      const result = await models.coupons.updateOne(
        { _id: coupon._id, quantity: { $ne: null, $gt: 0 } },
        { $inc: { quantity: -1, updated_at: Date.now() } },
      );
      logger.debug(`coupon deduction result: ${result.modifiedCount} | coupon: ${coupon}`);
      if (result.modifiedCount === 0) throw new ErrorResponse("Coupon deduction failed", 500);
      logger.info("coupon quantity deduction complete");
    }

    order.amount = coupon_applied.discounted_total;
    order.coupon_applied = coupon_applied.coupon;
    order.entities = coupon_applied.entities;
  } else {
    order.entities.forEach((entity) => {
      order.amount += entity.offer_price ?? entity.markup_price;
    });
  }

  if (parseInt(client_total) !== parseInt(order.amount)) {
    throw new ErrorResponse(`amount validation failed. client: ${client_total} | server: ${order.amount}`, 400);
  }

  const mode = (await checkTestEmail(email)) ? "test" : "live";
  order = await models.orders.create({ ...order, amount: Math.ceil(order.amount * 100), mode: mode });

  if (order.amount === 0) {
    const result = await models.orders.updateOne(
      { _id: order._id },
      { $set: { order_id: order.id, status: "paid", valid: "valid", updated_at: Date.now() } },
    );
    logger.info("new order with zero amount result", result);
    res.status(202).json({ status: "Success" });
  } else {
    const rzp_order = await createOrder(order.amount, mode);
    const result = await models.orders.updateOne(
      { _id: order._id },
      { $set: { order_id: rzp_order.id, updated_at: Date.now() } },
    );
    logger.info("updating order id to new order result", result);
    res.status(200).json({ status: "Success", order: { ...rzp_order, mode: mode } });
  }
  next();
});
