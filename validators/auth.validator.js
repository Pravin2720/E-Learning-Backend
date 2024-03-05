import { body } from "express-validator";
import { encryptPassword, validate } from "../middlewares/index.js";
import models from "../models/index.js";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

export async function checkDuplicateEmail(email) {
  const result = await models.users.findOne({ email: email }).lean();
  return result ? Promise.reject("Email is already in use!") : true;
}

export async function checkRoleExisted(roles) {
  if (roles !== undefined && !Array.isArray(roles)) return Promise.reject("roles should be an array.");
  roles ??= [];

  // validate all roles
  const results = await models.roles.find({ name: { $in: roles } }).lean();
  if (results.length === roles.length) return;

  // find invalid roles
  let invalid_roles = [...roles];
  results.forEach((role) => invalid_roles.splice(invalid_roles.indexOf(role.name), role && role.name ? 1 : 0));
  logger.error("invalid roles", invalid_roles);
  // error if any invalid role found
  return invalid_roles.length > 0 ? Promise.reject(`following are not valid roles: ${invalid_roles.join(", ")}`) : true;
}

export async function convertRolesToID(roles) {
  roles ??= ["user"];
  // set valid roles in body
  const results = await models.roles.find({ name: { $in: roles } }).lean();
  results.forEach((role) => roles.splice(roles.indexOf(role.name), 1, String(role._id)));
  return roles;
}

export function validateGoogleAuth(req, res, next) {
  validate([
    body("credential").exists().trim().notEmpty(),
    body("roles").custom(checkRoleExisted).bail().customSanitizer(convertRolesToID).exists().notEmpty(),
  ])(req, res, next);
}

export function validateLogIn(req, res, next) {
  validate([
    body("email").exists().trim().notEmpty().isEmail(),
    body("password").exists().notEmpty().isLength({ min: 5 }),
  ])(req, res, next);
}

export function validatePasswordResetInit(req, res, next) {
  validate([body("email").exists().bail().trim().notEmpty().bail().isEmail()])(req, res, next);
}

export function validatePasswordReset(req, res, next) {
  validate([
    body("email").exists().bail().trim().notEmpty().bail().isEmail(),
    body("password").exists().notEmpty().isLength({ min: 5 }).bail().customSanitizer(encryptPassword),
    body("code").exists().bail().notEmpty().bail().isLength({ min: 128, max: 128 }),
  ])(req, res, next);
}

export function validateCredential(req, res, next) {
  validate([
    body("email").exists().bail().trim().notEmpty().bail().isEmail(),
    body("password_retyped")
      .exists()
      .bail()
      .notEmpty()
      .bail()
      .isLength({ min: 5 })
      .bail()
      .custom((password_retyped, { req }) => password_retyped === req.body.password)
      .withMessage("Password does not match"),
    body("password").exists().bail().notEmpty().bail().isLength({ min: 5 }).customSanitizer(encryptPassword),
  ])(req, res, next);
}

export function validateSignUp(req, res, next) {
  validate([
    body("first_name").exists().trim().notEmpty().isAlpha("en-IN", { ignore: /[\s.]/ }),
    body("last_name").optional({ checkFalsy: true }).trim().isAlpha("en-IN", { ignore: /[\s.]/ }),
    body("email").exists().trim().notEmpty().isEmail().bail().custom(checkDuplicateEmail),
    body("password").exists().notEmpty().isLength({ min: 5 }).bail().customSanitizer(encryptPassword),
    body("roles").custom(checkRoleExisted).bail().customSanitizer(convertRolesToID).exists().notEmpty(),
  ])(req, res, next);
}
