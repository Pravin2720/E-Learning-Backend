import { body } from "express-validator";
import { validate } from "../middlewares/index.js";
import models from "../models/index.js";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

export function validateCart(req, res, next) {
  validate([body("items").exists().custom(validateItems).bail()])(req, res, next);
}

const validateItems = async (items) => {
  if (items !== undefined && !Array.isArray(items)) return Promise.reject("items should be an array.");

  const course = await processItems(models.courses, items, "course");
  const bundle = await processItems(models.bundles, items, "bundle");
  const ids = [...course.ids, ...bundle.ids];
  const valid_ids = [...course.valid_ids, ...bundle.valid_ids];
  if (ids.length === valid_ids.length) return;

  let invalid_ids = [...ids];
  valid_ids.forEach((v) => invalid_ids.splice(invalid_ids.indexOf(v.slug), 1));
  logger.debug("invalid ids", invalid_ids);
  // error if any invalid id found
  return invalid_ids.length > 0 ? Promise.reject(`following are not valid ids: ${invalid_ids.join(", ")}`) : true;
};

const sanitizeItems = async (items) => {
  const course = await processItems(models.courses, items, "course");
  const bundle = await processItems(models.bundles, items, "bundle");

  return [
    ...course.valid_ids.map((v) => ({ entity_id: v._id, entity_type: "course" })),
    ...bundle.valid_ids.map((v) => ({ entity_id: v._id, entity_type: "bundle" })),
  ];
};

async function processItems(model, array, type) {
  const ids = array.filter((v) => v.entity_type === type).map((v) => v.entity_id);
  const valid_ids = await model
    .find({ slug: { $in: ids } })
    .select("_id slug")
    .lean();
  return { ids, valid_ids };
}
