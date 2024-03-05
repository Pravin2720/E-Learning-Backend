import cron from "node-cron";
import models from "../models/index.js";
import thinkificAxios from "../utils/axios.util.js";
import { assignSpayeeProduct } from "../utils/spayee.util.js";
import {
  getThinkificUser,
  createThinkificUser,
  handleThinkificCourseEnrollment,
  handleThinkificBundleEnrollment,
} from "../utils/thinkific.util.js";

import getLogger from "../logger/index.js";
import { EntityTypeModelMap } from "../utils/order.util.js";
const logger = getLogger("tasks");

//
// ──────────────────────────────────────────────── I ──────────
//   :::::: M A I N : :  :   :    :     :        :          :
// ──────────────────────────────────────────────────────────
//

const isNNO = (o) => typeof o === "object" && o !== null;

function findProp(target, prop) {
  if (isNNO(target.notes) && target.notes[prop]) {
    return target.notes[prop];
  } else {
    if (target.data && isNNO(target.data[target.status]) && target.data[target.status][prop]) {
      return target.data[target.status][prop];
    }
    if (target.data && isNNO(target.data[target.status].notes) && target.data[target.status].notes[prop]) {
      return target.data[target.status].notes[prop];
    }
  }
  return null;
}

//
// ─── FAILED ORDERS ──────────────────────────────────────────────────────────────
//

async function processFailedOrder(order) {
  logger.info("processing failed order", order.order_id);
  // update pending to "in progress"
  await models.orders.updateOne(
    { order_id: order.order_id },
    { $set: { followup_action_status: "in progress", updated_at: Date.now() } },
  );
  logger.info("updated [followup_action_status]: in progress");

  //
  // ─── SALVAGE COUPON ─────────────────────────────────────────────────────────────
  //

  if (order.coupon_applied) {
    const result = await models.coupons.updateOne(
      { code: order.coupon_applied, quantity: { $ne: null } },
      { $inc: { quantity: 1 }, $set: { updated_at: Date.now() } },
    );
    logger.info("coupon increment result:", result);
  }

  //
  // ─── UPDATE COMPLETION ───────────────────────────────────────────
  //

  await models.orders.updateOne(
    { order_id: order.order_id },
    { $set: { followup_action_status: "finished", updated_at: Date.now() } },
  );
  logger.info("updated [followup_action_status] finished");
}

//
// ─── PAID ORDERS ────────────────────────────────────────────────────────────────
//

async function processOrder(order) {
  logger.info("processing order", order.order_id);
  // update pending to "in progress"
  await models.orders.updateOne(
    { order_id: order.order_id },
    { $set: { followup_action_status: "in progress", updated_at: Date.now() } },
  );
  logger.info("updated [followup_action_status]: in progress");

  if (process.env.THINKIFIC_AUTO_ENROLLMENTS === "true") await thinkificEnrollment(order);
  if (process.env.SPAYEE_AUTO_ENROLLMENTS === "true") await spayeeEnrollment(order);

  //
  // ─── UPDATE COMPLETION ───────────────────────────────────────────
  //

  await models.orders.updateOne(
    { order_id: order.order_id },
    { $set: { followup_action_status: "finished", updated_at: Date.now() } },
  );
  logger.info("updated [followup_action_status] finished");
}

//
// ─── SPAYEE ENROLLMENT ──────────────────────────────────────────────────────────
//

async function spayeeEnrollment(order) {
  var email = null;
  var entities = [];

  email = findProp(order, "email");
  if (!email) {
    let payments = await models.payments.find({ order_id: order.order_id }).sort({ created_at: -1 }).limit(1).lean();
    if (payments.length > 0) email = findProp(payments[0], "email");
  }

  if (Array.isArray(order.entities)) entities = order.entities;

  let pre_launch_entities = [];
  for (const entity of entities) {
    let model = EntityTypeModelMap[entity.entity_type];
    if (!model) throw new Error("Invalid entity_type");

    // retrieve productId from DB
    let target = await model.findOne({ slug: entity.entity_id }).lean();
    if (!target) target = await model.findOne({ spayee_product_id: entity.entity_id }).lean();

    if (isNNO(target)) {
      if (target.pre_launch) {
        pre_launch_entities.push(entity);
        continue;
      }

      if (target.spayee_product_id) {
        let productId = target.spayee_product_id;
        logger.info("[spayee_product_id]", productId);
        logger.debug("assigning product", productId, "to email", email);
        await assignSpayeeProduct(email, productId);
      }
    }
  }

  await models.orders.updateOne(
    { order_id: order.order_id },
    { $set: { pre_launch_entities, updated_at: Date.now() } },
  );
}

//
// ─── THINKIFIC ENROLLMENT ───────────────────────────────────────────────────────
//

