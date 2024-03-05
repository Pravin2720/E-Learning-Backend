import { Router } from "express";
import { addReview, editReview, getReview, listReviews, removeReview, removeReviews } from "../../controllers/index.js";
import { authenticate, authorize } from "../../middlewares/index.js";
import models from "../../models/index.js";
import { validateReview } from "../../validators/index.js";

const router = Router();

// public actions
router.get("/", listReviews);
router.get("/:id", getReview);
// admin only
router.post("/", authenticate, authorize([models.ROLES[0]]), validateReview, addReview);
router.put("/:id", authenticate, authorize([models.ROLES[0]]), validateReview, editReview);
router.delete("/", authenticate, authorize([models.ROLES[0]]), validateReview, removeReviews);
router.delete("/:id", authenticate, authorize([models.ROLES[0]]), validateReview, removeReview);

export default router;
