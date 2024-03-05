import getLogger from "../logger/index.js";

const logger = getLogger("http");
export class ErrorResponse extends Error {
  constructor(message, statusCode, stack) {
    super(message);
    this.statusCode = statusCode;
    if (stack) this.stack = stack;
  }
}

export function ErrorResponseWrapper(err) {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  switch (error.name) {
    case "MongoServerError":
      error.message = "Invalid Request";
      error.statusCode = 400;
      break;
    case "ValidationError":
      error.message = Object.values(err.errors).map((val) => val.message);
      error.statusCode = 422;
      break;
    case "CastError":
      error.message = "Request is made with invalid data";
      error.statusCode = 400;
      break;
    case "JsonWebTokenError":
      error.statusCode = 401;
      break;
    case "TokenExpiredError":
      error.message = "Token Expired";
      error.statusCode = 401;
      break;
  }
  return new ErrorResponse(error.message, error.statusCode, error.stack);
}

export const errorHandler = (err, req, res, next) => {
  logger.addContext("res", res);
  if (err) {
    let error = ErrorResponseWrapper(err);
    res.status(error.statusCode || 500).json({
      error: error.message || "Internal Server Error",
      debug: err.message,
    });
    logger.error(error);
  }
  next();
};
