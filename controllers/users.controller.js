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

export const addUser = asyncHandler(async (req, res, next) => {
  const { first_name, last_name, email, avatar_url, password, roles, active } = req.body;
  const data = { first_name, last_name, email, avatar_url, password, roles, active };
  res.status(200).json(await createShapeHandler(models.users, data));
  next();
});

export const listUsers = asyncHandler(async (req, res, next) => {
  let projections = ["-__v"];
  if (!req.authorized_admin) projections.push("-password");
  res.status(200).json(await readListShapeHandler(req.query, models.users, {}, projections));
  next();
});

export const getUser = asyncHandler(async (req, res, next) => {
  let projections = ["-__v"];
  if (!req.authorized_admin) projections.push("-password");
  res.status(200).json(await readOneShapeHandler(models.users, { _id: req.params.id }, projections));
  next();
});

export const editUser = asyncHandler(async (req, res, next) => {
  let projections = ["-__v"];
  if (!req.authorized_admin) projections.push("-password");
  const { first_name, last_name, email, avatar_url, password, roles, active } = req.body;
  const data = { first_name, last_name, email, avatar_url, password, roles, active };
  res.status(200).json(await updateOneShapeHandler(models.users, data, { _id: req.params.id }, projections));
  next();
});

export const removeUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteListShapeHandler(req.query, models.users, {}));
  next();
});

export const removeUser = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteOneShapeHandler(models.users, { _id: req.params.id }));
  next();
});
