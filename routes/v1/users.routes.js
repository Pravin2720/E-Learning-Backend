import { Router } from "express";
import { addUser, editUser, getUser, listUsers, removeUser, removeUsers } from "../../controllers/index.js";
import { authenticate, authorize } from "../../middlewares/index.js";
import models from "../../models/index.js";

const router = Router();

router.get("/", authenticate, authorize(models.ROLES), listUsers);
router.get("/:id", authenticate, authorize(models.ROLES), getUser);
// admin only
router.post("/", authenticate, authorize([models.ROLES[0]]), addUser);
router.put("/:id", authenticate, authorize([models.ROLES[0]]), editUser);
router.delete("/", authenticate, authorize([models.ROLES[0]]), removeUsers);
router.delete("/:id", authenticate, authorize([models.ROLES[0]]), removeUser);

export default router;
