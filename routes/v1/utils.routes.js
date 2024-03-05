import { Router } from "express";
import models from "../../models/index.js";
import {
  listSubscribers,
  passwordStatus,
  subscribeNewsletter,
  unsubscribeNewsletter,
} from "../../controllers/index.js";
import { authenticate, authorize } from "../../middlewares/index.js";
import { healthCheckResponder } from "../../utils/health.util.js";
import { validateEmail } from "../../validators/index.js";

const router = Router();

// public actions
router.get("/health", healthCheckResponder);
router.post("/newsletter", validateEmail, subscribeNewsletter);
router.post("/validate/email", validateEmail, passwordStatus);

router.get("/newsletter", authenticate, authorize(models.ROLES), listSubscribers);
router.delete("/newsletter", authenticate, authorize(models.ROLES), validateEmail, unsubscribeNewsletter);

export default router;
