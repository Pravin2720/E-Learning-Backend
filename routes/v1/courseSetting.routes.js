import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/index.js";
import { getSetting, getCourseSetting, updateCourseSetting, updateSetting } from "../../controllers/index.js";
import { validateCourseSettings } from "../../validators/index.js";
import models from "../../models/index.js";

const router = Router();

router.get("/", getSetting);
router.get("/:id", getCourseSetting);

router.put("/", authenticate, authorize(models.ROLES), validateCourseSettings, updateSetting);
router.put("/:id", authenticate, authorize(models.ROLES), validateCourseSettings, updateCourseSetting);

export default router;
