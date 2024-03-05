import models from "../models/index.js";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

export async function fetchCoupon(code) {
  const coupon = await models.coupons
    .findOne({ code: code ?? "", active: true })
    .select("-active -name -created_at -updated_at -__v")
    .lean();
  if (!coupon) return { errors: ["Coupon invalid"] };

  let errors = [];
  const { starts_at, expires_at, quantity } = coupon;

  //  validate against time limits
  const current_time = Date.now();
  if (starts_at && current_time <= starts_at) {
    logger.debug(`coupon ${code} is not active at current time ${current_time} | starts_at: ${starts_at}`);
    errors.push("Coupon inactive");
  }

  if (expires_at && current_time >= expires_at) {
    logger.debug(`coupon ${code} is not active at current time ${current_time} | expires_at: ${expires_at}`);
    errors.push("Coupon expired");
  }

  // validate against quantity
  if (!isNaN(quantity) && quantity <= 0) {
    logger.debug(`coupon ${code} out of stock | quantity: ${quantity}`);
    errors.push("Coupon quantity exhausted");
  }

  return { ...coupon, errors };
}
