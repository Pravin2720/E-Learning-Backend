import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";
import models from "../models/index.js";
import sendEmail from "../services/aws_ses.service.js";
import { createResetLinkText } from "../services/email.templates.js";
import Keystore from "../utils/keystore.util.js";
import getGoogleClient from "../utils/google_client.util.js";
import { asyncHandler, ErrorResponse } from "../middlewares/index.js";
import { createSpayeeUser } from "../utils/spayee.util.js";
import { randomText } from "../utils/random.util.js";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

export const signUp = asyncHandler(async (req, res, next) => {
  // save to DB
  const user = {
    first_name: req.body.first_name ?? "",
    last_name: req.body.last_name ?? "",
    email: req.body.email,
    password: req.body.password,
    roles: req.body.roles,
  };
  const result = await models.users.create(user);
  logger.debug("signUp result", result);

  try {
    const response = await createSpayeeUser(user.email, [user.first_name, user.last_name].join(" ").trim());
    logger.debug("spayee user creation response", response);
  } catch (error) {
    logger.error(error);
  }

  res.status(200).json({ message: "Success" });
  next();
});

// @ts-ignore
export const googleAuth = asyncHandler(async (req, res, next) => {
  // const { origin, route, location } = req.query;
  // logger.debug(`origin:${origin} | route:${route} | location:${location}`, req.query);

  const googleClient = getGoogleClient();
  const ticket = await googleClient.verifyIdToken({
    idToken: req.body.credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { family_name, given_name, email, picture } = ticket.getPayload();

  const upsert_result = await models.users.updateOne(
    { email: email },
    {
      $set: { avatar_url: picture },
      $setOnInsert: { first_name: given_name ?? "", last_name: family_name ?? "", email: email, roles: req.body.roles },
    },
    { upsert: true },
  );
  logger.debug("googleAuth upsert result", upsert_result);

  const result = await models.users.findOne({ email }).populate("roles", "name -_id").lean();
  const { password, roles, ...user } = result;
  req.user = { ...user, roles: Array.isArray(roles) ? roles.map((role) => role.name) : [] };
  const keystore = await Keystore.generateKeys(user._id);
  req.keystore_id = keystore._id;

  try {
    const response = await createSpayeeUser(user.email, [user.first_name, user.last_name].join(" ").trim());
    logger.debug("spayee user creation response", response);
  } catch (error) {
    logger.error(error);
  }

  next();
});

// @ts-ignore
export const logIn = asyncHandler(async (req, res, next) => {
  const result = await models.users.findOne({ email: req.body.email }).populate("roles", "name -_id").lean();
  // No user found
  if (!result) throw new ErrorResponse("User not registered", 404);
  const { password, roles, ...user } = result;
  if (!password) throw new ErrorResponse("Credential not set", 401);

  // validate password
  let passwordIsValid = await bcrypt.compare(req.body.password, password);
  if (!passwordIsValid) throw new ErrorResponse("Invalid password", 401);

  req.user = { ...user, roles: Array.isArray(roles) ? roles.map((role) => role.name) : [] };
  const keystore = await Keystore.generateKeys(user._id);
  req.keystore_id = keystore._id;

  try {
    const response = await createSpayeeUser(user.email, [user.first_name, user.last_name].join(" ").trim());
    logger.debug("spayee user creation response", response);
  } catch (error) {
    logger.error(error);
  }

  next();
});

export const passwordStatus = asyncHandler(async (req, res, next) => {
  const result = await models.users.findOne({ email: req.body.email }).select("password").lean();
  result ? res.status(200).json({ hasPassword: Boolean(result.password) }) : res.sendStatus(204);
  next();
});

export const passwordSet = asyncHandler(async (req, res, next) => {
  const user = await models.users.findOne({ email: req.body.email }).select("password").lean();
  if (typeof user.password === "string" && user.password.length > 0) {
    throw new ErrorResponse("Password is already set", 409);
  } else {
    const result = await models.users.updateOne({ email: req.body.email }, { $set: { password: req.body.password } });
    logger.debug("passwordSet updateOne result", result);
    res.status(200).json({ status: "success" });
  }
  next();
});

export const passwordResetInit = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await models.users.findOne({ email }).select("email first_name last_name").lean();
  if (!user) throw new ErrorResponse("Email not found", 409);

  const { first_name, last_name } = user;
  const user_name = [first_name, last_name].join(" ");
  const code = randomText();
  const expire_at = Date.now() + 15 * 60 * 1000;

  const result = await models.forget_passwords.create({ email, code, expire_at });
  logger.debug("passwordResetInit create result", result);

  const emailData = await sendEmail(
    [email],
    "Valuationary | Password Reset",
    createResetLinkText(
      user_name,
      `${process.env.SERVER_ORIGIN}/reset?phase=reset&email=${email}&code=${encodeURIComponent(code)}`,
    ),
  );
  logger.debug("passwordResetInit emailData", emailData);
  res.status(200).json({ status: "success" });

  next();
});

