import { asyncHandler } from "../middlewares/index.js";
import models from "../models/index.js";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

export const getCart = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const user = await models.users.findOne({ email: email }).select("_id").lean();

  const result = await models.carts.findOne({ user: user._id }).select("items -_id").lean();
  logger.debug(result);

  res.status(200).json(result);
  next();
});

export const editCart = asyncHandler(async (req, res, next) => {
  const { items } = req.body;
  const { email } = req.user;
  const user = await models.users.findOne({ email: email }).select("_id").lean();

  const update = await models.carts.updateOne(
    { user: user._id },
    { $set: { items, updated_at: Date.now() } },
    { upsert: true },
  );
  const result = await models.carts.findOne({ user: user._id }).select("items -_id").lean();
  logger.debug(update, result);

  res.status(200).json(result);
  next();
});
