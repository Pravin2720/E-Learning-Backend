import { Router } from "express";
import {
  addCoupon,
  applyCouponWrapper,
  editCoupon,
  getCoupon,
  listCoupons,
  removeCoupon,
  removeCoupons,
} from "../../controllers/index.js";
import { authenticate, authorize } from "../../middlewares/index.js";
import models from "../../models/index.js";
import { validateApplyCoupon, validateCoupon } from "../../validators/index.js";

const router = Router();

router.get("/", authenticate, authorize(models.ROLES), listCoupons);
router.get("/:id", authenticate, authorize(models.ROLES), getCoupon);
// public actions
router.post("/apply", validateApplyCoupon, applyCouponWrapper);
// admin only
router.post("/", authenticate, authorize([models.ROLES[0]]), validateCoupon, addCoupon);
router.put("/:id", authenticate, authorize([models.ROLES[0]]), validateCoupon, editCoupon);
router.delete("/", authenticate, authorize([models.ROLES[0]]), validateCoupon, removeCoupons);
router.delete("/:id", authenticate, authorize([models.ROLES[0]]), validateCoupon, removeCoupon);

export default router;
