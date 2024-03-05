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

export const addInstructor = asyncHandler(async (req, res, next) => {
  const { name, slug, designation, linkedin_url, icon_url, is_featured, active } = req.body;
  const data = { name, slug, designation, linkedin_url, icon_url, is_featured, active };
  res.status(200).json(await createShapeHandler(models.instructors, data));
  next();
});

export const listInstructors = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readListShapeHandler(req.query, models.instructors, {}, ["-__v"]));
  next();
});

export const getInstructor = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readOneShapeHandler(models.instructors, { _id: req.params.id }, ["-__v"]));
  next();
});

export const editInstructor = asyncHandler(async (req, res, next) => {
  const { name, slug, designation, linkedin_url, icon_url, is_featured, active } = req.body;
  const data = { name, slug, designation, linkedin_url, icon_url, is_featured, active };
  res.status(200).json(await updateOneShapeHandler(models.instructors, data, { _id: req.params.id }, ["-__v"]));
  next();
});

export const removeInstructors = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteListShapeHandler(req.query, models.instructors, {}));
  next();
});

export const removeInstructor = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteOneShapeHandler(models.instructors, { _id: req.params.id }));
  next();
});
