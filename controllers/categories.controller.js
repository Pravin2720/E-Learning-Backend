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

export const addCategory = asyncHandler(async (req, res, next) => {
  const { name, description, active } = req.body;
  const data = { name, description, active };
  res.status(200).json(await createShapeHandler(models.categories, data));
  next();
});

export const listCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readListShapeHandler(req.query, models.categories, {}, ["-__v"]));
  next();
});

export const getCategory = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readOneShapeHandler(models.categories, { _id: req.params.id }, ["-__v"]));
  next();
});

export const editCategory = asyncHandler(async (req, res, next) => {
  const { name, description, active } = req.body;
  const data = { name, description, active };
  res.status(200).json(await updateOneShapeHandler(models.categories, data, { _id: req.params.id }, ["-__v"]));
  next();
});

export const removeCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteListShapeHandler(req.query, models.categories, {}));
  next();
});

export const removeCategory = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteOneShapeHandler(models.categories, { _id: req.params.id }));
  next();
});
