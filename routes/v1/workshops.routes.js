import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/index.js";
import {
  addWorkshop,
  listWorkshops,
  editWorkshop,
  getWorkshop,
  removeWorkshop,
  removeWorkshops,
} from "../../controllers/index.js";
import { validateWorkshop } from "../../validators/index.js";
import models from "../../models/index.js";

const router = Router();

router.get("/", listWorkshops);
router.get("/:id", getWorkshop);
// admin only
router.post("/", authenticate, authorize([models.ROLES[0]]), validateWorkshop, addWorkshop);
router.put("/:id", authenticate, authorize([models.ROLES[0]]), validateWorkshop, editWorkshop);
router.delete("/", authenticate, authorize([models.ROLES[0]]), validateWorkshop, removeWorkshops);
router.delete("/:id", authenticate, authorize([models.ROLES[0]]), validateWorkshop, removeWorkshop, removeWorkshops);

export default router;
