import cron from "node-cron";
import models from "../models/index.js";
import { capturePayment } from "../controllers/index.js";

import getLogger from "../logger/index.js";
const logger = getLogger("tasks");

//
// ──────────────────────────────────────────────── I ──────────
//   :::::: M A I N : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────
//

const isNNO = (o) => typeof o === "object" && o !== null;

//
// ─── FAILED PAYMENTS ────────────────────────────────────────────────────────────
//

async function processFailedPayment(payment) {
  logger.info("processing failed payment", payment.payment_id);
  // update "pending" to "in progress"
  await models.payments.updateOne(
    { payment_id: payment.payment_id },
    { $set: { followup_action_status: "in progress", updated_at: Date.now() } },
  );
  logger.info("updated [followup_action_status]: in progress");

  //
  // ─── UPDATE ORDER IF NOT ALREADY PAID OR VALID ──────────────────────────────────
  //

  const captured_payments = await models.payments
    .find({ order_id: payment.order_id, status: { $in: ["captured", "authorized"] } })
    .lean();
  logger.debug("does order have other captured payments?", captured_payments);
  if (captured_payments.length === 0) {
    const result = await models.orders.updateOne(
      {
        order_id: payment.order_id,
        status: { $ne: "paid" },
        valid: { $ne: "valid" },
      },
      { $set: { status: payment.status, followup_action_status: "pending", updated_at: Date.now() } },
    );
    logger.debug("failed payment > updating order result", result);
  }

  //
  // ─── UPDATE COMPLETION ───────────────────────────────────────────
  //

  await models.payments.updateOne(
    { payment_id: payment.payment_id },
    { $set: { followup_action_status: "finished", updated_at: Date.now() } },
  );
  logger.info("updated [followup_action_status] finished");
}

//
// ─── AUTHORIZED PAYMENTS ────────────────────────────────────────────────────────
//

async function processPayment(payment) {
  logger.info("processing payment", payment.payment_id);
  // update "pending" to "in progress"
  await models.payments.updateOne(
    { payment_id: payment.payment_id },
    { $set: { followup_action_status: "in progress", updated_at: Date.now() } },
  );
  logger.info("updated [followup_action_status]: in progress");

  const data = isNNO(payment.data[payment.status]) ? payment.data[payment.status] : {};

  const test_emails = await models.variables.findOne({ key: "payment_test_emails" }).lean();
  var mode = "live";
  if (
    typeof test_emails === "object" &&
    Array.isArray(test_emails.value) &&
    test_emails.value.indexOf(data.email) !== -1
  ) {
    mode = "test";
  }

  const result = await capturePayment(data.id, data.amount, data.currency, mode);
  logger.debug(result);

  //
  // ─── UPDATE COMPLETION ───────────────────────────────────────────
  //

  await models.payments.updateOne(
    { payment_id: payment.payment_id },
    { $set: { followup_action_status: "finished", updated_at: Date.now() } },
  );
  logger.info("updated [followup_action_status] finished");
}

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export async function processPayments() {
  logger.info("payment processing...");

  // set clear state of payments once updated by "captured" webhooks
  let dirty_payments = await models.payments.find({ status: "captured", followup_action_status: "pending" }).lean();
  for (let payment of dirty_payments) {
    await models.payments.updateOne(
      { payment_id: payment.payment_id },
      { $set: { followup_action_status: "not required", updated_at: Date.now() } },
    );
    logger.info("updated [followup_action_status] not required");
  }

  let filter_date = Date.now();
  // subtract 14 minutes in milliseconds
  filter_date = filter_date - 14 * 60 * 1000;
  // go through all the "failed" status entries created 14 mins ago
  let failed_payments = await models.payments
    .find({ status: "failed", followup_action_status: "pending", created_at: { $lt: filter_date } })
    .lean();

  for (let payment of failed_payments) {
    try {
      await processFailedPayment(payment);
    } catch (error) {
      await models.payments.updateOne(
        { payment_id: payment.payment_id },
        { $set: { followup_action_status: "error", updated_at: Date.now() } },
      );
      logger.info("updated [followup_action_status] error");
      logger.error(error);
    }
  }

  filter_date = Date.now();
  // subtract 5 days in milliseconds
  filter_date = filter_date - 5 * 24 * 60 * 60 * 1000;
  // go through all the "authorized" status entries
  let payments = await models.payments
    .find({ status: "authorized", followup_action_status: "pending", created_at: { $gt: filter_date } })
    .lean();

  for (let payment of payments) {
    try {
      await processPayment(payment);
    } catch (error) {
      await models.payments.updateOne(
        { payment_id: payment.payment_id },
        { $set: { followup_action_status: "error", updated_at: Date.now() } },
      );
      logger.info("updated [followup_action_status] error");
      logger.error(error);
    }
  }
}

//
// ────────────────────────────────────────────────────── I ──────────
//   :::::: E X P O R T S : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────
//

export const paymentsProcessingTask = cron.schedule(
  "30 */1 * * * *",
  () => {
    processPayments();
  },
  { scheduled: false },
);
