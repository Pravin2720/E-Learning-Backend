import crypto from "crypto";
import qs from "qs";
import Razorpay from "razorpay";
import getRazorpayClient from "../utils/razorpay_client.util.js";
import { asyncHandler, ErrorResponse, ErrorResponseWrapper } from "../middlewares/index.js";
import models from "../models/index.js";
import { processOrders, processPayments } from "../tasks/index.js";

// Load env vars
import { config } from "dotenv";
config({ path: "./config/config.env" });

import getLogger from "../logger/index.js";
const logger = getLogger(import.meta.url);

//
// ──────────────────────────────────────────────────── I ──────────
//   :::::: O R D E R S : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────
//

export const orderFollowUpAction = asyncHandler(async (req, res, next) => {
  processOrders();
  res.status(200).json({ message: "Success" });
  next();
});

export async function createOrder(amount, env = "live") {
  logger.info("creating order");
  logger.debug("creating order with env", env);
  const instance = getRazorpayClient(env);
  var options = {
    amount: amount, // amount in the smallest currency unit
    currency: "INR",
  };
  logger.debug("creating order with options", options);
  try {
    const order = await instance.orders.create(options);
    logger.info("RZP order created");
    logger.debug(order);
    return order;
  } catch (error) {
    logger.info("RZP order creation error");
    logger.error(error);
    throw ErrorResponseWrapper(error);
  }
}

//
// ──────────────────────────────────────────────────────── I ──────────
//   :::::: P A Y M E N T S : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────
//

export const paymentFollowUpAction = asyncHandler(async (req, res, next) => {
  processPayments();
  res.status(200).json({ message: "Success" });
  next();
});

export async function capturePayment(payment_id, amount, currency = "INR", env = "live") {
  logger.info("capturing payment");
  logger.debug("capturing payment with env", env);
  const instance = getRazorpayClient(env);
  var options = {
    payment_id: payment_id,
    amount: amount, // amount in the smallest currency unit
    currency: currency,
  };
  logger.debug("capturing payment with options", options);
  try {
    const payment = await instance.payments.capture(payment_id, amount, currency);
    logger.info("RZP payment captured");
    logger.debug(payment);
    return payment;
  } catch (error) {
    logger.info("RZP payment capture error");
    logger.error(error);
    throw ErrorResponseWrapper(error);
  }
}

//
// ──────────────────────────────────────────────────────── I ──────────
//   :::::: W E B H O O K S : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────────────
//

export const webhookReceive = asyncHandler(async (req, res, next) => {
  const event_id = req.header("x-razorpay-event-id");
  logger.info("event_id ", event_id);
  const signature = req.header("x-razorpay-signature");
  logger.info("signature ", signature);
  const body = JSON.stringify(req.body);

  // lookup with event id to decide whether we got a duplicate event
  var webhook = await models.webhooks.findOne({ header_event_id: event_id }).lean();

  // if it's not a duplicate then save it
  if (!webhook)
    webhook = await models.webhooks.create({ header_event_id: event_id, data: req.body, signature: signature });

  // if we have not yet verified the event, then verify signature against the webhook secret
  logger.debug("pre validation > valid: ", webhook.valid);

  if (!webhook.valid) {
    let valid = Razorpay.validateWebhookSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET);
    // if you have changed the webhook secret recently,
    // then the events for payments / orders initiated with the old webhook secret will fail the verification.
    // So verify against the old value if it exists.
    if (!valid && process.env.RAZORPAY_WEBHOOK_SECRET_OLD) {
      valid = Razorpay.validateWebhookSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET_OLD);
    }
    // repeat to handle TEST MODE webhooks
    if (!valid && process.env.RAZORPAY_TEST_WEBHOOK_SECRET) {
      valid = Razorpay.validateWebhookSignature(body, signature, process.env.RAZORPAY_TEST_WEBHOOK_SECRET);
    }
    if (!valid && process.env.RAZORPAY_TEST_WEBHOOK_SECRET_OLD) {
      valid = Razorpay.validateWebhookSignature(body, signature, process.env.RAZORPAY_TEST_WEBHOOK_SECRET_OLD);
    }

    logger.debug("post validation > valid: ", valid);
    if (!valid) {
      logger.error("Webhook signature invalid");
      throw new ErrorResponse("Webhook signature invalid");
    }
    // update that event is valid
    await models.webhooks.updateOne({ _id: webhook._id }, { $set: { valid: valid, updated_at: Date.now() } });
  }

  // send ack for the event
  res.status(202).json({ message: "Success" });
  await models.webhooks.updateOne({ _id: webhook._id }, { $set: { ack_sent: true, updated_at: Date.now() } });

  // parse the payload and put the data into appropriate collections
  webhookParser(webhook.header_event_id);
  next();
});

async function webhookParser(event_id) {
  var webhook = await models.webhooks.findOne({ header_event_id: event_id }).lean();

  await paymentParser(webhook);
  await orderParser(webhook);
}

// --------------------------------------------------------------------------------------------------------------------------------

const eventPriority = {
  failed: 0,
  authorized: 1,
  captured: 2,
  paid: 3,
};

