import { Router } from "express";
import { totalRevenue } from "../../controllers/index.js";
import { authenticate, authorize } from "../../middlewares/index.js";
import models from "../../models/index.js";

const router = Router();

router.get("/revenue", authenticate, authorize(models.ROLES), totalRevenue);

export default router;
