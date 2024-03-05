import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { asyncHandler } from "./async.js";
import { ErrorResponse } from "./errorHandler.js";

// import getLogger from "../logger/index.js";
// const logger = getLogger(import.meta.url);

export const authenticate = asyncHandler((req, res, next) => {
  const authorization = req.headers?.authorization ?? "";
  const access_token = authorization.startsWith("bearer") ? authorization.split("bearer ")[1] ?? null : null;
  if (!access_token) throw new ErrorResponse("No token provided!", 401);

  req.sessionToken = access_token;
  req.user = jsonwebtoken.verify(access_token, process.env.JWT_SECRET);

  if (!req.user) throw new ErrorResponse("Unauthentic!", 401);
  next();
});

export function authorize(roles) {
  return asyncHandler((req, res, next) => {
    let valid_role = false;
    for (const role of roles) {
      valid_role = req.user.roles.indexOf(role) >= 0;
      if (valid_role) {
        req.authorized_admin = req.user.roles.indexOf("admin") >= 0;
        break;
      }
    }

    if (!valid_role) throw new ErrorResponse("You are not authorized to access this resource", 403);
    next();
  });
}

export async function encryptPassword(password) {
  return await bcrypt.hash(password, 8);
}
