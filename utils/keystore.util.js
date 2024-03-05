import jsonwebtoken from "jsonwebtoken";
import mongoose from "mongoose";
import { ErrorResponse } from "../middlewares/errorHandler.js";
import models from "../models/index.js";
import { randomText } from "./random.util.js";

export default class Keystore {
  static async findEntryWithKeys(user_id, primary_key, secondary_key) {
    const result = await models.keystore
      .findOne({ client: user_id, primary_key: primary_key, secondary_key: secondary_key, active: true })
      .lean();
    return result;
  }
  static async findEntryWithPrimaryKey(user_id, primary_key) {
    const result = await models.keystore.findOne({ client: user_id, primary_key: primary_key, active: true }).lean();
    return result;
  }
  static async findEntryWithSecondaryKey(user_id, secondary_key) {
    const result = await models.keystore
      .findOne({ client: user_id, secondary_key: secondary_key, active: true })
      .lean();
    return result;
  }
  static async findEntryById(id) {
    const result = await models.keystore.findOne({ _id: id }).lean();
    return result;
  }
  static async remove(id) {
    await models.keystore.deleteOne({ _id: id });
  }
  static async removePrimaryKey(primary_key) {
    await models.keystore.deleteMany({ primary_key: primary_key });
  }
  static async removeSecondaryKey(secondary_key) {
    await models.keystore.deleteMany({ secondary_key: secondary_key });
  }

  static async generateKeys(user_id) {
    const accessTokenKey = randomText();
    const refreshTokenKey = randomText();

    const result = await models.keystore.create({
      client: user_id,
      primary_key: accessTokenKey,
      secondary_key: refreshTokenKey,
    });

    const entry = await models.keystore
      .findOne({ _id: result._id })
      .select("_id client primary_key secondary_key active")
      .lean();
    return entry;
  }

  static createTokens(user_id, primary_key, secondary_key, additional_payload) {
    const access_token = jsonwebtoken.sign({ ...additional_payload }, process.env.JWT_SECRET, {
      subject: user_id,
      jwtid: primary_key,
      issuer: process.env.TOKEN_ISSUER,
      audience: process.env.TOKEN_AUDIENCE,
      expiresIn: process.env.ACCESS_TOKEN_VALIDITY,
    });

    const refresh_token = jsonwebtoken.sign({}, process.env.JWT_SECRET, {
      subject: user_id,
      jwtid: secondary_key,
      issuer: process.env.TOKEN_ISSUER,
      audience: process.env.TOKEN_AUDIENCE,
      expiresIn: process.env.REFRESH_TOKEN_VALIDITY,
    });

    return { access_token, refresh_token };
  }

  static validateTokenData(payload) {
    if (
      !payload ||
      !payload.iss ||
      !payload.sub ||
      !payload.aud ||
      !payload.jti ||
      payload.iss !== process.env.TOKEN_ISSUER ||
      payload.aud !== process.env.TOKEN_AUDIENCE ||
      !mongoose.Types.ObjectId.isValid(payload.sub)
    )
      throw new ErrorResponse("Invalid Token");
    return true;
  }
}
