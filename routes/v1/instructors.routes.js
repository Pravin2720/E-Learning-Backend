import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/index.js";
import {
  listInstructors,
  getInstructor,
  addInstructor,
  editInstructor,
  removeInstructor,
  removeInstructors,
} from "../../controllers/index.js";
import { validateInstructor } from "../../validators/index.js";
import models from "../../models/index.js";

const router = Router();

// public actions
router.get("/", listInstructors);
router.get("/:id", getInstructor);
// admin only
router.post("/", authenticate, authorize([models.ROLES[0]]), validateInstructor, addInstructor);
router.put("/:id", authenticate, authorize([models.ROLES[0]]), validateInstructor, editInstructor);
router.delete("/", authenticate, authorize([models.ROLES[0]]), validateInstructor, removeInstructors);
router.delete("/:id", authenticate, authorize([models.ROLES[0]]), validateInstructor, removeInstructor);

export default router;
