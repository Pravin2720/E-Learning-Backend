import { validationResult } from "express-validator";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

// parallel processing
export const validate = (validations) => {
  return async (req, res, next) => {
    const validation_results = validations.map((validation) => validation.run(req));
    await Promise.all(validation_results);

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    logger.debug(errors.array());
    res.status(422).json({ errors: errors.array() });
  };
};

// sequential processing, stops running validations chain if the previous one have failed.
export const validateSync = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    logger.debug(errors.array());
    res.status(422).json({ errors: errors.array() });
  };
};
