import { config } from "dotenv";
import { db_connect } from "./database/connection.js";

import getLogger from "./logger/index.js";
const logger = getLogger(import.meta.url);

// Load env vars
config({ path: "./config/config.env" });

import * as fs from "fs";
// import mongoose from "mongoose";
import models from "./models/index.js";
import qs from "query-string";
import axios from "axios";
import https from "https";

// import { ErrorResponse } from "./middlewares/errorHandler.js";
// import { applyCoupon } from "./controllers/coupons.controller.js";
// import { fetchCoupon } from "./utils/coupon.util.js";
// import { fetchManyPriceData } from "./utils/order.util.js";
// import { assignSpayeeProduct } from "./utils/spayee.util.js";

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

// const thinkificToSpayee = {
//   1015683: "619238970cf2ebf56fb3d1f7",
//   1342677: "619b8c780cf2030e987d6009",
//   1388237: "61a4b7240cf2df91ac7c12f9",
//   1388304: "61a4cedb0cf298ee43050c07",
//   1388349: "619cbfb60cf257166f62c31c",
//   1388366: "61a21ae00cf298ee430457fa",
//   1388380: "6198caec0cf2b4019173f9ad",
//   1388391: "619b6eb80cf261b437ae58ac",
//   1388395: "619b78990cf20d2660946106",
//   1388400: "619b77280cf20d26609460b6",
//   1388407: "6198c8c50cf25f1a8b0baa44",
//   1443517: "6196471a0cf24111c3ebb8c0",
//   1494736: "619390be0cf2eec414818dca",
//   1504750: "61978f3f0cf2b4019173a8a7",
//   1527594: "619796f10cf261b437ad5225",
//   1537812: "617d063b0cf26d7d729f9b0c",
//   971847: "61939d4b0cf291ae6c1351de",
//   982898: "6194f57e0cf260a4d9e61d22",
//   997628: "61963b2f0cf2a4dd0b68ae0f",
//   997673: "617d063b0cf26d7d729f9b0c",
//   // "1514634": "61aa03730cf26833c8ec991b", // credit
//   // "1460017": "61aa03730cf26833c8ec991b", // credit
//   // "1494816": "619774c70cf21ea9c5e30921", // hedge
//   // "1524598": "619774c70cf21ea9c5e30921", // hedge
//   // "1627904": "619774c70cf21ea9c5e30921", // hedge
// };

// const file = fs.readFileSync("C:\\Users\\akash\\OneDrive\\Pictures\\Valuationary Design\\thinkific enrollments.json");
// const obj = JSON.parse(file);
// const valid_courses = Array.from(Object.keys(thinkificToSpayee)).map((v) => parseInt(v));

// let emailNameMap = {};
// for (const enrollment of obj.items) {
//   if (valid_courses.includes(enrollment.course_id)) {
//     if (emailNameMap[enrollment.user_email] !== enrollment.user_name.trim())
//       emailNameMap[enrollment.user_email] = enrollment.user_name.trim();
//   }
// }

// let records = [];
// for (const [email, name] of Object.entries(emailNameMap)) {
//   records.push([email, name].join("|"));
// }
// console.log(records);

const mid = "mahipgupta5581";
const key = "0036eb77-8bc9-45c8-a672-4260f50890fd";
const spayee_url = "https://api.spayee.com";

const agent = new https.Agent({ rejectUnauthorized: false });
const axiosClient = axios.create({ httpsAgent: agent });

