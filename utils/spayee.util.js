import axios from "axios";
import qs from "query-string";

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

//
// ────────────────────────────────────────────────────── I ──────────
//   :::::: H E L P E R S : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────
//

//
// ─── USERS ──────────────────────────────────────────────────────────────────────
//

export async function createSpayeeUser(email, name) {
  logger.debug("creating Spayee user", email, name);
  const data = qs.stringify({
    email,
    name,
    mid: process.env.SPAYEE_MERCHANT_ID,
    key: process.env.SPAYEE_API_KEY,
    sendEmail: false,
  });
  const createUserResponse = await axios.post(`${process.env.SPAYEE_ADMIN_API_URL}/v1/learners`, data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (
    createUserResponse?.status !== 200 ||
    (createUserResponse?.status === 200 && createUserResponse?.data?.error?.code !== 22)
  ) {
    logger.error("Spayee user creation failed");
    logger.debug("Spayee user creation failed", email, name, createUserResponse);
    throw new Error("Spayee user creation failed");
  }

  return createUserResponse.data;
}

//
// ─── ASSIGN ─────────────────────────────────────────────────────────────────────
//

export async function assignSpayeeProduct(email, productId) {
  logger.info("creating Spayee enrollment with [email] [productId]", email, productId);
  const data = qs.stringify({ productId, email, mid: process.env.SPAYEE_MERCHANT_ID, key: process.env.SPAYEE_API_KEY });
  const assignmentResponse = await axios.post(`${process.env.SPAYEE_ADMIN_API_URL}/v1/assign`, data, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  if (assignmentResponse) {
    if (assignmentResponse.status !== 200 || assignmentResponse?.error?.code === 19) {
      logger.error("Spayee product assignment failed");
      logger.debug("Spayee product assignment failed", email, productId, assignmentResponse);
      throw new Error("Spayee product assignment failed");
    }
  }
  return assignmentResponse.data;
}
