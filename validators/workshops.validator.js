import { body } from "express-validator";
import getLogger from "../logger/index.js";

const logger = getLogger(import.meta.url);

export function validateWorkshop(req, res, next) {
  next();
}
