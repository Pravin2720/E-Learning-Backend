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

export const addWorkshop = asyncHandler(async (req, res, next) => {
  const {
    title,
    slug,
    spayee_product_id,
    short_description,
    long_description,
    workshop_date,
    workshop_time,
    image_url,
    markup_price,
    offer_price,
    instructors,
    active,
  } = req.body;
  const data = {
    title,
    slug,
    spayee_product_id,
    short_description,
    long_description,
    workshop_date,
    workshop_time,
    image_url,
    markup_price,
    offer_price,
    instructors,
    active,
  };
  res.status(200).json(await createShapeHandler(models.workshops, data));
  next();
});

export const listWorkshops = asyncHandler(async (req, res, next) => {
  const results = await readListShapeHandler(req.query, models.workshops, {}, ["-__v"]);
  res.status(200).json(results);
  next();
});

export const getWorkshop = asyncHandler(async (req, res, next) => {
  const result = await readOneShapeHandler(
    models.workshops,
    { $or: [{ _id: req.params.id }, { slug: req.params.id }] },
    ["-__v"],
  );
  res.status(200).json({ data: { ...result.data, id: result.data.slug } });
  next();
});

export const editWorkshop = asyncHandler(async (req, res, next) => {
  const {
    title,
    slug,
    spayee_product_id,
    short_description,
    long_description,
    workshop_date,
    workshop_time,
    image_url,
    markup_price,
    offer_price,
    instructors,
    active,
  } = req.body;
  const data = {
    title,
    slug,
    spayee_product_id,
    short_description,
    long_description,
    workshop_date,
    workshop_time,
    image_url,
    markup_price,
    offer_price,
    instructors,
    active,
  };
  res.status(200).json(await updateOneShapeHandler(models.workshops, data, { _id: req.params.id }, ["-__v"]));
  next();
});

export const removeWorkshops = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteListShapeHandler(req.query, models.workshops, {}));
  next();
});

export const removeWorkshop = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteOneShapeHandler(models.workshops, { _id: req.params.id }));
  next();
});