// setup mongodb
db_connect().then(() => {
  console.log("connected");

  // (async () => {
  //   const {
  //     data: { data: products },
  //   } = await axiosClient.get([`${spayee_url}/public/v1/products`, qs.stringify({ mid, key, limit: 500 })].join("?"));
  //   // console.log(products);

  //   const product_users = await Promise.all(
  //     products.map(async (product) => {
  //       const { id, title } = product;
  //       let all_learners = [];
  //       let r_total = 0;
  //       let r_skip = 0;
  //       do {
  //         const response = await axiosClient.get(
  //           [
  //             `${spayee_url}/t/api/public/v3/products/activelearners`,
  //             qs.stringify({
  //               mid,
  //               key,
  //               limit: 100,
  //               skip: r_skip,
  //               productIds: id,
  //               dateFrom: "2020/01/01",
  //               dateTo: "2023/01/01",
  //             }),
  //           ].join("?"),
  //         );
  //         const {
  //           data: { data: learners, skip, total },
  //         } = response;
  //         all_learners = [...all_learners, ...learners];
  //         r_skip = skip + all_learners.length;
  //         r_total = total;
  //       } while (all_learners > 0 || r_skip < r_total);

  //       return { id, title, learners: all_learners, total: r_total };
  //     }),
  //   );

  //   product_users.forEach(({ learners }, index, array) => {
  //     array[index].learners = learners.filter((l) => l.active).map(({ id, email, name }) => ({ id, email, name }));
  //   });

  //   let unique_users = [];
  //   product_users.forEach(({ learners }) => {
  //     unique_users = [...unique_users, ...learners.map((l) => l.email)];
  //   });
  //   unique_users = Array.from(new Set(unique_users));

  //   const counts_list = product_users.map(({ title, total }) => ({ title, total }));
  //   let total_count = 0,
  //     counts = {};
  //   counts_list.forEach(({ title, total }) => {
  //     counts[title] = total;
  //     total_count += total;
  //   });

  //   fs.writeFileSync(
  //     "product_users.json",
  //     JSON.stringify({ product_users, counts, total_count, unique_users: unique_users.length }),
  //     (err) => {
  //       // In case of a error throw err.
  //       if (err) throw err;
  //     },
  //   );
  // })().then(() => process.exit(0));

  // (async () => {
  //   // export orders statistics and records
  //   const orders = await models.orders.find({ valid: "valid", mode: "live", status: "paid" }).lean();

  //   const records = {};
  //   orders.forEach(({ notes: { email, first_name, last_name }, entities, pre_launch_entities }) => {
  //     if (!(email in records)) records[email] = { full_name: [first_name, last_name].join(" ").trim() };

  //     records[email].entities = [...(records[email].entities ?? []), ...entities, ...pre_launch_entities];
  //     const ids = Array.from(new Set(records[email].entities.map(({ entity_id }) => entity_id)));
  //     records[email].entities = records[email].entities
  //       .filter(({ entity_type }) => ["course", "bundle"].includes(entity_type))
  //       .filter(({ entity_id }, index) => ids.indexOf(entity_id) === index);
  //     records[email].total_orders = (records[email].total_orders ?? 0) + 1;
  //     records[email].total_amount = records[email].entities.reduce(
  //       (total, { discounted_price, offer_price, markup_price }) =>
  //         total + (discounted_price ?? offer_price ?? markup_price ?? 0),
  //       0,
  //     );
  //   });

  //   const users_for_subscription = Object.entries(records)
  //     .filter(([email, r]) => r.total_amount >= 1500)
  //     .map(([email, r]) => ({ email, ...r }));
  //   const users_for_course = Object.entries(records)
  //     .filter(([email, r]) => r.total_amount < 1500)
  //     .map(([ email, r ]) => ({ email, ...r }));

  //   let subscription_users = Array.from(new Set(users_for_subscription.map(({ email }) => ({ email }))));

  //   let course_user_map = {};
  //   users_for_course.forEach(({ email, entities }) => {
  //     entities.forEach(({ entity_id }) => {
  //       if (!(entity_id in course_user_map)) course_user_map[entity_id] = [];
  //       course_user_map[entity_id].push(email);
  //     });
  //   });
  //   const coursewise_users = Object.entries(course_user_map).map(([entity_id, users]) => {
  //     const unique_users = Array.from(new Set(users));
  //     return { entity_id, users: unique_users, total_users: unique_users.length };
  //   });

  //   let all_users = [];

  //   let course_users = [];
  //   coursewise_users.forEach(({ users }) => (course_users = [...course_users, ...users]));
  //   course_users = Array.from(new Set(course_users));
  //   all_users = [...subscription_users, ...course_users];
  //   all_users = Array.from(new Set(all_users));

  //   let coursewise_users_count = {};
  //   coursewise_users.forEach(({ entity_id, total_users }) => (coursewise_users_count[entity_id] = total_users));

  //   const counts = {
  //     users_for_subscription: users_for_subscription.length,
  //     unique_users: all_users.length,
  //     users_for_course: users_for_course.length,
  //     coursewise_users: {
  //       total_enrollments: coursewise_users.reduce((total, { total_users }) => total + total_users, 0),
  //       total_unique_users: course_users.length,
  //       coursewise_user_distibution: coursewise_users_count,
  //     },
  //   };

  //   fs.writeFileSync(
  //     "records.json",
  //     JSON.stringify({ users_for_subscription, users_for_course, coursewise_users, counts }),
  //     (err) => {
  //       // In case of a error throw err.
  //       if (err) throw err;
  //     },
  //   );
  // })().then(() => process.exit(0));

  // * set permission for a user
  // (async () => {
  //   const result = await models.users.updateOne(
  //     { email: "instructor@valuationary.com" },
  //     {
  //       $set: {
  //         permissions: {
  //           courses: [
  //             "resume-building-and-interview-prep",
  //             "financial-modeling-business-valuations",
  //             "beginner-s-guide-to-investing",
  //             "python-for-finance",
  //             "excel-for-finance",
  //             "technical-analysis-cash-equity",
  //             "technical-analysis-derivatives",
  //             "everything-you-need-to-know-about-insurance",
  //             "international-investing-101-diversify-globally",
  //             "ultimate-guide-to-startup-investing",
  //             "crypto-masterclass-a-step-by-step-guide",
  //             "the-little-course-on-stock-market",
  //           ],
  //           bundles: ["bundle-cfa-level-1-all-subjects", "bundle-cfa-level-2-all-subjects"],
  //         },
  //       },
  //     },
  //   );
  //   console.log(result);
  // })();

  // * remove orders with <1 item/entity
  // (async () => {
  //   let count = 0;
  //   const records = await models.orders.find({});
  //   for (let order of records) {
  //     if (order.entities.length > 1) continue;

  //     await order.remove();
  //     count += 1;
  //   }
  //   console.log(count);
  // })();

  // * transform coupon to include point in time info and entities to include price info
  // (async () => {
  //   let count = 0;
  //   let mismatch_count = 0;
  //   const records = await models.orders.find({ status: "paid" });
  //   for (let order of records) {
  //     try {
  //       const { coupon_applied, entities, amount: true_amount, mode } = order;
  //       const coupon_code = typeof coupon_applied === "string" ? coupon_applied : coupon_applied?.code;

  //       if (entities.length === 0) continue;

  //       let pre_current_amount = 0;
  //       entities.forEach((entity) => {
  //         pre_current_amount += entity.discounted_price ?? entity.offer_price ?? entity.markup_price ?? 0;
  //       });
  //       pre_current_amount = pre_current_amount * 100;

  //       if (pre_current_amount === true_amount) continue;

  //       // collect price data
  //       let new_entities = await fetchManyPriceData(entities);
  //       // error on invalid entity
  //       const invalid_entities = new_entities.filter((e) => !e.valid && e.error);
  //       if (invalid_entities?.length) {
  //         const errors = [...new Set(invalid_entities.map((e) => e.error))];
  //         console.log(order.order_id, order.mode, errors.join(", "), invalid_entities);
  //         continue;
  //       }

  //       if (coupon_code) {
  //         // validate and fetch coupon details
  //         const { errors, ...coupon } = await fetchCoupon(coupon_code);
  //         if (errors?.length) {
  //           console.log(order.order_id, order.mode, errors.join(", "), coupon_applied);
  //           continue;
  //         }

  //         // apply coupon details if applicable
  //         const coupon_processed_data = await applyCoupon(coupon, new_entities);

  //         // order.amount = coupon_processed_data.discounted_total;
  //         order.coupon_applied = coupon_processed_data.coupon;
  //         order.entities = coupon_processed_data.entities;
  //       } else {
  //         order.coupon_applied = null;
  //         order.entities = new_entities;
  //       }

  //       let current_amount = 0;
  //       order.entities.forEach((entity) => {
  //         current_amount += entity.discounted_price ?? entity.offer_price ?? entity.markup_price ?? 0;
  //       });
  //       current_amount = current_amount * 100;
  //       current_amount = parseInt(current_amount / 100) * 100;

  //       if (current_amount !== true_amount) {
  //         if (order.entities.length === 1) {
  //           if (coupon_code) {
  //             order.entities[0].discounted_price = true_amount / 100;
  //           } else if ((order.entities[0].offer_price ?? -1) >= 0) {
  //             order.entities[0].offer_price = true_amount / 100;
  //           } else {
  //             order.entities[0].markup_price = true_amount / 100;
  //           }
  //         } else {
  //           console.log(order.mode, order.order_id, true_amount, current_amount, coupon_code);
  //           mismatch_count += 1;
  //           continue;
  //         }
  //       }

  //       order.markModified("entities");
  //       order.markModified("coupon_applied");
  //       await order.save();
  //       count += 1;
  //     } catch (err) {
  //       console.log(order.order_id, order.mode, err);
  //     }
  //   }
  //   console.log(count, mismatch_count);
  // })();

  // (async () => {
  //   let count = 0;
  //   const users = await models.users.find({});
  //   for (let user of users) {
  //     if (user.first_name && user.last_name) continue;
  //     if (!user.first_name) user.first_name = user.email;
  //     if (user.first_name?.includes("@")) {
  //       user.first_name = user.first_name.split("@")[0];
  //     }
  //     if (user.first_name?.includes(".")) {
  //       user.last_name = user.first_name.split(".")[1];
  //       user.first_name = user.first_name.split(".")[0];
  //     }
  //     if (!user.last_name && user.first_name?.split(" ").length > 1) {
  //       user.last_name = user.first_name.split(" ").slice(-1).join(" ");
  //       user.first_name = user.first_name.split(" ").slice(0, -1).join(" ");
  //     }
  //     user = await user.save();
  //     console.log(user);
  //     count += 1;
  //   }
  //   console.log(count);
  // })();

  // (async () => {
  //   const results = await models.users.updateMany(
  //     { roles: [] },
  //     {
  //       // $set: { roles: [mongoose.Types.ObjectId("60a2a19214415f36b8018479")] },
  //       // $addToSet: { roles: mongoose.Types.ObjectId("60a2a19214415f36b8018479") },
  //       // $pull: { roles: "60a2a19214415f36b8018479" },
  //     },
  //   );
  //   console.log("done", results);
  // })();

  // (async () => {
  //   for (const e of records) {
  //     const [email, name] = e.split("|");
  //     const upsert_result = await models.users.updateOne(
  //       { email: email },
  //       {
  //         $setOnInsert: {
  //           first_name: name,
  //           last_name: "",
  //           email: email,
  //           roles: [mongoose.Types.ObjectId("60a2a19214415f36b8018479")],
  //         },
  //       },
  //       { upsert: true },
  //     );
  //     console.log(upsert_result);
  //   }
  // })();

  // (async () => {
  //   let orders = await models.orders.find({}).lean();
  //   for (let order of orders) {
  //     try {
  //       if (order.entities === undefined) {
  //         if (typeof order.entity === "object" && order.entity.entity_type && order.entity.entity_id) {
  //           console.log("processing order", order.order_id);
  //           console.log("processing order", typeof order.entity, order.entity);
  //           console.log("processing order", typeof order.entities, order.entities);
  //           order.entities = [order.entity];
  //           await models.orders.updateOne({ _id: order._id }, { $set: { entities: [order.entity] } });
  //         }
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  // })();

  // (async () => {
  //   let orders = await models.orders.find({ amount: { $exists: false }, status: "paid" }).lean();
  //   for (let order of orders) {
  //     console.log("processing order", order.order_id);
  //     var email = null;
  //     var firstName = null;
  //     var lastName = null;
  //     // new method for web integration
  //     var entity = null;
  //     var entityID = null;
  //     // old method for payment buttons
  //     var courseName = null;
  //     var bundleID = null;

  //     var contact = null;

  //     contact = findProp(order, "contact");
  //     email = findProp(order, "email");
  //     if (!email) {
  //       let payments = await models.payments
  //         .find({ order_id: order.order_id })
  //         .sort({ created_at: -1 })
  //         .limit(1)
  //         .lean();
  //       if (payments.length > 0) email = findProp(payments[0], "email");
  //     }
  //     firstName = findProp(order, "first_name");
  //     lastName = findProp(order, "last_name");
  //     courseName = findProp(order, "course");
  //     bundleID = findProp(order, "bundle_id");

  //     console.log("courseName", courseName);
  //     console.log("bundleID", bundleID);
  //     // in case empty strings were given
  //     firstName = firstName || email;
  //     lastName = lastName || "";

  //     if (courseName) {
  //       entity = "course";
  //       entityID = courseName
  //         .toLowerCase()
  //         .replaceAll("&", "and")
  //         .replaceAll("Excel for Finance", "excel-for-finance")
  //         .replaceAll("Beginner's Guide to Investing", "beginner-s-guide-to-investing")
  //         .replaceAll("'", "-")
  //         .replaceAll(" ", "-")
  //         .replaceAll("beginners-guide-to-investing", "beginner-s-guide-to-investing")
  //         .replaceAll("stock-market-strategies", "stock-market")
  //         .replaceAll("financial-modeling-and-business-valuations", "financial-modeling-business-valuations")
  //         .replaceAll("stock-selection-and-exit-strategy", "stock-market")
  //         .replaceAll("ethical-and-professional-standards-(cfa-level-1)", "ethical-professional-standards");
  //     } else if (bundleID) {
  //       entity = "bundle";
  //       entityID = bundleID;
  //     }
  //     if (!entity) entity = findProp(order, "entity");
  //     if (!entity) entity = findProp(order, "entity_type");
  //     if (!entityID) entityID = findProp(order, "entityID");
  //     if (!entityID) entityID = findProp(order, "entity_id");

  //     console.log("entity", entity);
  //     console.log("entityID", entityID);
  //     console.log("email", email);
  //     console.log("firstName", firstName);
  //     console.log("lastName", lastName);
  //     console.log("contact", contact);

  //     if (!order.amount) {
  //       let amount = findProp(order, "amount");
  //       console.log("A amount", order.amount);
  //       console.log("U amount", amount);
  //       await models.orders.updateOne({ _id: order._id }, { $set: { amount: amount } });
  //     }
  //     if (!order.mode) {
  //       order.mode = "live";
  //       console.log("U mode", order.mode);
  //       await models.orders.updateOne({ _id: order._id }, { $set: { mode: "live" } });
  //     }
  //     if (["akash@valuationary.com", "akash.patel@valuationary.com", "test@valuationary.com"].indexOf(email) !== -1) {
  //       order.mode = "test";
  //       console.log("U mode", order.mode);
  //       await models.orders.updateOne({ _id: order._id }, { $set: { mode: "test" } });
  //     }
  //     console.log("A entity", order.entity);
  //     if (!order.entity || Object.keys(order.entity).length === 0) {
  //       let res = { entity_type: entity, entity_id: entityID };
  //       order.entity = res;
  //       console.log("U entity", { entity_type: entity, entity_id: entityID });
  //       await models.orders.updateOne(
  //         { _id: order._id },
  //         { $set: { "entity.entity_type": entity, "entity.entity_id": entityID } },
  //       );
  //     }
  //     console.log("A notes", order.notes);
  //     if (order.notes.length === 0) {
  //       var notes = findProp(order, "notes");
  //       console.log("U notes", notes);
  //       await models.orders.updateOne({ _id: order._id }, { $set: { notes: notes } });
  //     }
  //     console.log("---------------------------------------------------------------");
  //   }
  // })();

  // (async () => {
  //   var records = [];
  //   let orders = await models.orders.find({ mode: "live", status: "paid" }).lean();
  //   for (let order of orders) {
  //     try {
  //       console.log("processing order", order.order_id);

  //       var email = null;
  //       var firstName = null;
  //       var lastName = null;
  //       // new method for web integration
  //       var entity = null;
  //       var entityID = null;
  //       // old method for payment buttons
  //       var courseName = null;
  //       var bundleID = null;

  //       var contact = null;

  //       contact = findProp(order, "contact");
  //       email = findProp(order, "email");
  //       if (!email) {
  //         let payments = await models.payments
  //           .find({ order_id: order.order_id })
  //           .sort({ created_at: -1 })
  //           .limit(1)
  //           .lean();
  //         if (payments.length > 0) email = findProp(payments[0], "email");
  //       }
  //       firstName = findProp(order, "first_name");
  //       lastName = findProp(order, "last_name");
  //       courseName = findProp(order, "course");
  //       bundleID = findProp(order, "bundle_id");

  //       // in case empty strings were given
  //       firstName = firstName || email;
  //       lastName = lastName || "";

  //       if (typeof order.entity === "object") {
  //         entity = order.entity.entity_type;
  //         entityID = order.entity.entity_id;
  //       } else {
  //         if (courseName) {
  //           entity = "course";
  //           entityID = courseName;
  //         } else if (bundleID) {
  //           entity = "bundle";
  //           entityID = bundleID;
  //         }
  //       }

  //       // console.log("entity", entity);
  //       // console.log("entityID", entityID);
  //       // console.log("email", email);
  //       // console.log("firstName", firstName);
  //       // console.log("lastName", lastName);
  //       // console.log("contact", contact);

  //       records.push(`${firstName},${lastName},${email},${contact},${entityID},${entity}`);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }
  //   console.log(records);
  //   // Write data in 'Output.txt' .
  //   fs.writeFile("Output.csv", records.join("\n"), (err) => {
  //     // In case of a error throw err.
  //     if (err) throw err;
  //   });
  // })();

  // (async () => {
  //   const result = await models.coupons.create({
  //     name: "BGI 100% OFF",
  //     description: "100% OFF",
  //     code: "TEST100",
  //     // exclusive: { course: ["beginner-s-guide-to-investing"] },

  //     discount_type: "percentage",
  //     value: "100",
  //     quantity: 100,
  //   });
  //   console.log(result);
  // })();

  // (async () => {
  //   const instructors = {
  //     "mridula-devrani": {
  //       name: "Mridula\nDevrani",
  //       slug: "mridula-devrani",
  //       is_featured: false,
  //       designation: "<ul><li></li></ul>",
  //       linkedin_url: "",
  //       icon_url:
  //         "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/instructor-photos/bw/webp/edited/265/mridula_devrani.webp 265w",
  //     },
  //   };
  //   console.log(await new models.instructors(instructors["mridula-devrani"]).save());
  // })();

  // const courses = {
  //   "technical-analysis-cash-equity": {
  //     title: "Technical Analysis - Cash Equity",
  //     slug: "technical-analysis-cash-equity",
  //     is_featured: false,
  //     order: 10,
  //     tags: [1, 2, 3, 4, 5, 6, 7],
  //     short_description:
  //       "Technical Analysis is the process of analysing stock price and volume action to understand the overall market sentiment. With this skillset, one can make informed trading and investment decisions, and embark the journey of wealth creation over the long run. The course covers the important concepts which one can use to identify momentum stocks.",
  //     long_description:
  //       "Technical Analysis is the process of analysing stock price and volume action to understand the overall market sentiment. With this skillset, one can make informed trading and investment decisions, and embark the journey of wealth creation over the long run. The course covers the important concepts which one can use to identify momentum stocks.\nThis course is designed and facilitated by professionally trained experts who have been analysing markets for last few years to make informed and rewarding trading / investment decisions.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/22_min.svg",
  //     markup_price: "2000",
  //     offer_price: "499",
  //     enrollments: "",
  //     perks: [
  //       "Live on-demand doubt session with instructor",
  //       "Industry recognised certificate",
  //       "Access to elite 'Valued' community",
  //       "Premium downloadable resources/templates",
  //       "Bonus sessions on financial planning and wealth creation",
  //     ],
  //     videos: "20",
  //     duration: "",
  //     requirements: "Basic understanding of stock market.",
  //     audience: "",
  //     categories: ["course"],
  //     instructors: [],
  //     thinkific_course_id: 1527594,
  //   },
  //   "python-for-finance": {
  //     title: "Python for Finance",
  //     slug: "python-for-finance",
  //     is_featured: false,
  //     order: 9,
  //     tags: [1, 2, 3, 4, 5, 6, 7],
  //     short_description:
  //       "Python is one of the most popular programming languages used in the financial industry, with a huge set of accompanying libraries. In this course, you'll cover different ways of accessing financial data and preparing it for modeling. The course starts by explaining topics exclusively related to Python and we will then deal with critical parts of Python, explaining concepts such as time value of money and portfolio management.",
  //     long_description:
  //       'Fintech is a growing technological industry having AI applications to serve the customers with the best of financial services. With the current market scenario of increasing crypto-currencies, bitcoins and a lot of companies investing in the financial sector, the importance of data has increased. It is very important to be updated and understand trends and it\'s often difficult to deal with huge datasets in excel. So, introducing you to the "PYTHON FOR FINANCE" Course which is a beginner level course to help you understand the basics of python, indentation and how and why to use alongside with learning few important topics like Time value Money and stocks using python. At the end, we would be having a project which helps you to understand the importance of tech in finance.',
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/21_min.svg",
  //     markup_price: "500",
  //     offer_price: "199",
  //     enrollments: "",
  //     perks: ["Live on-demand doubt session with instructor", "Hands on projects and portfolio building"],
  //     videos: "15",
  //     duration: "",
  //     requirements: "Prior knowledge of python is NOT mandatory.",
  //     audience:
  //       '<ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />People interested in finance and investments</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Programmers who want to specialize in finance</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Everyone who wants to learn how to code and apply their skills in practice</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Finance graduates and professionals who need to better apply their knowledge in Python</li></ul>',
  //     categories: ["course"],
  //     instructors: ["manpreet-budhraja"],
  //     thinkific_course_id: 1494736,
  //   },
  //   "finance-for-founders": {
  //     title: "Finance for Founders",
  //     slug: "finance-for-founders",
  //     is_featured: false,
  //     order: 3,
  //     tags: [3, 4, 7],
  //     short_description: "A successful founder can either bootstrap his/her way or raise external funds to blitzscale.",
  //     long_description:
  //       "A successful founder can either bootstrap his/her way or raise external funds to blitzscale. The choice is quite personal but greatly affects start-ups road and timeline of success. So which is better for you? Learn the art and practice of raising funds from successful founders and VCs. Please read the lesson plan for more details.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/4_min.svg",
  //     markup_price: "4000",
  //     offer_price: "1000",
  //     enrollments: "500+",
  //     perks: [
  //       "Live on-demand doubt session with instructor",
  //       "Industry recognized certificate",
  //       'Access to elite "Valued" community',
  //       "Premium Downloadable Resources/Templates",
  //     ],
  //     videos: "16",
  //     duration: "",
  //     requirements:
  //       'Two core ingredients<ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Entrepreneurial spirit</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Enthusiasm to learn</li></ul>',
  //     audience:
  //       "Entrepreneurs who wants to learn the art of fundraising from successful startup founder and Venture Capitalists (VC)!",
  //     categories: ["course"],
  //     instructors: ["maneesh-srivastava", "suraj-juneja", "raunak-singhvi", "anand-dalmia", "pratik-bajaj"],
  //   },
  //   "beginner-s-guide-to-investing": {
  //     title: "Beginners Guide to Investing",
  //     slug: "beginner-s-guide-to-investing",
  //     is_featured: false,
  //     order: 4,
  //     tags: [5, 6, 7],
  //     short_description:
  //       "Don’t have any idea on how to begin your investment journey, then this course is exactly meant for you! Learn all about Savings, Investments, Equity, Mutual Funds, Insurance, Taxes and Financial Planning, in this course!",
  //     long_description:
  //       "Warren Buffett's greatest skill is not investing but investing early. This course will make your money work for you, to make you financially independent. i.e. not having to worry about money. The course is designed to bring you from knowing nothing about investing to knowing well enough to build your own financial plan. In the course, you will learn about savings, investing, insurance and tax planning and associated hacks and thumb rules. You’ll also learn the power of compounding and how you can build & grow your wealth with a disciplined investment approach by taking exposures in various asset classes",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/3_min.svg",
  //     youtube_embed: "https://www.youtube.com/embed/NoLxTo2WjG0",
  //     markup_price: "1600",
  //     offer_price: "399",
  //     enrollments: "500+",
  //     perks: [
  //       "Live on-demand doubt session with instructor",
  //       "Industry recognized certificate",
  //       'Access to elite "Valued" community',
  //       "Premium Downloadable Resources/Templates",
  //     ],
  //     videos: "20",
  //     duration: "",
  //     requirements:
  //       'Two core ingredients<ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Investing spirit</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Enthusiasm to learn</li></ul>',
  //     audience:
  //       'Someone who wants to start investing early. Anyone from <ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Working professionals who wants to save and invest (May it be a businessmen or salariats)</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />For people who want to be financially independent (May it be candidates or homemakers)</li></ul>',
  //     categories: ["course"],
  //     instructors: ["kunal-shah", "shruti-panda", "nirav-karkera", "abhishek-soni"],
  //     thinkific_course_id: "",
  //   },
  //   "stock-market": {
  //     title: "Stock Market Strategies",
  //     slug: "stock-market",
  //     is_featured: false,
  //     order: 5,
  //     tags: [5, 6],
  //     short_description:
  //       "Out of 3,800 stocks listed on the BSE platform, only a few companies are fundamentally strong! How do we identify them? Let’s learn the art of stock-picking in this course!",
  //     long_description:
  //       "Everyone will tell you which stocks to pick but no one advices when to exit. Equity investing is more about exits than entry. This course is one of the smartest ways to decode the entry-exit strategies which great investors have implemented and achieved success with.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/5_min.svg",
  //     markup_price: "1600",
  //     offer_price: "799",
  //     enrollments: "500+",
  //     perks: "",
  //     videos: "7",
  //     duration: "",
  //     requirements:
  //       'Two core ingredients<ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Investing spirit</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Enthusiasm for stock marker</li></ul>',
  //     audience:
  //       "Someone who is passionate and enthusiastic about stock market. Someone who is actively investing or wished to invest in stock market.",
  //     categories: ["course"],
  //     instructors: ["pratik-bajaj", "kunal-shah"],
  //     thinkific_course_id: "",
  //   },
  //   "portfolio-management-with-entry-exit-strategies": {
  //     title: "Portfolio Management",
  //     slug: "portfolio-management-with-entry-exit-strategies",
  //     is_featured: false,
  //     order: 2,
  //     tags: [3, 4, 5, 6],
  //     short_description:
  //       "Learn how to create customized Portfolios based on analyzing multiple asset classes like Equity, Bonds, Gold & Real Estate understanding the risk & return objectives of the client.",
  //     long_description:
  //       "Portfolio management is more about managing risks than returns. In this course, one will understand in detail how to quantify the risk appetite and return objective of the investor, to make an elaborate financial plan. Comprehensive analysis of assets classes- Equity, Bonds, Real Estate & Gold and how to allocate capital amongst them using the best principles of diversification. Then we discuss 2 successful equity picking strategies along with exit strategies. Then we discuss how to practically invest. Please go through lesson plans for more details. ",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/1_min.svg",
  //     markup_price: "6000",
  //     offer_price: "2999",
  //     enrollments: "1000+",
  //     perks: [
  //       "Live on-demand doubt session with instructor",
  //       "Industry recognized certificate",
  //       'Access to elite "Valued" community',
  //       "Premium Downloadable Resources/Templates",
  //     ],
  //     videos: "22",
  //     duration: "",
  //     requirements:
  //       'Three core ingredients<ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Investing spirit</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Enthusiasm to learn</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Career focus</li></ul>',
  //     audience:
  //       'Someone who wants to<ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Make a career in portfolio management, as research analyst or portfolio manager.</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Manage his/her portfolio or family office.</li></ul>',
  //     categories: ["course"],
  //     instructors: ["pratik-bajaj", "kunal-shah", "mandar-naik"],
  //     thinkific_course_id: "",
  //   },
  //   "financial-modeling-business-valuations": {
  //     title: "Financial Modeling & Business Valuations",
  //     slug: "financial-modeling-business-valuations",
  //     thin: "financial-modeling",
  //     is_featured: false,
  //     order: 1,
  //     tags: [1, 2, 3, 4, 5, 6],
  //     short_description:
  //       "This course is taught by professionals from a real-life public company, and will provide you with the skills you need to make an efficient, robust and flexible financial model and estimate its fair value through Discounted Cash Flow and Relative Market Approach.",
  //     long_description:
  //       "Financial modelling is a process of forecasting financial performance of a company and business valuation is a way of calculating the fair value of that company. With this skillset, one can understand the company’s business and figure out its ideal value. We also discuss M&A transactions and start-up valuations. These concepts are applied in the fields of Investment Banking for coming out with IPOs or raising capital; by Venture Capital firms to invest in start-ups and by Asset Management Companies (AMCs) to make investing decisions. ",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/19_min.svg",
  //     markup_price: "8000",
  //     offer_price: "2999",
  //     enrollments: "1000+",
  //     perks: [
  //       "Live on-demand doubt session with instructor",
  //       "Industry recognized certificate",
  //       'Access to elite "Valued" community',
  //       "Premium Downloadable Resources/Templates",
  //     ],
  //     videos: "30",
  //     duration: "",
  //     requirements:
  //       'Three core ingredients<ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Basic knowledge of financial statements- Income statement, Balance Sheet & Cash flow statement</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Enthusiasm to learn</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Career focus</li></ul>',
  //     audience:
  //       'Someone who wants to make a career as<ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Investment Banking associate</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Analyst at VC and PE firms</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Research analyst at Asset Management Companies (AMCs)</li></ul>',
  //     categories: ["course"],
  //     instructors: ["pratik-bajaj", "kunal-shah", "maneesh-srivastava"],
  //     thinkific_course_id: "",
  //   },
  //   "financial-modeling-business-valuations-synopsis": {
  //     title: "Financial Modeling & Business Valuations Synopsis",
  //     slug: "financial-modeling-business-valuations-synopsis",
  //     thinkific: "Synopsis",
  //     is_featured: false,
  //     order: 6,
  //     tags: [1, 2, 3, 4, 5, 6, 7],
  //     short_description:
  //       "Been a while you created your last financial model? Let’s quickly brush up the art of creating Financial Models and applying valuation metrics in a very concise manner.",
  //     long_description:
  //       'At valuationary, we feel that "financial modeling & business valuation" is an art of converting growth stories into meaningful numbers. In this course, we discuss all the concepts of FMBV in a brief manner while building a hypothetical model. It\'s a shortened version of our FMBV course which builds a real financial model in an comprehensive manner. If you are not short on time, we highly recommend enrolling for the flagship program.',
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/18_min.svg",
  //     markup_price: "1000",
  //     offer_price: "499",
  //     enrollments: "500+",
  //     perks: "",
  //     videos: "7",
  //     duration: "",
  //     requirements:
  //       'Three core ingredients<ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Basic knowledge of financial statements- Income statement, Balance Sheet & Cash flow statement</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Enthusiasm to learn</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Career focus</li></ul>',
  //     audience:
  //       "This is for all who wants to get a flavor of financial modeling and business valuation. If dearth of time has been an issue, this synopsis is best for you.",
  //     categories: ["course"],
  //     instructors: ["pratik-bajaj", "kunal-shah"],
  //   },
  //   "excel-for-finance": {
  //     title: "Excel for Finance",
  //     slug: "excel-for-finance",
  //     is_featured: false,
  //     order: 9,
  //     tags: [1, 2, 3, 4, 5, 6, 7],
  //     short_description:
  //       "Learn all tips, tricks, hacks, shortcuts, functions and formulas you need to know before you enter the world of finance.",
  //     long_description:
  //       "Excel is an important tool that can help finance professionals create reports, analyze data, and prepare financial strategies. Excel is an invaluable source of financial data analysis and most probably will be your best analytical tool until the end of your career. It is important to know how to use excel efficiently and effectively. Data manipulation, formatting and advanced formulae are few things we’ll be discussing in this course on- Excel for Finance.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/2_min.svg",
  //     markup_price: "999",
  //     offer_price: "299",
  //     enrollments: "1000+",
  //     perks: "",
  //     videos: "36",
  //     duration: "",
  //     requirements:
  //       'Two core ingredients<ul style="list-style-type: none;"><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Enthusiasm to learn</li><li><img src="/images/ArrowDown.svg" width="12px" height="12px" alt="toggle" style="transform: rotate(-90deg); margin-right: 1rem;" />Career focus</li></ul>',
  //     audience:
  //       "This is for everyone from beginner to pro. Although you may have a basic knowledge of Excel, you might not know about specialized functions that can make your job easier. If you are just a fresher, know that any interviewer, while hiring a potential candidate in the finance segment, looks for such practical skills.",
  //     categories: ["course"],
  //     instructors: ["mridula-devrani"],
  //     thinkific_course_id: 1537812,
  //   },
  //   "resume-building-and-interview-prep": {
  //     title: "Resume Building & Interview Prep",
  //     slug: "resume-building-and-interview-prep",
  //     is_featured: false,
  //     order: 8,
  //     tags: [1, 2, 3, 4, 5, 6, 7],
  //     short_description:
  //       "A resume is your entry card to an organization and that 20-min interview is your gold pass. So being able to communicate effectively would help you increase your chances manifold times to get your dream job. Learn the science & art of building a resume and prep for your interviews with CA Pooja Maloo.",
  //     long_description:
  //       "This course is your one-stop solution to Resume building, Interview preparation & guesstimates solving. Learn it all from the veteran in Corporate & Soft Skills Training, CA Pooja Maloo.\n\nPooja is a Chartered Accountant and an Internationally Certified Trainer (American Tesol). This course has been curated to provide practical solutions and strategies to ace the screening procedure with ease. She has over 12 years of experience in this field and has been instrumental in developing interview tactics and strategies for more than 50,000 job seekers.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/20_min.svg",
  //     markup_price: "1000",
  //     offer_price: "399",
  //     enrollments: "500+",
  //     perks: [
  //       "One-time personalized resume screening",
  //       "Premium Downloadable Resources / Templates like sample resume",
  //       "Guesstimates questions and HR & Technical Interview Material",
  //     ],
  //     videos: "12",
  //     duration: "",
  //     requirements:
  //       "We don't expect candidates to have any prior knowledge or expertise in the domain apart from basic understanding of English.",
  //     audience:
  //       "Any Graduate or Job-Seeker who wishes to ace resume building & interview preparation and land up to his or her dream job. It will particularly interest candidates who are in the early stage of their career and want to progress faster. ",
  //     categories: ["course"],
  //     instructors: ["pooja-maloo"],
  //     thinkific_course_id: 1443517,
  //   },
  //   "ethical-professional-standards": {
  //     title: "Ethical & Professional Standards",
  //     slug: "ethical-professional-standards",
  //     is_featured: false,
  //     order: null,
  //     tags: ["CFA Level 1", "15-20%"],
  //     short_description: "Topic Weight: 15-20%",
  //     long_description:
  //       "CFA Institute works extensively to impart the right values, ethics, and professional conduct to work in the financial industry. They include the detailed version of the CFA Institute Code of Ethics and Standards of Professional Conduct and Global Investment Performance Standards (GIPS®) to provoke ethical decision making and professionalism amongst the candidates. The depth of subject will equip the candidates to identify misconduct, be ethical in their work, understand the challenges and take proper decision henceforth.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/8_min.svg",
  //     markup_price: "1999",
  //     offer_price: "999",
  //     perks: "",
  //     videos: "8",
  //     duration: "",
  //     enrollments: "300+",
  //     requirements: "",
  //     audience: "",
  //     categories: ["cfa", "cfa_level_1"],
  //     instructors: ["pratik-bajaj"],
  //   },
  //   "quantitative-methods": {
  //     title: "Quantitative Methods",
  //     slug: "quantitative-methods",
  //     is_featured: false,
  //     order: null,
  //     tags: ["CFA Level 1", "8-12%"],
  //     short_description: "Topic Weight: 8-12%",
  //     long_description:
  //       "The mathematical and quantitative aspects of the finance and investment industry are covered here. The candidates are trained to approach the problems using statistical tools and analyze them thoroughly. In-depth knowledge of time value of money, hypothesis, regression analysis, return distributions are included in the curriculum from the very basics.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/15_min.svg",
  //     markup_price: "3749",
  //     offer_price: "2499",
  //     perks: "",
  //     videos: "67",
  //     duration: "",
  //     enrollments: "300+",
  //     requirements: "",
  //     audience: "",
  //     categories: ["cfa", "cfa_level_1"],
  //     instructors: ["kunal-shah"],
  //   },
  //   "economics-cfa-level-1": {
  //     title: "Economics",
  //     slug: "economics-cfa-level-1",
  //     is_featured: false,
  //     order: null,
  //     tags: ["CFA Level 1", "8-12%"],
  //     short_description: "Topic Weight: 8-12%",
  //     long_description:
  //       "This subject covers the conceptual knowledge of demand and supply for firms and consumers. The curriculum includes both microeconomics and macroeconomics. Concepts like growth factors, aggregate income and output measurements, business cycle’s effects on economic activity, are included to make candidates comfortable with day-to-day economics. ",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/10_min.svg",
  //     markup_price: "3499",
  //     offer_price: "1999",
  //     perks: "",
  //     videos: "72",
  //     duration: "",
  //     enrollments: "300+",
  //     requirements: "",
  //     audience: "",
  //     categories: ["cfa", "cfa_level_1"],
  //     instructors: ["pulkit-jajodia"],
  //   },
  //   "financial-reporting-analysis": {
  //     title: "Financial Reporting Analysis",
  //     slug: "financial-reporting-analysis",
  //     is_featured: false,
  //     order: null,
  //     tags: ["CFA Level 1", "13-17%"],
  //     short_description: "Topic Weight: 13-17%",
  //     long_description:
  //       "This subject lays down an important foundation for the candidates planning to enter the investment and banking industry. Detailed explanation on financial statements, inventories and their accounting, taxes, long term assets, revenue recognition is added along with the proper ways to identify methods under both US GAAP and IFRS. A thorough guide is created on how to understand and analyze financial statements, disclosures and notes. ",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/13_min.svg",
  //     markup_price: "3749",
  //     offer_price: "2499",
  //     perks: "",
  //     videos: "38",
  //     duration: "",
  //     enrollments: "300+",
  //     requirements: "",
  //     audience: "",
  //     categories: ["cfa", "cfa_level_1"],
  //     instructors: ["pratik-bajaj"],
  //   },
  //   "corporate-finance": {
  //     title: "Corporate Finance",
  //     slug: "corporate-finance",
  //     is_featured: false,
  //     order: null,
  //     tags: ["CFA Level 1", "8-12%"],
  //     short_description: "Topic Weight: 8-12%",
  //     long_description:
  //       "This subject gives a microscopic view into decision making in investing and financing problems, the idea of corporate governance and an understanding of stakeholder management. The concepts of working capital, leverage, internal rate of return, net present value are explained in a way that can be used regularly. It also includes a little of the impact of environmental and social considerations in the investing process.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/14_min.svg",
  //     markup_price: "2249",
  //     offer_price: "1499",
  //     perks: "",
  //     videos: "25",
  //     duration: "",
  //     enrollments: "300+",
  //     requirements: "",
  //     audience: "",
  //     categories: ["cfa", "cfa_level_1"],
  //     instructors: ["rishabh-dakalia"],
  //   },
  //   "equity-investments": {
  //     title: "Equity Investments",
  //     slug: "equity-investments",
  //     is_featured: false,
  //     order: null,
  //     tags: ["CFA Level 1", "10-12%"],
  //     short_description: "Topic Weight: 10-12%",
  //     long_description:
  //       "A practical insight into Equity investments, indexes, security markets and helping candidates to analyze the public companies to decide on investing. Valuation models are taught to know if the company is undervalued or overvalued. An outlook of the global market is given through this curriculum.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/16_min.svg",
  //     markup_price: "3749",
  //     offer_price: "2499",
  //     perks: "",
  //     videos: "52",
  //     duration: "",
  //     enrollments: "300+",
  //     requirements: "",
  //     audience: "",
  //     categories: ["cfa", "cfa_level_1"],
  //     instructors: ["kunal-shah", "rishabh-dakalia"],
  //   },
  //   "fixed-income": {
  //     title: "Fixed Income",
  //     slug: "fixed-income",
  //     is_featured: false,
  //     order: null,
  //     tags: ["CFA Level 1", "10-12%"],
  //     short_description: "Topic Weight: 10-12%",
  //     long_description:
  //       "The subject adds the introduction of fixed income securities, tools, their valuation, risk factors, and yield measures. Various methods of yields, values of securities, risk and return of bonds, principles of credit analysis and asset-backed securities.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/9_min.svg",
  //     markup_price: "3499",
  //     offer_price: "1999",
  //     perks: "",
  //     videos: "58",
  //     duration: "",
  //     enrollments: "300+",
  //     requirements: "",
  //     audience: "",
  //     categories: ["cfa", "cfa_level_1"],
  //     instructors: ["rishabh-dakalia"],
  //   },
  //   "derivatives-cfa-level-1": {
  //     title: "Derivatives",
  //     slug: "derivatives-cfa-level-1",
  //     is_featured: false,
  //     order: null,
  //     tags: ["CFA Level 1", "5-8%"],
  //     short_description: "Topic Weight: 5-8%",
  //     long_description:
  //       "This topic gives an in-depth knowledge of derivatives and their markets. Basics of futures, swaps, options and forwards are given with their features and valuation methods. Pricing and valuation of the tools and their drivers are explained and decision making about the instrument being undervalued and overvalued.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/12_min.svg",
  //     markup_price: "2249",
  //     offer_price: "1499",
  //     perks: "",
  //     videos: "21",
  //     duration: "",
  //     enrollments: "300+",
  //     requirements: "",
  //     audience: "",
  //     categories: ["cfa", "cfa_level_1"],
  //     instructors: ["kunal-shah"],
  //   },
  //   "alternative-investments": {
  //     title: "Alternative Investments",
  //     slug: "alternative-investments",
  //     is_featured: false,
  //     order: null,
  //     tags: ["CFA Level 1", "5-8%"],
  //     short_description: "Topic Weight: 5-8%",
  //     long_description:
  //       "Instruments other than equity and bonds are explained, like real estate, venture capital, hedge fund, private equity, commodities and infrastructure. Methods of valuation, diversification, risk and returns of instruments are taught. Candidates understand these instruments and their workings due to changes in the economy.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/17_min.svg",
  //     markup_price: "1749",
  //     offer_price: "999",
  //     perks: "",
  //     videos: "5",
  //     duration: "",
  //     enrollments: "300+",
  //     requirements: "",
  //     audience: "",
  //     categories: ["cfa", "cfa_level_1"],
  //     instructors: ["kunal-shah"],
  //   },
  //   "portfolio-management-cfa-level-1": {
  //     title: "Portfolio Management",
  //     slug: "portfolio-management-cfa-level-1",
  //     is_featured: false,
  //     order: null,
  //     tags: ["CFA Level 1", "5-8%"],
  //     short_description: "Topic Weight: 5-8%",
  //     long_description:
  //       "Through concepts of modern pricing theory, capital asset pricing model, risk and return of portfolio construction, diversification ways, Portfolio Management is taught. This topic teaches for individual and institutional solutions regarding the investment decision, allocation strategy and risk and returns measurements.",
  //     image_url: "https://valuationary-react-static.s3.ap-south-1.amazonaws.com/course-thumbs/svg/min/11_min.svg",
  //     markup_price: "2249",
  //     offer_price: "1499",
  //     perks: "",
  //     videos: "22",
  //     duration: "",
  //     enrollments: "300+",
  //     requirements: "",
  //     audience: "",
  //     categories: ["cfa", "cfa_level_1"],
  //     instructors: ["pratik-bajaj"],
  //   },
  // };

  // const course_tags = [
  //   "Corporate Banking",
  //   "Investment Banking",
  //   "Venture Capital / Private Equity (VC/PE)",
  //   "Management Consulting",
  //   "Investment management",
  //   "Equity Research",
  //   "Entrepreneurship (Founders)",
  // ];

  // (async () => {
  //   for (let id in courses) {
  //     // if (!courses[id].order) courses[id].order = course.order;
  //     // courses[id].chapters = chapters[id];

  //     if (courses[id].categories.indexOf("cfa") >= 0) {
  //       courses[id].perks = [
  //         "Live on-demand doubt session with instructor",
  //         "Learn from CFA charterholders with years of work-experience",
  //         "Softcopy of summarized notes",
  //         "Subject test modules",
  //         "Focus on practical application aligned with CFA exam",
  //         'Access to elite "Valued" community',
  //         "Premium Downloadable Resources/Templates",
  //       ];
  //     }
  //     if (courses[id].categories.indexOf("course") >= 0) {
  //       if (!courses[id].perks)
  //         courses[id].perks = [
  //           "Live on-demand doubt session with instructor",
  //           "Industry recognized certificate",
  //           'Access to elite "Valued" community',
  //           "Premium Downloadable Resources/Templates",
  //         ];

  //       let updated_tags = [];
  //       for (let tagID in courses[id].tags) {
  //         updated_tags.push(course_tags[tagID]);
  //       }
  //       courses[id].tags = updated_tags;
  //     }

  //     courses[id].perks = courses[id].perks.map((t) => ({ text: t }));
  //     courses[id].tags = courses[id].tags.map((t) => ({ text: t }));

  //     courses[id].categories = courses[id].categories.map(async (category) => {
  //       const result = await models.categories.findOne({ name: category });
  //       // console.log(result);
  //       return result.id;
  //     });
  //     courses[id].categories = await Promise.all(courses[id].categories);

  //     courses[id].instructors = courses[id].instructors.map(async (instructor) => {
  //       const result = await models.instructors.findOne({ slug: instructor });
  //       // console.log(result);
  //       return result.id;
  //     });
  //     courses[id].instructors = await Promise.all(courses[id].instructors);

  //     if (!courses[id].videos) {
  //       let totalVideos = 0;
  //       for (let chapter of courses[id].chapters) {
  //         totalVideos += chapter.sub_items.length > 0 ? chapter.sub_items.length : 1;
  //       }
  //       courses[id].videos = totalVideos;
  //     }
  //     if (courses[id].offer_price)
  //       courses[id].discount = Math.round(
  //         100 * (1.0 - parseInt(courses[id].offer_price) / parseInt(courses[id].markup_price)),
  //       );

  //     courses[id].itemLink = "/course/" + id;
  //     if (!courses[id].reviews) courses[id].reviews = [];

  //     let existing = await models.courses.findOne({ slug: id });
  //     if (existing) {
  //       await models.courses.updateOne({ slug: id }, { $set: { ...existing, ...courses[id] } });
  //     } else {
  //       await models.courses(courses[id]).save();
  //     }
  //   }

  //   console.log(courses);
  // })();

  // const chapters = {
  //   "technical-analysis-cash-equity": [
  //     {
  //       title: "Psychology of Trading",
  //       sub_items: [
  //         {
  //           title: "Role of emotions in Trading and Pillars of successful trading",
  //           video_link: "https://www.youtube.com/embed/weSLN8U4QTw",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Principles of Technical Analysis",
  //       sub_items: [
  //         "Chart Types ",
  //         "Support/ Resistance and Trends",
  //         "Multi Timeframe Analysis",
  //         "Understanding of Gaps - Gap up & Gap down",
  //       ],
  //     },
  //     {
  //       title: "Moving Averages",
  //       sub_items: [
  //         "Simple vs. Exponential Moving Averages | Moving Average Crossovers | Moving Average Confluence for Stock selection",
  //       ],
  //     },
  //     {
  //       title: "Dow Theory",
  //       sub_items: ["Market Moves & Phases", "Confirmation to Averages"],
  //     },
  //     {
  //       title: "Fibonacci Retracement",
  //       sub_items: ["Theoretical Backdrop and Practical Application", "Plotting multi-fibo for defining targets"],
  //     },
  //     {
  //       title: "Relative Strength Index (RSI)",
  //       sub_items: ["RSI Concept and Myths (Overbought/Oversold)", "Classical RSI Divergence", "Hidden RSI Divergence"],
  //     },
  //     {
  //       title: "Moving Average Convergence & Divergence (MACD)",
  //       sub_items: ["MACD Concept & Components - MACD Line, Signal Line", "Mean Reversion & Back-testing"],
  //     },
  //     {
  //       title: "Bollinger Bands",
  //       sub_items: ["BB Concept & application for identifying supports/resistance/breakouts"],
  //     },
  //     {
  //       title: "Candlestick Patterns",
  //       sub_items: ["Different types of Japanese Candlesticks", "Relative analysis of candlesticks"],
  //     },
  //     {
  //       title: "Chart Patterns",
  //       sub_items: ["Psychology behind charts", "Chart Patterns / Setups with Moving average Elements"],
  //     },
  //   ],
  //   "python-for-finance": [
  //     {
  //       title: "Introduction to Python",
  //       sub_items: ["Installation", "Syntax & Indentation", "Comments", "Variables & Keywords"],
  //     },
  //     {
  //       title: "Data Types",
  //       sub_items: ["Introduction & Numeric Data Types", "Strings", "Booleans", "Operators"],
  //     },
  //     {
  //       title: "In-built Data Structures",
  //       sub_items: ["List", "Dictionary & Tuples", "If-Else & Loop"],
  //     },
  //     {
  //       title: "Python for Finance",
  //       sub_items: [
  //         "Time Value of Money - I",
  //         "Time Value of Money - II",
  //         "Equity Analysis - I",
  //         "Equity Analysis - II",
  //       ],
  //     },
  //   ],
  //   "finance-for-founders": [
  //     {
  //       title: "Introduction to finance",
  //       sub_items: ["Fundraising vs. Bootstrapping", "Key metrics"],
  //     },
  //     {
  //       title: "Fundraising",
  //       sub_items: ["Why raise money?", "When to raise money?", "How much to raise?"],
  //     },
  //     {
  //       title: "Fundraising Process",
  //       sub_items: [
  //         "Getting the story right",
  //         "Valuation-01",
  //         "Valuation-02",
  //         "Financing Instruments",
  //         "Rounds of financing",
  //       ],
  //     },
  //     {
  //       title: "Internal Finances",
  //       sub_items: ["How to manage day-to-day finances - Keeping the books clean"],
  //     },
  //     {
  //       title: "Government grants",
  //       sub_items: [
  //         "How to apply for grants and manage application",
  //         "Money utilization of grants received - Where and How?",
  //       ],
  //     },
  //   ],
  //   "beginner-s-guide-to-investing": [
  //     {
  //       title: "Introduction to Personal Finance",
  //       sub_items: [
  //         {
  //           title: "Insurance",
  //           sub_items: [
  //             {
  //               title: "What is Insurance & what are its types",
  //               // video_link: "https://www.youtube.com/embed/uPqNNshSA9I",
  //             },
  //             {
  //               title: "When to buy Insurance",
  //               // video_link: "https://www.youtube.com/embed/jLdwFGtaMcA",
  //             },
  //             {
  //               title: "How much insurance to buy",
  //               // video_link: "https://www.youtube.com/embed/I3YGFeyxr98",
  //             },
  //             {
  //               title: "Which insurance to buy",
  //               // video_link: "https://www.youtube.com/embed/aTQUB_1jREg",
  //             },
  //             {
  //               title: "How to buy - Online vs. Offline",
  //               // video_link: "https://www.youtube.com/embed/aTQUB_1jREg",
  //             },
  //           ],
  //         },
  //         {
  //           title: "Savings vs. Investments",
  //           sub_items: [
  //             "Why save? and thumb rules of savings & budgeting",
  //             "Why invest? - Power of compounding - 8th wonder of the world & why beating inflation is necessary",
  //             "Computing Future Value, Present Value, Regular PMT, etc. - Use of financial calculator / Use of Excel",
  //             { title: "Goal based Investing", video_link: "https://www.youtube.com/embed/XMajsKVHiGk" },
  //             {
  //               title: "Three case studies",
  //               sub_items: [
  //                 "Renting a house vs. buying one",
  //                 {
  //                   title: "Taking OLA / UBER vs. buying a car",
  //                   video_link: "https://www.youtube.com/embed/fXYaYMDknhc",
  //                 },
  //                 "Debit Card vs. Credit Card",
  //               ],
  //             },
  //             {
  //               title: "Passive Investing Strategy",
  //               video_link: "https://www.youtube.com/embed/i8iamaKZ5iM",
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //     {
  //       title: "Investment Avenues",
  //       sub_items: [
  //         {
  //           title: "Introduction to various asset classes",
  //           sub_items: [
  //             {
  //               title: "What are these asset classes? ",
  //               sub_items: ["Equity", "Bonds (Company & Government)", "FDs", "Gold", "Real Estate", "Cryptocurrencies"],
  //             },
  //             "Return in these asset classes",
  //             "Risk in these asset classes",
  //             {
  //               title: "Mutual Funds & ETFs",
  //               sub_items: ["What do they do?", "How to select one?", "How to invest in them?"],
  //             },
  //             "What combination of asset classes is best suited for you - Risk Profiling & Portfolio approach of investing",
  //           ],
  //         },
  //         {
  //           title: "Staying away from Ponzi schemes",
  //           sub_items: ["Meaning", "Examples: Sahara Scam, and other examples"],
  //         },
  //       ],
  //     },
  //     {
  //       title: "Tax Planning",
  //       sub_items: [
  //         "Income Tax - slabs",
  //         "Assets classes and their Tax implications",
  //         "Old Regime vs. New Regime",
  //         "How can you save Taxes using various instruments",
  //       ],
  //     },
  //     {
  //       title: "Retirement Planning",
  //       sub_items: [
  //         "Regular Liquidity needs post retirement",
  //         "Calculating Portfolio value at the time of retirement",
  //         "Amount that can be saved at regular intervals",
  //         "Required rate of return Calculation on Excel / Financial Calculator",
  //       ],
  //     },
  //   ],
  //   "stock-market": [
  //     {
  //       title: "Equity as an assets class- Detailed Analysis",
  //       sub_items: ["Equity"],
  //     },
  //     {
  //       title: "Equity Strategy",
  //       sub_items: [
  //         "Strategy 01",
  //         "Strategy 02",
  //         "Applying strategy on a set of 4000 listed companies",
  //         "Bonus: Annual Report Reading Hacks",
  //       ],
  //     },
  //     { title: "Exit Strategy", sub_items: ["Re-balancing and Exit Strategy"] },
  //     {
  //       title: "Trade Execution",
  //       sub_items: ["Demat Account Opening & Punching Trades"],
  //     },
  //   ],
  //   "portfolio-management-with-entry-exit-strategies": [
  //     {
  //       title: "Introduction to the course",
  //       sub_items: [
  //         {
  //           title: "What is Portfolio Management?",
  //           video_link: "https://www.youtube.com/embed/SyU4oWBTnyI",
  //         },
  //         {
  //           title: "Why Portfolio Management Course?",
  //           video_link: "https://www.youtube.com/embed/i6-ruhMgPHE",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Portfolio Approach of Investment Management",
  //       sub_items: ["Diversification & the Holy Grail by Ray Dalio", "Model Portfolio & Efficient Frontier"],
  //     },
  //     {
  //       title: "Assets classes- Detailed Analysis",
  //       sub_items: [
  //         "Equity",
  //         "Real Estate",
  //         {
  //           title: "Gold",
  //           video_link: "https://www.youtube.com/embed/g-Ipd_MCoTI?start=613",
  //         },
  //         "Fixed Income Securities",
  //       ],
  //     },
  //     {
  //       title: "Investment Policy Statement",
  //       sub_items: ["Financial Planning", "Case Study: Problem Statement", "Case Study: Solution"],
  //     },
  //     {
  //       title: "Equity Strategy",
  //       sub_items: [
  //         "Equity Strategy 01",
  //         "Equity Strategy 02 - Understanding",
  //         "Equity Strategy 02 - Application",
  //         "Bonus: Annual Report Reading Hacks",
  //       ],
  //     },
  //     {
  //       title: "Risk Management",
  //       sub_items: [
  //         "Tools: Beta Estimation and Average Volatility",
  //         "Tools: Sortino Ratio, Sharpe Ratio and Information Ratio",
  //         "Tools: VaR (Value at Risk)",
  //         "Lessons from Bubbles and Biases",
  //       ],
  //     },
  //     { title: "Mutual Fund", sub_items: ["Scheme Selection and Analysis"] },
  //     { title: "Exit Strategy", sub_items: ["Exit Strategy"] },
  //     {
  //       title: "Trade Execution",
  //       sub_items: ["Demat Account Opening & Punching Trades"],
  //     },
  //   ],
  //   "financial-modeling-business-valuations": [
  //     {
  //       title: "Introduction to Financial Modeling and Business Valuation",
  //       sub_items: [
  //         {
  //           title: "What is Financial Modeling?",
  //           video_link: "https://www.youtube.com/embed/IHsS_ZaysjY?start=1",
  //         },
  //         {
  //           title: "Why Financial Modeling course?",
  //           video_link: "https://www.youtube.com/embed/qOPVKQFZUEk",
  //         },
  //         {
  //           title: "Why Financial Modeling Course with Valuationary?",
  //           video_link: "https://www.youtube.com/embed/Y5S96i0mfYk",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Business Understanding",
  //       sub_items: ["Understanding subject company", "Industry analysis"],
  //     },
  //     {
  //       title: "Fundamental analysis",
  //       sub_items: ["Boston Matrix", "McKinsey Matrix", "Boston and McKinsey - USL"],
  //     },
  //     {
  //       title: "Forecasting Income Statement",
  //       sub_items: [
  //         {
  //           title: "Revenue Growth",
  //           video_link: "https://www.youtube.com/embed/0SxT4wyMR-0",
  //         },
  //         "Operating expenses",
  //         "Non-operating expenses",
  //       ],
  //     },
  //     {
  //       title: "Forecasting Balance Sheet",
  //       sub_items: [
  //         "Understanding Tangible Assets",
  //         "Tangible Assets",
  //         "Non-Current Assets- 01",
  //         "Non-Current Assets- 02",
  //         "Current Assets",
  //         "Non- current & Current Liabilities",
  //       ],
  //     },
  //     {
  //       title: "Forecasting Cashflow Statement",
  //       sub_items: ["Operating Cash flow", "Investing and Financing Cash Flow"],
  //     },
  //     {
  //       title: "Valuation",
  //       sub_items: [
  //         "Cost of Equity",
  //         "Weighted Average Cost of Capital",
  //         "Discounted Cashflow (DCF) Approach",
  //         "Relative Valuation",
  //         "Scenario Analysis",
  //         "Football Field Analysis",
  //         "Relative Valuation Multiples- All industries",
  //       ],
  //     },
  //     {
  //       title: "Mergers & Acquisitions",
  //       sub_items: ["Why M&As fail | Why valuations matter | How to value deals"],
  //     },
  //     {
  //       title: "Excel Crash Course",
  //       sub_items: [
  //         "Excel for Finance",
  //         "Excel- Tools & Tricks",
  //         "Macros for regular financial analysis from data dump",
  //         "Core Finance on Excel- IRR, NPV, Payback Period",
  //       ],
  //     },
  //   ],
  //   "financial-modeling-business-valuations-synopsis": [
  //     {
  //       title: "Income Statement Forecasting",
  //       sub_items: ["Sales Projection", "Cost Estimation"],
  //     },
  //     {
  //       title: "Balance Sheet Forecasting",
  //       sub_items: ["Assets & Liabilities Forecasting"],
  //     },
  //     { title: "Cash Flow Estimation", sub_items: ["CFO-CFI-CFF"] },
  //     {
  //       title: "Cost of Capital",
  //       sub_items: [
  //         {
  //           title: "Cost of Capital Estimation",
  //           video_link: "https://www.youtube.com/embed/wr_7yDvbpXk",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Valuation - Absolute & Relative",
  //       sub_items: ["Absolute Valuation - DCF", "Relative Valuation - Peer Comparison through Multiples"],
  //     },
  //   ],
  //   "excel-for-finance": [
  //     {
  //       title: "Excel Layout",
  //       sub_items: [
  //         "Layout Overview",
  //         "Workbook, Worksheet, Cells and Formula Bar",
  //         "Ribbon Structure",
  //         "Keyboard Navigations",
  //       ],
  //     },
  //     {
  //       title: "Excel Settings",
  //       sub_items: ["General and Formula Settings", "Advance Excel Settings", "Excel add in"],
  //     },
  //     {
  //       title: "Basic Financial Setup",
  //       sub_items: ["Background formatting and Numbers setting", "Paste special and page view settings"],
  //     },
  //     {
  //       title: "Advance Financial Setup",
  //       sub_items: ["Grouping, Organization and duplicating sheets", "Conditional Formatting", "Go to Special"],
  //     },
  //     {
  //       title: "Functions and Formulas",
  //       sub_items: [
  //         "Date and Year - TODAY, YEAR, MONTH, DAY and DATE, EOMONTH, EDATE",
  //         "Basic Formulas",
  //         "IF and related functions",
  //         "Advance Formulas- VLookup, HLookup, Index, Match, Choose, Indifferent, Offset",
  //         "TEXT functions, CONCATENATE",
  //         "MACROs",
  //       ],
  //     },
  //     {
  //       title: "Charts and Graphs",
  //       sub_items: ["Basic Charting", "Dynamic Charting", "Dashboard"],
  //     },
  //     {
  //       title: "Financial Data Analysis",
  //       sub_items: [
  //         "Sensitivity Analysis of Revenue and Cost",
  //         "EMI Calculation",
  //         "Basic and Advanced usage of Pivot Tables",
  //       ],
  //     },
  //     {
  //       title: "Organization",
  //       sub_items: ["Data Sorting and Filtering", "Tabulation", "Data Validation"],
  //     },
  //     {
  //       title: "Time Value of Money",
  //       sub_items: ["Basic Functions- PV, FV, Rate, NPER, PMT", "Advance Functions- IRR, NVP, XIRR, MIRR, Effect"],
  //     },
  //   ],
  //   "resume-building-and-interview-prep": [
  //     {
  //       title: "Basics of Screening Procedure",
  //       sub_items: [{ title: "", video_link: "https://www.youtube.com/embed/rQVgjO0NggA" }],
  //     },
  //     {
  //       title: "Resume & CV",
  //       sub_items: [
  //         "Basics of Resume & CV",
  //         "How to make a Resume?",
  //         "Difference between Resume & CV",
  //         "DOs & DON'Ts of Resume: Common mistakes",
  //       ],
  //     },
  //     { title: "Telephonic Interview" },
  //     { title: "Group Discussion" },
  //     { title: "Guesstimates" },
  //     { title: "Common HR Questions" },
  //     { title: "Tips & Tricks for cracking the interview" },
  //     { title: "Technical Interviews " },
  //   ],
  //   "ethical-professional-standards": [
  //     { title: "Ethics and Trust in the Investment Profession" },
  //     { title: "Code of Ethics and Standards of Professional Conduct" },
  //     { title: "Guidance for Standards I-VII" },
  //     {
  //       title: "Introduction to the Global Investment Performance Standards (GIPS)",
  //     },
  //     { title: "Global Investment Performance Standards (GIPS)" },
  //   ],
  //   "quantitative-methods": [
  //     {
  //       title: "Time Value of Money",
  //       sub_items: [
  //         {
  //           title: "Basics of Time Value of Money (TVM)",
  //           // video_link: "https://www.youtube.com/embed/yoSU-rcntkU"
  //         },
  //         "Effective Annual Rate & Components of Interest Rate",
  //         "Examples of EAR & Present-Future Value",
  //         "Basic Examples of TVM & Ordinary Annuity",
  //         "Examples of Annuity Due",
  //         "Examples of Perpetuity",
  //         "Examples of Uneven Cash Flows & Simple TVM ",
  //         "Tough Examples",
  //         "Cash Flow additive principle",
  //         {
  //           title: "Using BA II Plus Calculator",
  //           // video_link: "https://www.youtube.com/embed/dt8vW5BXfJk"
  //         },
  //       ],
  //     },
  //     { title: "Statistical Concepts and Market Returns" },
  //     { title: "Probability Concepts" },
  //     { title: "Common Probability Distribution" },
  //     { title: "Sampling and Estimation" },
  //     { title: "Hypothesis Testing" },
  //   ],
  //   "economics-cfa-level-1": [
  //     { title: "Introduction to Economics Curriculum", video_link: "https://www.youtube.com/embed/NtyRTrOraBk" },
  //     {
  //       title: "Topics in Demand & Supply Analysis",
  //       sub_items: [
  //         { title: "Overview of Demand Analysis", video_link: "https://www.youtube.com/embed/TOvyM7Hx-UM" },
  //         { title: "Overview of Supply Analysis", video_link: "https://www.youtube.com/embed/ULt1MEG7W4w" },
  //       ],
  //     },
  //     { title: "The Firm and Market Structures" },
  //     {
  //       title: "Aggregate Output, Prices, and Economic Growth",
  //       video_link: "https://www.youtube.com/embed/2fbmAJIPbN4",
  //     },
  //     {
  //       title: "Understanding Business Cycles",
  //       sub_items: [
  //         {
  //           title: "Overview of Understanding Business Cycles",
  //           video_link: "https://www.youtube.com/embed/7W6uUnDQWiQ",
  //         },
  //       ],
  //     },
  //     { title: "Monetary and Fiscal Policy" },
  //     { title: "International Trade and Capital Flows" },
  //     { title: "Currency Exchange Rates" },
  //   ],
  //   "financial-reporting-analysis": [
  //     {
  //       title: "Introduction to FRA",
  //       sub_items: [
  //         {
  //           title: "Introduction",
  //           video_link: "https://www.youtube.com/embed/qLK4de3srsU",
  //         },
  //       ],
  //     },
  //     {
  //       title: "Introduction to Financial Statement Analysis",
  //       sub_items: ["Introduction"],
  //     },
  //     {
  //       title: "Financial Reporting Standards",
  //       sub_items: ["Standards and Framework"],
  //     },
  //     {
  //       title: "Understanding Income Statements",
  //       sub_items: [
  //         "Income statement and revenue recognition",
  //         "Expense Recognition- 01",
  //         "Expense Recognition- 02",
  //         "EPS",
  //         "Diluted EPS",
  //       ],
  //     },
  //     {
  //       title: "Understanding Balance Sheets",
  //       sub_items: ["Introduction", "Financial Assets"],
  //     },
  //     {
  //       title: "Understanding Cash Flow Statements",
  //       sub_items: [
  //         "Introduction",
  //         "Direct & Indirect Method of CFS",
  //         "Converting Direct CFS to Indirect CFS",
  //         "Free cash flows and ratios",
  //       ],
  //     },
  //     {
  //       title: "Financial Analysis Techniques",
  //       sub_items: [
  //         "Financial Analysis Techniques",
  //         "Activity and Liquidity Ratios",
  //         "Solvency & Profitability Ratio",
  //         "Dupont analysis",
  //       ],
  //     },
  //     {
  //       title: "Inventories",
  //       sub_items: ["Introduction", "Converting LIFO to FIFO", "Inventory Valuation"],
  //     },
  //     {
  //       title: "Long-Lived Assets",
  //       sub_items: [
  //         "Introduction",
  //         "Expensing vs. Capitalizing",
  //         "Depreciation",
  //         "Long lived asset reporting",
  //         "Investment Property",
  //         "De-recognition of assets",
  //         "Summary- analysis",
  //       ],
  //     },
  //     {
  //       title: "Income Taxes",
  //       sub_items: ["Introduction", "Change in rate and reversal", "GAAP vs IFRS"],
  //     },
  //     {
  //       title: "Non-Current (Long-Term) Liabilities ",
  //       sub_items: ["Bonds", "Issued @ Par, Discount and Premium", "Leases", "Pension plans"],
  //     },
  //     {
  //       title: "Financial Reporting Quality",
  //       sub_items: ["Financial Reporting Quality", "Aggressive vs Conservative reporting"],
  //     },
  //     {
  //       title: "Application on Financial Statement Analysis",
  //       sub_items: ["Application of financial reporting analysis"],
  //     },
  //   ],
  //   "corporate-finance": [
  //     { title: "Introduction to Corporate Governance and other ESG" },
  //     { title: "Capital Budgeting" },
  //     { title: "Cost of Capital" },
  //     { title: "Measures of Leverage" },
  //     { title: "Working Capital Management" },
  //   ],
  //   "equity-investments": [
  //     {
  //       title: "Market Organization and Structure",
  //       sub_items: [
  //         {
  //           title: "Introduction",
  //           video_link: "https://www.youtube.com/embed/tEaed5qRQkc",
  //         },
  //       ],
  //     },
  //     { title: "Security Market Indexes" },
  //     { title: "Market Efficiency" },
  //     { title: "Overview of Equity Securities" },
  //     { title: "Introduction to Industry and Company Analysis" },
  //     { title: "Equity Valuation: Concepts & Basic Tools" },
  //   ],
  //   "fixed-income": [
  //     { title: "Fixed Income Securities: Defining Elements" },
  //     { title: "Fixed-Income Markets: Issuance, Trading and Funding" },
  //     { title: "Introduction to Fixed Income Valuation" },
  //     { title: "Introduction to Asset-Backed Securities" },
  //     { title: "Understanding Fixed-Income Risk & Return" },
  //     { title: "Fundamentals of Credit Analysis" },
  //   ],
  //   "derivatives-cfa-level-1": [
  //     {
  //       title: "Derivatives Markets & Instruments",
  //       sub_items: [
  //         {
  //           title: "Introduction",
  //           video_link: "https://www.youtube.com/embed/qamfeQcmxQ0",
  //         },
  //         "Forwards",
  //         "Futures",
  //         "Swaps",
  //         "Options",
  //         "Credit Derivatives",
  //         "Arbitrage",
  //       ],
  //     },
  //     {
  //       title: "Basics of Derivatives Pricing and Valuation",
  //       sub_items: [
  //         "Introduction",
  //         "Pricing & Valuing Forward Contracts",
  //         "Forward Contracts with Costs & Benefits",
  //         "Cost of Carry",
  //         "Forwards Vs. Futures",
  //         "FRA (Forward Rate Agreement)",
  //         "Synthetic FRA",
  //         "Swaps vs. Forward Contracts",
  //         "Option Valuation",
  //         "Factors affecting Option Value",
  //         "Put Call Parity",
  //         "Replication using Put-Call Parity",
  //         "Binomial Model - Option Pricing",
  //         "Types of Options - European Vs. American",
  //       ],
  //     },
  //   ],
  //   "alternative-investments": [{ title: "Introduction to Alternative Investments" }],
  //   "portfolio-management-cfa-level-1": [
  //     { title: "Portfolio Management: An overview" },
  //     { title: "Portfolio Risk and Return: Part 1" },
  //     { title: "Portfolio Risk and Return: Part 2" },
  //     { title: "Basics of Portfolio Planning and Construction" },
  //     { title: "Introduction to Risk Management" },
  //     { title: "Technical Analysis" },
  //     { title: "Fintech in Investment Management" },
  //   ],
  // };

  // const chapter = { title: undefined, sub_items: undefined, video_link: undefined };
  // // let all_chapters = [];

  // function wrapChapters(items) {
  //   return (
  //     Array.isArray(items) &&
  //     items.map((item) => {
  //       let wrapt = {};
  //       if (typeof item === "object") {
  //         if (item.title) wrapt.title = item.title;
  //         if (item.video_link) wrapt.video_link = item.video_link;
  //         if (item.numbered_list) wrapt.numbered_list = item.numbered_list;
  //         if (item.sub_items) {
  //           wrapt.sub_items = wrapChapters(item.sub_items);
  //         }
  //       }
  //       if (typeof item === "string") wrapt.title = item;
  //       // all_chapters.push(wrapt);
  //       return wrapt;
  //     })
  //   );
  // }

  // for (let course in chapters) {
  //   chapters[course] = wrapChapters(chapters[course]);
  // }
  // // console.log(all_chapters);
  // console.log(chapters);

  // // all_chapters.forEach(async (chapter) => {
  // //   console.log("processing...", chapter.title);
  // //   chapter = { ...chapter, sub_items: [] };
  // //   let existing = await models.chapters.findOne({ title: chapter.title });
  // //   if (existing) {
  // //     console.log("existing", chapter.title);
  // //     await models.chapters.updateOne({ title: chapter.title }, { $set: { ...existing, ...chapter } });
  // //   } else {
  // //     console.log("new", chapter.title);
  // //     await new models.chapters(chapter).save();
  // //   }
  // // });

  // (async () => {
  //   for (let slug in chapters) {
  //     let course = await models.courses.findOne({ slug: slug });
  //     if (course) {
  //       let chapter_ids = await updateSubItems(chapters[slug], course._id, "course");
  //       console.log(chapter_ids);
  //       course.chapters = chapter_ids;
  //       await course.save();
  //     }
  //   }

  //   async function updateSubItems(items, parent_id, parent_type) {
  //     if (!Array.isArray(items)) return [];
  //     if (!parent_id || !parent_type) throw Error("parent_id and parent_type both are mandatory");

  //     var results = [];
  //     for (let i = 0; i < items.length; i++) {
  //       let chapter = { ...items[i], sub_items: [] };
  //       chapter.parent = { entity_id: parent_id, entity_type: parent_type };

  //       let filters = { "title": chapter.title, "parent.entity_id": parent_id, "parent.entity_type": parent_type };
  //       let existing = await models.chapters.findOne(filters);
  //       if (existing) {
  //         console.log("existing", chapter.title);
  //         await models.chapters.updateOne(filters, { $set: { ...existing, ...chapter } });
  //       } else {
  //         console.log("new", chapter.title);
  //         await models.chapters.create(chapter);
  //       }

  //       chapter = await models.chapters.findOne(filters);
  //       if (items[i].sub_items && items[i].sub_items.length > 0) {
  //         let chapter_ids = await updateSubItems(items[i].sub_items, chapter._id, "chapter");
  //         console.log(chapter.title, chapter_ids);
  //         chapter.sub_items = chapter_ids;
  //         await chapter.save();
  //       }
  //       results.push(chapter._id);
  //     }
  //     return results;
  //   }
  // })();

  // old

  // function wrapChapters(items) {
  //   return (
  //     Array.isArray(items) &&
  //     items.map((item) => {
  //       let wrapt = {};
  //       if (typeof item === "object") {
  //         if (item.title) wrapt.title = item.title;
  //         if (item.video_link) wrapt.video_link = item.video_link;
  //         if (item.numbered_list) wrapt.numbered_list = item.numbered_list;
  //         if (item.sub_items) {
  //           wrapt.sub_items = wrapChapters(item.sub_items);
  //         }
  //       }
  //       if (typeof item === "string") wrapt.title = item;
  //       all_chapters.push(wrapt);
  //       return wrapt;
  //     })
  //   );
  // }

  // for (let course in chapters) {
  //   chapters[course] = wrapChapters(chapters[course]);
  // }
  // console.log(all_chapters);
  // console.log(chapters);

  // all_chapters.forEach(async (chapter) => {
  //   chapter = { ...chapter, sub_items: [] };
  //   let existing = await models.chapters.findOne({ title: chapter.title });
  //   if (existing) {
  //     console.log("existing");
  //     await models.chapters.updateOne({ title: chapter.title }, { $set: { ...existing, ...chapter } });
  //   } else {
  //     console.log("new");
  //     new models.chapters(chapter).save();
  //   }
  // });

  // (async () => {
  //   async function updateSubItems(items) {
  //     if (Array.isArray(items)) {
  //       return await Promise.all(
  //         items.map(async (item) => {
  //           let chapter = await models.chapters.findOne({ title: item.title });
  //           chapter.sub_items = [];
  //           await chapter.save();
  //           if (item.sub_items && item.sub_items.length > 0) {
  //             chapter = await models.chapters.findOne({ title: item.title });
  //             let chapter_ids = await updateSubItems(item.sub_items);
  //             console.log(chapter_ids);
  //             chapter.sub_items = chapter_ids;
  //             await chapter.save();
  //           }

  //           return chapter.id;
  //         }),
  //       );
  //     }
  //     return [];
  //   }

  //   for (let slug in chapters) {
  //     let course = await models.courses.findOne({ slug: slug });
  //     if (course) {
  //       let chapter_ids = await updateSubItems(chapters[slug]);
  //       console.log(chapter_ids);
  //       course.chapters = chapter_ids;
  //       await course.save();
  //     }
  //   }
  // })();

  // let filter = { is_deleted: { $exists: true } };
  // let rename = { $rename: { is_deleted: "active" } };
  // let update = { $set: { active: true } };
  // let unset = { $unset: { is_deleted: false } };
  // (async () => {
  //   console.log("orders", await models.orders.updateMany(filter, rename));
  //   console.log("payments", await models.payments.updateMany(filter, rename));
  //   console.log("webhooks", await models.webhooks.updateMany(filter, rename));
  //   console.log("newsletter_list", await models.newsletter_list.updateMany(filter, rename));
  //   console.log("roles", await models.roles.updateMany(filter, rename));
  //   console.log("users", await models.users.updateMany(filter, rename));
  //   console.log("reviews", await models.reviews.updateMany(filter, rename));
  //   console.log("categories", await models.categories.updateMany(filter, rename));
  //   console.log("coupons", await models.coupons.updateMany(filter, rename));
  //   console.log("instructors", await models.instructors.updateMany(filter, rename));
  //   console.log("chapters", await models.chapters.updateMany(filter, rename));
  //   console.log("courses", await models.courses.updateMany(filter, rename));
  //   console.log("bundles", await models.bundles.updateMany(filter, rename));

  //   console.log("orders", await models.orders.updateMany({}, update));
  //   console.log("payments", await models.payments.updateMany({}, update));
  //   console.log("webhooks", await models.webhooks.updateMany({}, update));
  //   console.log("newsletter_list", await models.newsletter_list.updateMany({}, update));
  //   console.log("roles", await models.roles.updateMany({}, update));
  //   console.log("users", await models.users.updateMany({}, update));
  //   console.log("reviews", await models.reviews.updateMany({}, update));
  //   console.log("categories", await models.categories.updateMany({}, update));
  //   console.log("coupons", await models.coupons.updateMany({}, update));
  //   console.log("instructors", await models.instructors.updateMany({}, update));
  //   console.log("chapters", await models.chapters.updateMany({}, update));
  //   console.log("courses", await models.courses.updateMany({}, update));
  //   console.log("bundles", await models.bundles.updateMany({}, update));

  //   console.log("orders", await models.orders.updateMany({}, unset));
  //   console.log("payments", await models.payments.updateMany({}, unset));
  //   console.log("webhooks", await models.webhooks.updateMany({}, unset));
  //   console.log("newsletter_list", await models.newsletter_list.updateMany({}, unset));
  //   console.log("roles", await models.roles.updateMany({}, unset));
  //   console.log("users", await models.users.updateMany({}, unset));
  //   console.log("reviews", await models.reviews.updateMany({}, unset));
  //   console.log("categories", await models.categories.updateMany({}, unset));
  //   console.log("coupons", await models.coupons.updateMany({}, unset));
  //   console.log("instructors", await models.instructors.updateMany({}, unset));
  //   console.log("chapters", await models.chapters.updateMany({}, unset));
  //   console.log("courses", await models.courses.updateMany({}, unset));
  //   console.log("bundles", await models.bundles.updateMany({}, unset));
  // })();
});

