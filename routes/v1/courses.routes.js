import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/index.js";
import { addCourse, listCourses, editCourse, getCourse, removeCourse, removeCourses } from "../../controllers/index.js";
import { validateCourse } from "../../validators/index.js";
import models from "../../models/index.js";

const router = Router();

router.get("/", listCourses);
router.get("/:id", getCourse);
// admin only
router.post("/", authenticate, authorize([models.ROLES[0]]), validateCourse, addCourse);
router.put("/:id", authenticate, authorize([models.ROLES[0]]), validateCourse, editCourse);
router.delete("/", authenticate, authorize([models.ROLES[0]]), validateCourse, removeCourses);
router.delete("/:id", authenticate, authorize([models.ROLES[0]]), validateCourse, removeCourse, removeCourses);

export default router;
