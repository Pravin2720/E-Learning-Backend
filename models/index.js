import mongoose from "mongoose";

import { Bundle } from "./bundles.model.js";
import { Cart } from "./cart.model.js";
import { Category } from "./categories.model.js";
import { Chapter } from "./chapters.model.js";
import { Coupon } from "./coupons.model.js";
import { Course } from "./courses.model.js";
import { CourseSettings } from "./courseSettings.model.js";
import { ForgetPassword } from "./forget_password.model.js";
import { Instructor } from "./instructors.model.js";
import { KeyStore } from "./keystore.model.js";
import { NewsletterList } from "./newsletter.model.js";
import { Order } from "./orders.model.js";
import { Payment } from "./payments.model.js";
import { Program } from "./programs.model.js";
import { Webhook } from "./razorpay.model.js";
import { Review } from "./reviews.model.js";
import { Role } from "./roles.model.js";
import { User } from "./users.model.js";
import { Variables } from "./variables.model.js";
import { Workshop } from "./workshops.model.js";

const models = {
  // DB
  mongoose: mongoose,
  // Schemas
  bundles: Bundle,
  carts: Cart,
  categories: Category,
  chapters: Chapter,
  coupons: Coupon,
  courses: Course,
  courseSettings: CourseSettings,
  forget_passwords: ForgetPassword,
  instructors: Instructor,
  keystore: KeyStore,
  programs: Program,
  reviews: Review,
  roles: Role,
  users: User,
  workshops: Workshop,
  // Razorpay Schemas
  newsletter_list: NewsletterList,
  orders: Order,
  payments: Payment,
  webhooks: Webhook,
  // Constants
  ROLES: ["admin", "moderator", "user", "instructor"],
  // variables
  variables: Variables,
};

export default models;