// const courses = {
//   "python-for-finance": {
//     title: "Python for Finance",
//     slug: "python-for-finance",

//     markup_price: "500",
//     offer_price: "249",
//     enrollments: "200+",
//     instructors: ["manpreet-budhraja"],
//   },
//   "finance-for-founders": {
//     title: "Finance for Founders",
//     slug: "finance-for-founders",

//     markup_price: "1499",
//     offer_price: "999",
//     enrollments: "500+",

//     instructors: ["maneesh-srivastava", "suraj-juneja", "raunak-singhvi", "anand-dalmia", "pratik-bajaj"],
//   },
//   "beginner-s-guide-to-investing": {
//     title: "Beginners Guide to Investing",
//     slug: "beginner-s-guide-to-investing",

//     markup_price: "1600",
//     offer_price: "399",
//     enrollments: "500+",
//     instructors: ["kunal-shah", "shruti-panda", "nirav-karkera", "abhishek-soni"],
//   },
//   "stock-market": {
//     title: "Stock Market Strategies",
//     slug: "stock-market",

//     markup_price: "1600",
//     offer_price: "799",
//     enrollments: "500+",
//     instructors: ["pratik-bajaj", "kunal-shah"],
//   },
//   "portfolio-management-with-entry-exit-strategies": {
//     title: "Portfolio Management",
//     slug: "portfolio-management-with-entry-exit-strategies",

