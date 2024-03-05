import { Router } from "express";
import {
  createThinkificBundleEnrollmentsWrapper,
  createThinkificCourseEnrollmentWrapper,
  createThinkificUserWrapper,
  getThinkificBundleEnrollmentsWrapper,
  getThinkificCourseEnrollmentWrapper,
  getThinkificUserWrapper,
  handleThinkificBundleEnrollmentWrapper,
  handleThinkificCourseEnrollmentWrapper,
  updateThinkificBundleEnrollmentsWrapper,
  updateThinkificCourseEnrollmentWrapper,
} from "../../controllers/index.js";

const router = Router();

router.get("/user", getThinkificUserWrapper);
// router.post("/user", createThinkificUserWrapper);

router.get("/course/enrollment", getThinkificCourseEnrollmentWrapper);
// router.post("/course/enrollment", createThinkificCourseEnrollmentWrapper);
// router.put("/course/enrollment/:id", updateThinkificCourseEnrollmentWrapper);
// router.post("/course/enrollment/:id", handleThinkificCourseEnrollmentWrapper);

router.get("/bundle/enrollment", getThinkificBundleEnrollmentsWrapper);
// router.post("/bundle/enrollment", createThinkificBundleEnrollmentsWrapper);
// router.put("/bundle/enrollment/:id", updateThinkificBundleEnrollmentsWrapper);
// router.post("/bundle/enrollment/:id", handleThinkificBundleEnrollmentWrapper);

export default router;
