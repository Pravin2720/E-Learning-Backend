import analytics from "./v1/analytics.routes.js";
import auth from "./v1/auth.routes.js";
import cart from "./v1/cart.routes.js";
import categories from "./v1/categories.routes.js";
import chapters from "./v1/chapters.routes.js";
import coupons from "./v1/coupons.routes.js";
import bundles from "./v1/bundles.routes.js";
import courses from "./v1/courses.routes.js";
import courseSetting from "./v1/courseSetting.routes.js";
import instructors from "./v1/instructors.routes.js";
import orders from "./v1/orders.routes.js";
import razorpay from "./v1/razorpay.routes.js";
import reviews from "./v1/reviews.routes.js";
import roles from "./v1/roles.routes.js";
import tasks from "./v1/tasks.routes.js";
import thinkific from "./v1/thinkific.routes.js";
import users from "./v1/users.routes.js";
import utils from "./v1/utils.routes.js";
import workshops from "./v1/workshops.routes.js";

function useRoutes(app) {
  app.use("/v1/analytics", analytics);
  app.use("/v1/auth", auth);
  app.use("/v1/cart", cart);
  app.use("/v1/categories", categories);
  app.use("/v1/chapters", chapters);
  app.use("/v1/coupons", coupons);
  app.use("/v1/course-setting", courseSetting);
  app.use("/v1/courses", courses);
  app.use("/v1/bundles", bundles);
  app.use("/v1/instructors", instructors);
  app.use("/v1/orders", orders);
  app.use("/v1/razorpay", razorpay);
  app.use("/v1/reviews", reviews);
  app.use("/v1/roles", roles);
  app.use("/v1/tasks", tasks);
  app.use("/v1/thinkific", thinkific);
  app.use("/v1/users", users);
  app.use("/v1/utils", utils);
  app.use("/v1/workshops", workshops);
}

export default useRoutes;
