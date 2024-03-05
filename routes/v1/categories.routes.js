import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/index.js";
import {
  addCategory,
  editCategory,
  getCategory,
  listCategories,
  removeCategories,
  removeCategory,
} from "../../controllers/index.js";
import { validateCategory } from "../../validators/index.js";
import models from "../../models/index.js";

const router = Router();

// public actions
router.get("/", listCategories);
router.get("/:id", getCategory);
// admin only
router.post("/", authenticate, authorize([models.ROLES[0]]), validateCategory, addCategory);
router.put("/:id", authenticate, authorize([models.ROLES[0]]), validateCategory, editCategory);
router.delete("/", authenticate, authorize([models.ROLES[0]]), validateCategory, removeCategories);
router.delete("/:id", authenticate, authorize([models.ROLES[0]]), validateCategory, removeCategory);

export default router;