//     markup_price: "6000",
//     offer_price: "2999",
//     enrollments: "1000+",
//     instructors: ["pratik-bajaj", "kunal-shah", "mandar-naik"],
//   },
//   "financial-modeling-business-valuations": {
//     title: "Financial Modeling & Business Valuations",
//     slug: "financial-modeling-business-valuations",
//     thin: "financial-modeling",

//     markup_price: "8000",
//     offer_price: "3999",
//     enrollments: "1000+",
//     instructors: ["pratik-bajaj", "kunal-shah", "rahul-heda", "maneesh-srivastava"],
//   },
//   "financial-modeling-business-valuations-synopsis": {
//     title: "Financial Modeling & Business Valuations Synopsis",
//     slug: "financial-modeling-business-valuations-synopsis",
//     thinkific: "Synopsis",

//     markup_price: "1000",
//     offer_price: "499",
//     enrollments: "500+",
//     instructors: ["pratik-bajaj", "kunal-shah"],
//   },
//   "excel-for-finance": {
//     title: "Excel for Finance",
//     slug: "excel-for-finance",

//     markup_price: "749",
//     offer_price: "499",
//     enrollments: "1000+",
//     instructors: ["pratik-bajaj", "kunal-shah"],
//   },
//   "resume-building-and-interview-prep": {
//     title: "Resume Building & Interview Prep",
//     slug: "resume-building-and-interview-prep",

