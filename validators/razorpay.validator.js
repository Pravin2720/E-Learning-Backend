import { body } from "express-validator";
import getLogger from "../logger/index.js";

const logger = getLogger(import.meta.url);

export function validateWebhook(req, res, next) {
  next();
}
export function validateCallback(req, res, next) {
  next();
}
