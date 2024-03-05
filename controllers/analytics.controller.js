import mongoose from "mongoose";
import models from "../models/index.js";
import { asyncHandler } from "../middlewares/index.js";
import { createVerboseQuery } from "../utils/shapes.util.js";

// import getLogger from "../logger/index.js";
// const logger = getLogger(import.meta.url);

export const totalRevenue = asyncHandler(async (req, res, next) => {
  const { filter } = req.query;
  const filters = createVerboseQuery(mongoose.sanitizeFilter({ ...JSON.parse(filter || "{}") }));

  const results = await models.orders
    .aggregate()
    .match(filters)
    .unwind({ path: "$entities", preserveNullAndEmptyArrays: false })
    .match(filters);

  let total = 0;
  results.forEach((order) => {
    const { discounted_price, offer_price, markup_price } = order.entities;
    if ((discounted_price ?? offer_price ?? markup_price ?? null) === null) console.log(order.order_id, order.entities);
    total += discounted_price ?? offer_price ?? markup_price ?? 0;
  });

  res.status(200).json({
    data: total,
    total: results.length,
  });
  next();
});