//     markup_price: "1000",
//     offer_price: "499",
//     instructors: ["pooja-maloo"],
//   },
//   "ethical-professional-standards": {
//     title: "Ethical & Professional Standards",
//     slug: "ethical-professional-standards",

//     markup_price: "1999",
//     offer_price: "999",

//     enrollments: "300+",
//     instructors: ["pratik-bajaj"],
//   },
//   "quantitative-methods": {
//     title: "Quantitative Methods",
//     slug: "quantitative-methods",

//     markup_price: "3749",
//     offer_price: "2499",

//     enrollments: "300+",
//     instructors: ["kunal-shah"],
//   },
//   "economics-cfa-level-1": {
//     title: "Economics",
//     slug: "economics-cfa-level-1",

//     markup_price: "3499",
//     offer_price: "1999",

//     enrollments: "300+",
//     instructors: ["pulkit-jajodia"],
//   },
//   "financial-reporting-analysis": {
//     title: "Financial Reporting Analysis",
//     slug: "financial-reporting-analysis",

//     markup_price: "3749",
//     offer_price: "2499",

//     enrollments: "300+",
//     instructors: ["pratik-bajaj"],
//   },
//   "corporate-finance": {
//     title: "Corporate Finance",
//     slug: "corporate-finance",

//     markup_price: "2249",
//     offer_price: "1499",

