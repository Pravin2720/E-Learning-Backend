import { asyncHandler } from "../middlewares/index.js";
import models from "../models/index.js";
import {
  createShapeHandler,
  deleteListShapeHandler,
  deleteOneShapeHandler,
  readListShapeHandler,
  readOneShapeHandler,
  updateOneShapeHandler,
} from "../utils/shapes.util.js";

// import getLogger from "../logger/index.js";
// const logger = getLogger(import.meta.url);

export const listReviews = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readListShapeHandler(req.query, models.reviews, {}, ["-__v"]));
  next();
});

export const getReview = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readOneShapeHandler(models.reviews, { _id: req.params.id }, ["-__v"]));
  next();
});

export const addReview = asyncHandler(async (req, res, next) => {
  const { name, designation, rating, title, review_text, image_url, is_featured, feature_order, active } = req.body;
  const data = { name, designation, rating, title, review_text, image_url, is_featured, feature_order, active };
  res.status(200).json(await createShapeHandler(models.reviews, data));
  next();
});

export const editReview = asyncHandler(async (req, res, next) => {
  const { name, designation, rating, title, review_text, image_url, is_featured, feature_order, active } = req.body;
  const data = { name, designation, rating, title, review_text, image_url, is_featured, feature_order, active };
  res.status(200).json(await updateOneShapeHandler(models.reviews, data, { _id: req.params.id }, ["-__v"]));
  next();
});

export const removeReviews = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteListShapeHandler(req.query, models.reviews, {}));
  next();
});

export const removeReview = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteOneShapeHandler(models.reviews, { _id: req.params.id }));
  next();
});