const getPriority = (value) => {
  // the order of the events can be tangled sometimes.
  // according to Razorpay Documentation, the captured event can be received even before we receive the authorized event.
  // reasons can be many unknown factors in the network.
  // thus handle the data properly so as not to overwrite them with wrong data.
  return eventPriority[value] !== undefined && eventPriority[value] !== null ? eventPriority[value] : -1;
};

function updateEntityByStatus(entity, newEntity) {
  if (!entity.data) entity.data = {};
  let new_data = {};
  new_data[newEntity.status] = { ...newEntity };
  entity.data = { ...entity.data, ...new_data };
  entity.updated_at = Date.now();
  entity.markModified("data");

  if (getPriority(newEntity.status) >= getPriority(entity.status)) {
    entity.status = newEntity.status;
    if (newEntity.order_id) entity.order_id = newEntity.order_id;
    entity.notes = { ...entity.notes, ...newEntity.notes };
    entity.followup_action_status = "pending";
  }
  return entity;
}

async function paymentParser(webhook) {
  if (webhook.data.contains && webhook.data.contains.indexOf("payment") === -1) return;
  const paymentEntity = webhook.data.payload.payment.entity;
  const paymentId = paymentEntity.id;
  let payment = await models.payments.findOne({ payment_id: paymentId });

  let newPayment = null;
  if (payment) {
    // update existing
    newPayment = updateEntityByStatus(payment, paymentEntity);
  } else {
    // create new
    let currentData = {};
    currentData[paymentEntity.status] = paymentEntity;
    newPayment = new models.payments({
      payment_id: paymentEntity.id,
      status: paymentEntity.status,
      data: currentData,
      order_id: paymentEntity.order_id,
      notes: paymentEntity.notes,
    });
  }
  if (newPayment) await newPayment.save();
}

async function orderParser(webhook) {
  if (Array.isArray(webhook.data.contains) && webhook.data.contains.indexOf("order") === -1) return;
  const orderEntity = webhook.data.payload.order.entity;
  const orderId = orderEntity.id;
  let order = await models.orders.findOne({ order_id: orderId });

  let newOrder = null;
  if (order) {
    // update existing
    newOrder = updateEntityByStatus(order, orderEntity);
  } else {
    // create new
    let currentData = {};
    currentData[orderEntity.status] = { ...orderEntity };
    newOrder = new models.orders({
      order_id: orderEntity.id,
      status: orderEntity.status,
      data: currentData,
      notes: orderEntity.notes,
    });
  }
  if (newOrder) await newOrder.save();
}

export const paymentSuccess = asyncHandler(async (req, res, next) => {
  // getting the details back from our front-end
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const { origin, route, location, ...rest } = req.query;
  logger.debug(`origin:${origin} | route:${route} | location:${location}`, req.query);

  let order = await models.orders.findOne({ order_id: razorpay_order_id }).lean();
  if (!order) {
    logger.error(`No order exists with id ${razorpay_order_id}\n${JSON.stringify(req.body.error)}`);
    res.redirect(302, `${origin}${location}?${qs.stringify({ error: req.body.error })}`);
    return;
  }
  // Creating our own digest
  // The format should be like this:
  // digest = hmac_sha256(orderCreationId + "|" + razorpayPaymentId, secret);
  if (order.valid !== "valid") {
    let valid = false;
    logger.info("comparing hash... (live mode)");
    const shasum = crypto.createHmac("sha256", process.env.RAZORPAY_API_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest("hex");

    // comparing our digest with the actual signature
    valid = digest !== razorpay_signature;

    if (!valid) {
      logger.info("comparing hash... (test mode)");
      // check if order is for TEST MODE
      const shasum_test = crypto.createHmac("sha256", process.env.RAZORPAY_TEST_API_KEY_SECRET);
      shasum_test.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest_test = shasum_test.digest("hex");

      // comparing our digest with the actual signature
      valid = digest_test !== razorpay_signature;
    }
    if (valid === false) {
      logger.error(`transaction not valid! ${razorpay_signature}\n${digest}`);
      res.redirect(
        302,
        `${origin}${location}?${qs.stringify({
          error: { description: "Transaction Not Valid", step: "payment_validation" },
        })}`,
      );
      return;
    }
    // THE PAYMENT IS LEGIT & VERIFIED
    // YOU CAN SAVE THE DETAILS IN YOUR DATABASE IF YOU WANT
    const result = await models.orders.updateOne(
      { order_id: razorpay_order_id },
      { $set: { valid: "valid", updated_at: Date.now() } },
    );
    logger.debug("transaction marked valid for order id:", razorpay_order_id, result);
  }

  // redirect according to allowed origins if origin and route provided
  if (origin && process.env.ALLOWED_ORIGINS.indexOf(origin) !== -1) {
    const url = `${origin}${route}?${qs.stringify(rest)}`;
    logger.debug("redirecting to", url);
    res.redirect(302, url);
  } else {
    logger.debug("redirecting to school as origin not provided or not allowed");
    res.redirect(302, "https://learn.valuationary.com/s/mycourses");
  }
});
