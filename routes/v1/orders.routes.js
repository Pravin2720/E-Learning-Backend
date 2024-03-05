import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/index.js";
import { initOrder, listOrders, getOrder } from "../../controllers/index.js";
import { validateOrder } from "../../validators/index.js";
import models from "../../models/index.js";

const router = Router();

router.get("/", authenticate, authorize(models.ROLES), listOrders);
router.get("/:id", authenticate, authorize(models.ROLES), getOrder);
// public actions
router.post("/", validateOrder, initOrder);

export default router;