async function thinkificEnrollment(order) {
  var courseIdThinkific = null;
  var bundleIdThinkific = null;
  var userIdThinkific = null;

  var email = null;
  var firstName = null;
  var lastName = null;
  // new method for web integration
  var entity = null;
  var entityID = null;
  // old method for payment buttons
  var courseName = null;
  var bundleID = null;

  // cart introduced multiple entities in single order
  var entities = [];

  email = findProp(order, "email");
  if (!email) {
    let payments = await models.payments.find({ order_id: order.order_id }).sort({ created_at: -1 }).limit(1).lean();
    if (payments.length > 0) email = findProp(payments[0], "email");
  }
  firstName = findProp(order, "first_name");
  lastName = findProp(order, "last_name");
  courseName = findProp(order, "course");
  bundleID = findProp(order, "bundle_id");

  // in case empty strings were given
  firstName = firstName || email;
  lastName = lastName || "";

  if (Array.isArray(order.entities)) {
    entities = order.entities;
  } else if (typeof order.entity === "object") {
    entities = [
      {
        entity_type: order.entity.entity_type,
        entity_id: order.entity.entity_id,
      },
    ];
  } else {
    if (courseName) {
      entity = "course";
      entityID = courseName;
    } else if (bundleID) {
      entity = "bundle";
      entityID = bundleID;
    }
    entities = [
      {
        entity_type: entity,
        entity_id: entityID,
      },
    ];
  }

  logger.debug("entity", entity);
  logger.debug("entityID", entityID);
  logger.debug("entities", entities);
  logger.debug("email", email);
  logger.debug("firstName", firstName);
  logger.debug("lastName", lastName);

  const userDetails = {
    email: email,
    first_name: firstName,
    last_name: lastName,
    external_id: email,
    send_welcome_email: true,
  };

  //
  // ─── USER HANDLING ───────────────────────────────────────────────
  //

  // look for existing users in our DB as well as Thinkific
  var userValuationary = await models.users
    .findOne({ email: email })
    .select("-_id -password -created_at -updated_at -is_deleted -__v")
    .lean();
  // retrieve user from thinkific (for user id)
  var userThinkific = await getThinkificUser(email);

  // if no record in thinkific, create new user
  if (!userThinkific) {
    userThinkific = await createThinkificUser(userDetails);
  }
  // get the Thinkific User ID
  userIdThinkific = userThinkific.id;
  logger.info("[userIdThinkific]", userIdThinkific);
  logger.debug("[userThinkific]", JSON.stringify(userThinkific));

  // if no record in valuationary db
  if (!userValuationary) {
    userValuationary = new models.users(userDetails);
    await userValuationary.save();
  }
  logger.debug("[userValuationary]", JSON.stringify(userValuationary));

  for (const entity of entities) {
    //
    // ─── COURSE HANDLING ─────────────────────────────────────────────
    //

    if (entity.entity_type === "course") {
      // retrieve course from DB
      let target_course = await models.courses.findOne({ slug: String(entity.entity_id) }).lean();
      if (!target_course && !isNaN(entity.entity_id))
        target_course = await models.courses.findOne({ thinkific_course_id: parseInt(entity.entity_id) });

      if (isNNO(target_course)) courseIdThinkific = target_course.thinkific_course_id;
    }
    logger.info("[courseIdThinkific]", courseIdThinkific);

    //
    // ─── BUNDLE HANDLING ─────────────────────────────────────────────
    //

    if (entity.entity_type === "bundle") {
      // retrieve bundle from DB
      let target_bundle = await models.bundles.findOne({ slug: String(entity.entity_id) }).lean();
      if (!target_bundle && !isNaN(entity.entity_id))
        target_bundle = await models.bundles.findOne({ thinkific_bundle_id: parseInt(entity.entity_id) }).lean();

      // validate if bundle exists
      if (isNNO(target_bundle) && target_bundle.thinkific_bundle_id) {
        const bundleResponse = await thinkificAxios.get("/bundles/" + target_bundle.thinkific_bundle_id);
        if (bundleResponse.status === 404) {
          throw new Error("No bundle found");
        }
        var bundleDetails = bundleResponse.data;
        logger.debug("[bundleDetails]", JSON.stringify(bundleDetails));

        bundleIdThinkific = target_bundle.thinkific_bundle_id;
      }
    }
    logger.info("[bundleIdThinkific]", bundleIdThinkific);

    //
    // ─── INVALID ENTRY HANDLING ──────────────────────────────────────
    //

    if (courseIdThinkific === null && bundleIdThinkific === null) {
      await models.orders.updateOne(
        { order_id: order.order_id },
        { $set: { followup_action_status: "invalid course/bundle", updated_at: Date.now() } },
      );
      logger.info("invalid course/bundle");
      return;
    }

    //
    // ─── COURSE ENROLLMENT HANDLING ──────────────────────────────────
    //

    if (courseIdThinkific) {
      logger.info("enrolling using course ID", courseIdThinkific);
      await handleThinkificCourseEnrollment(userIdThinkific, courseIdThinkific);
      logger.info("enrolling using course ID finished");
    }

    //
    // ─── BUNDLE ENROLLMENT HANDLING ──────────────────────────────────
    //

    if (bundleIdThinkific) {
      logger.info("enrolling using bundle ID", bundleIdThinkific);
      await handleThinkificBundleEnrollment(userIdThinkific, bundleIdThinkific);
      logger.info("enrolling using bundle ID finished");
    }
  }
}

//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//

export async function processOrders() {
  logger.info("order processing...");
  let filter_date = Date.now();
  // subtract 15 minutes in milliseconds
  filter_date = filter_date - 15 * 60 * 1000;

  // go through "failed" orders to salvage wasted coupons that were claimed 15 minutes ago
  let failed_orders = await models.orders
    .find({ status: "failed", followup_action_status: "pending", created_at: { $lt: filter_date } })
    .lean();
  for (let order of failed_orders) {
    try {
      await processFailedOrder(order);
    } catch (error) {
      await models.orders.updateOne(
        { order_id: order.order_id },
        { $set: { followup_action_status: "error", updated_at: Date.now() } },
      );
      logger.info("updated [followup_action_status] error");
      logger.error(error);
    }
  }

  // go through all the "paid" & "pending" status entries
  let orders = await models.orders.find({ status: "paid", followup_action_status: "pending" }).lean();

  for (let order of orders) {
    try {
      await processOrder(order);
    } catch (error) {
      await models.orders.updateOne(
        { order_id: order.order_id },
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

export const ordersProcessingTask = cron.schedule(
  "0 */1 * * * *",
  () => {
    processOrders();
  },
  { scheduled: false },
);
