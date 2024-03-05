import { body } from "express-validator";
import { validate } from "../middlewares/index.js";
import mongoose from "mongoose";

// import getLogger from "../logger/index.js";
// const logger = getLogger(import.meta.url);

export function validateChapter(req, res, next) {
  validate([body("parent.entity_id").if(body("parent.entity_id").exists().notEmpty()).customSanitizer(castToObjectId)])(
    req,
    res,
    next,
  );
}

export function castToObjectId(ObjectId) {
  return mongoose.isValidObjectId(ObjectId) ? mongoose.Types.ObjectId(ObjectId) : ObjectId;
}
