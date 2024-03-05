import { body } from "express-validator";
import moment from "moment";
import { validate } from "../middlewares/index.js";

// import getLogger from "../logger/index.js";
// const logger = getLogger(import.meta.url);

export function validateApplyCoupon(req, res, next) {
  // prettier-ignore
  validate([
    body("code").exists().trim().notEmpty().isAlphanumeric(),
    body("entities").exists().isArray().notEmpty(),
  ])(req, res, next);
}

export function validateCoupon(req, res, next) {
  validate([
    body("starts_at").optional({ checkFalsy: true }).customSanitizer(convertDateToTimestamp),
    body("expires_at").optional({ checkFalsy: true }).customSanitizer(convertDateToTimestamp),
  ])(req, res, next);
}

function convertDateToTimestamp(value) {
  return moment(value, moment.ISO_8601).valueOf();
}
