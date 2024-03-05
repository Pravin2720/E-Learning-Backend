import { Router } from "express";
import { addRole, editRole, getRole, listRoles, removeRole, removeRoles } from "../../controllers/index.js";
import { authenticate, authorize } from "../../middlewares/index.js";
import models from "../../models/index.js";

const router = Router();

router.get("/", authenticate, authorize(models.ROLES), listRoles);
router.get("/:id", authenticate, authorize(models.ROLES), getRole);
// admin only
router.post("/", authenticate, authorize([models.ROLES[0]]), addRole);
router.put("/:id", authenticate, authorize([models.ROLES[0]]), editRole);
router.delete("/", authenticate, authorize([models.ROLES[0]]), removeRoles);
router.delete("/:id", authenticate, authorize([models.ROLES[0]]), removeRole);

export default router;
