import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/index.js";
import { editCart, getCart } from "../../controllers/index.js";
import { validateCart } from "../../validators/index.js";
import models from "../../models/index.js";

const router = Router();

// logged-in user actions
router.get("/", authenticate, authorize(models.ROLES), getCart);
router.put("/", authenticate, authorize(models.ROLES), validateCart, editCart);

export default router;
