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

export const addRole = asyncHandler(async (req, res, next) => {
  const { name, active } = req.body;
  const data = { name, active };
  res.status(200).json(await createShapeHandler(models.roles, data));
  next();
});

export const listRoles = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readListShapeHandler(req.query, models.roles, {}));
  next();
});

export const getRole = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readOneShapeHandler(models.roles, { _id: req.params.id }));
  next();
});

export const editRole = asyncHandler(async (req, res, next) => {
  const { name, active } = req.body;
  const data = { name, active };
  res.status(200).json(await updateOneShapeHandler(models.roles, data, { _id: req.params.id }, ["-__v"]));
  next();
});

export const removeRoles = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteListShapeHandler(req.query, models.roles, {}));
  next();
});

export const removeRole = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteOneShapeHandler(models.roles, { _id: req.params.id }));
  next();
});
