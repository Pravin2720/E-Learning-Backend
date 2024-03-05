import { body } from "express-validator";
import { validate } from "../middlewares/index.js";

// import getLogger from "../logger/index.js";
// const logger = getLogger(import.meta.url);

export function validateOrder(req, res, next) {
  validate([
    body("entities").exists().isArray().notEmpty(),
    body("client_total").exists().trim().notEmpty().isNumeric(),
    body("first_name").exists().trim().notEmpty().isAlpha("en-IN", { ignore: /[\s.]/ }),
    body("last_name").optional({ checkFalsy: true }).trim().isAlpha("en-IN", { ignore: /[\s.]/ }),
    body("email").exists().trim().notEmpty().isEmail(),
    body("contact").exists().trim().notEmpty().isNumeric(),
  ])(req, res, next);
}
