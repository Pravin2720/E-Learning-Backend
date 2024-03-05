import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/index.js";
import { addBundle, listBundles, editBundle, getBundle, removeBundle, removeBundles } from "../../controllers/index.js";
import { validateBundle } from "../../validators/index.js";
import models from "../../models/index.js";

const router = Router();

router.get("/", listBundles);
router.get("/:id", getBundle);
// admin only
router.post("/", authenticate, authorize([models.ROLES[0]]), validateBundle, addBundle);
router.put("/:id", authenticate, authorize([models.ROLES[0]]), validateBundle, editBundle);
router.delete("/", authenticate, authorize([models.ROLES[0]]), validateBundle, removeBundles);
router.delete("/:id", authenticate, authorize([models.ROLES[0]]), validateBundle, removeBundle, removeBundles);

export default router;
