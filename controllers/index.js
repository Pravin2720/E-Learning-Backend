import { totalRevenue } from "./analytics.controller.js";
import {
  generateJWT,
  generateSpayeeJWT,
  generateThinkificJWT,
  invalidateJWT,
  logIn,
  signUp,
  googleAuth,
  refreshJWT,
  passwordStatus,
  passwordSet,
  passwordReset,
  passwordResetInit,
} from "./auth.controller.js";
import { editCart, getCart } from "./cart.controller.js";
import {
  addCategory,
  editCategory,
  getCategory,
  listCategories,
  removeCategories,
  removeCategory,
} from "./categories.controller.js";
import {
  addChapter,
  editChapter,
  getChapter,
  listChapters,
  removeChapters,
  removeChapter,
} from "./chapters.controller.js";
import {
  addCoupon,
  applyCoupon,
  applyCouponWrapper,
  editCoupon,
  getCoupon,
  listCoupons,
  removeCoupon,
  removeCoupons,
} from "./coupons.controller.js";
import { addBundle, editBundle, getBundle, listBundles, removeBundle, removeBundles } from "./bundles.controller.js";
import { addCourse, editCourse, getCourse, listCourses, removeCourse, removeCourses } from "./courses.controller.js";
import {
  addCourseSetting,
  getCourseSetting,
  getSetting,
  updateCourseSetting,
  updateSetting,
} from "./courseSetting.controller.js";
import {
  addInstructor,
  editInstructor,
  getInstructor,
  listInstructors,
  removeInstructor,
  removeInstructors,
} from "./instructors.controller.js";
import { listSubscribers, subscribeNewsletter, unsubscribeNewsletter } from "./newsletter.controller.js";
import { getOrder, initOrder, listOrders } from "./orders.controller.js";
import {
  capturePayment,
  createOrder,
  orderFollowUpAction,
  paymentFollowUpAction,
  paymentSuccess,
  webhookReceive,
} from "./razorpay.controller.js";
import { addReview, editReview, getReview, listReviews, removeReview, removeReviews } from "./reviews.controller.js";
import { addRole, editRole, getRole, listRoles, removeRole, removeRoles } from "./roles.controller.js";
import {
  createThinkificBundleEnrollmentsWrapper,
  createThinkificCourseEnrollmentWrapper,
  createThinkificUserWrapper,
  getThinkificBundleEnrollmentsWrapper,
  getThinkificCourseEnrollmentWrapper,
  getThinkificUserWrapper,
  handleThinkificBundleEnrollmentWrapper,
  handleThinkificCourseEnrollmentWrapper,
  updateThinkificBundleEnrollmentsWrapper,
  updateThinkificCourseEnrollmentWrapper,
} from "./thinkific.controller.js";
import { addUser, editUser, getUser, listUsers, removeUser, removeUsers } from "./users.controller.js";
import {
  addWorkshop,
  editWorkshop,
  getWorkshop,
  listWorkshops,
  removeWorkshop,
  removeWorkshops,
} from "./workshops.controller.js";

export {
  // cart
  editCart,
  getCart,
  // bundle
  addBundle,
  editBundle,
  getBundle,
  listBundles,
  removeBundle,
  removeBundles,
  // course
  addCourse,
  editCourse,
  getCourse,
  listCourses,
  removeCourse,
  removeCourses,
  // review
  addReview,
  editReview,
  getReview,
  listReviews,
  removeReviews,
  removeReview,
  // courseSetting
  addCourseSetting,
  getSetting,
  getCourseSetting,
  updateSetting,
  updateCourseSetting,
  // user
  addUser,
  editUser,
  getUser,
  listUsers,
  removeUser,
  removeUsers,
  // chapters
  addChapter,
  editChapter,
  getChapter,
  listChapters,
  removeChapters,
  removeChapter,
  // category
  addCategory,
  editCategory,
  getCategory,
  listCategories,
  removeCategory,
  removeCategories,
  // newsletter
  listSubscribers,
  subscribeNewsletter,
  unsubscribeNewsletter,
  // instructor
  addInstructor,
  editInstructor,
  getInstructor,
  listInstructors,
  removeInstructor,
  removeInstructors,
  // order
  initOrder,
  createOrder,
  getOrder,
  listOrders,
  totalRevenue,
  // coupon
  applyCoupon,
  applyCouponWrapper,
  addCoupon,
  editCoupon,
  getCoupon,
  listCoupons,
  removeCoupon,
  removeCoupons,
  // role
  addRole,
  editRole,
  getRole,
  listRoles,
  removeRole,
  removeRoles,
  // workshop
  addWorkshop,
  editWorkshop,
  getWorkshop,
  listWorkshops,
  removeWorkshop,
  removeWorkshops,
  // auth
  googleAuth,
  logIn,
  signUp,
  generateJWT,
  invalidateJWT,
  refreshJWT,
  generateSpayeeJWT,
  generateThinkificJWT,
  passwordStatus,
  passwordSet,
  passwordReset,
  passwordResetInit,
  // razorpay
  capturePayment,
  paymentSuccess,
  webhookReceive,
  // tasks
  orderFollowUpAction,
  paymentFollowUpAction,
  // thinkific
  getThinkificUserWrapper,
  createThinkificUserWrapper,
  getThinkificCourseEnrollmentWrapper,
  createThinkificCourseEnrollmentWrapper,
  updateThinkificCourseEnrollmentWrapper,
  handleThinkificCourseEnrollmentWrapper,
  getThinkificBundleEnrollmentsWrapper,
  createThinkificBundleEnrollmentsWrapper,
  updateThinkificBundleEnrollmentsWrapper,
  handleThinkificBundleEnrollmentWrapper,
};