export const passwordReset = asyncHandler(async (req, res, next) => {
  const { email, code, password } = req.body;
  const user = await models.users.findOne({ email: email }).select("email").lean();
  if (!user) throw new ErrorResponse("Email not found", 409);

  const valid_entry = await models.forget_passwords.findOne({ email: email, code: code, active: true });
  logger.debug("passwordReset findOne valid_entry", valid_entry);
  if (!valid_entry) throw new ErrorResponse("Invalid code", 409);

  const entry_consumed = await models.forget_passwords.updateOne(
    { _id: valid_entry._id },
    { $set: { consumed_at: Date.now(), active: false } },
  );
  logger.debug("passwordReset updateOne entry_consumed", entry_consumed);

  if (valid_entry.expire_at <= Date.now()) throw new ErrorResponse("Time window expired", 409);

  const result = await models.users.updateOne({ email: email }, { $set: { password: password } });
  logger.debug("passwordReset updateOne result", result);
  res.status(200).json({ status: "success" });

  next();
});

//
// ─── JWT ────────────────────────────────────────────────────────────────────────
//

export const generateJWT = asyncHandler(async (req, res, next) => {
  const user = req.user;
  // No user found
  if (!user) throw new ErrorResponse("Credential generation failed. No user found.", 404);

  const keystore = await Keystore.findEntryById(req.keystore_id);
  // No keystore found
  if (!keystore) throw new ErrorResponse("Credential generation failed. No session found.", 501);

  // prepare payload for access token and refresh token
  const additional_payload = {
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    roles: user.roles,
    permissions: user.permissions,
  };
  const { access_token, refresh_token } = Keystore.createTokens(
    user._id.toString(),
    keystore.primary_key,
    keystore.secondary_key,
    additional_payload,
  );

  res.set("authorization", `bearer ${access_token}`);
  res.set("reauthorization", `bearer ${refresh_token}`);
  res.status(200).json({});
  next();
});

export const invalidateJWT = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization ?? "";
  const access_token = authorization.startsWith("bearer") ? authorization.split("bearer ")[1] ?? null : null;
  if (access_token) {
    const access_token_payload = jsonwebtoken.decode(access_token);
    Keystore.validateTokenData(access_token_payload);
    // @ts-ignore
    await Keystore.removePrimaryKey(access_token_payload.jti);
  }

  const reauthorization = req.headers.reauthorization ?? "";
  const refresh_token = reauthorization.startsWith("bearer") ? reauthorization.split("bearer ")[1] ?? null : null;
  if (refresh_token) {
    const refresh_token_payload = jsonwebtoken.decode(refresh_token);
    Keystore.validateTokenData(refresh_token_payload);
    // @ts-ignore
    await Keystore.removeSecondaryKey(refresh_token_payload.jti);
  }

  res.status(200).json({});
  next();
});

// @ts-ignore
export const refreshJWT = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization ?? "";
  const access_token = authorization.startsWith("bearer") ? authorization.split("bearer ")[1] ?? null : null;
  if (!access_token) throw new ErrorResponse("Access Token not provided", 401);

  const access_token_payload = jsonwebtoken.decode(access_token);
  Keystore.validateTokenData(access_token_payload);
  const user_id = access_token_payload.sub;

  const reauthorization = req.headers.reauthorization ?? "";
  const refresh_token = reauthorization.startsWith("bearer") ? reauthorization.split("bearer ")[1] ?? null : null;
  if (!refresh_token) throw new ErrorResponse("Refresh Token not provided", 401);

  const refresh_token_payload = jsonwebtoken.verify(refresh_token, process.env.JWT_SECRET);
  Keystore.validateTokenData(refresh_token_payload);

  if (access_token_payload.sub !== refresh_token_payload.sub) throw new ErrorResponse("Invalid Token Pair", 401);

  // @ts-ignore
  const old_keystore = await Keystore.findEntryWithKeys(user_id, access_token_payload.jti, refresh_token_payload.jti);
  if (!old_keystore) throw new ErrorResponse("Invalid Token Pair", 401);
  await Keystore.remove(old_keystore._id);

  const result = await models.users
    // @ts-ignore
    .findOne({ _id: new mongoose.Types.ObjectId(user_id) })
    .populate("roles", "name -_id")
    .lean();
  const { password, roles, ...user } = result;
  req.user = { ...user, roles: Array.isArray(roles) ? roles.map((role) => role.name) : [] };
  const keystore = await Keystore.generateKeys(user._id);
  req.keystore_id = keystore._id;

  next();
});

export const generateThinkificJWT = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) throw new ErrorResponse("User not found", 404);

  // prepare payload required for Thinkific SSO
  const payload = {
    email: user.email,
    first_name: "Valuationary",
    last_name: "School",
    iat: Date.now(),
    external_id: user.email,
  };

  let token = jsonwebtoken.sign({ ...payload }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

  res.status(200).json({ payload: token });
  next();
});

export const generateSpayeeJWT = asyncHandler(async (req, res, next) => {
  const user = req.user;
  if (!user) throw new ErrorResponse("User not found", 404);

  // prepare payload required for Spayee SSO
  const payload = {
    email: user.email,
    name: [user.first_name, user.last_name].join(" "),
  };

  let token = jsonwebtoken.sign({ ...payload }, process.env.SPAYEE_API_KEY, { expiresIn: process.env.JWT_EXPIRE });

  res.status(200).json({ payload: token });
  next();
});