//     enrollments: "300+",
//     instructors: ["rishabh-dakalia"],
//   },
//   "equity-investments": {
//     title: "Equity Investments",
//     slug: "equity-investments",

//     markup_price: "3749",
//     offer_price: "2499",

//     enrollments: "300+",
//     instructors: ["kunal-shah", "rishabh-dakalia"],
//   },
//   "fixed-income": {
//     title: "Fixed Income",
//     slug: "fixed-income",

//     markup_price: "3499",
//     offer_price: "1999",

//     enrollments: "300+",
//     instructors: ["rishabh-dakalia"],
//   },
//   "derivatives-cfa-level-1": {
//     title: "Derivatives",
//     slug: "derivatives-cfa-level-1",

//     markup_price: "2249",
//     offer_price: "1499",

//     enrollments: "300+",
//     instructors: ["kunal-shah"],
//   },
//   "alternative-investments": {
//     title: "Alternative Investments",
//     slug: "alternative-investments",

//     markup_price: "1749",
//     offer_price: "999",

//     enrollments: "300+",
//     instructors: ["kunal-shah"],
//   },
//   "portfolio-management-cfa-level-1": {
//     title: "Portfolio Management",
//     slug: "portfolio-management-cfa-level-1",

//     markup_price: "2249",
//     offer_price: "1499",

//     enrollments: "300+",
//     instructors: ["pratik-bajaj"],
//   },
// };

// (async () => {
//   for (let id in courses) {
//     const course = await models.courses.findOne({ slug: id }).lean();
//     if (course.markup_price !== courses[id].markup_price || course.offer_price !== courses[id].offer_price) {
//       console.log(
//         await models.courses.updateOne(
//           { slug: id },
//           { $set: { markup_price: courses[id].markup_price, offer_price: courses[id].offer_price } },
//         ),
//       );
//     }
//   }
// })();
