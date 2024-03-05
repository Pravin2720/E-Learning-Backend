import { body } from "express-validator";
import { validate } from "../middlewares/index.js";

// import getLogger from "../logger/index.js";
// const logger = getLogger(import.meta.url);

export function validateEmail(req, res, next) {
  validate([body("email").exists().trim().notEmpty().isEmail().withMessage("please provide a valid email address.")])(
    req,
    res,
    next,
  );
}
