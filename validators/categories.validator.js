import { body } from "express-validator";
import getLogger from "../logger/index.js";

const logger = getLogger(import.meta.url);

export function validateCategory(req, res, next) {
  next();
}
