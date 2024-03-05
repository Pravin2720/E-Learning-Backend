import {
  getThinkificUser,
  createThinkificUser,
  getThinkificCourseEnrollment,
  createThinkificCourseEnrollment,
  updateThinkificCourseEnrollment,
  handleThinkificCourseEnrollment,
  getThinkificBundleEnrollments,
  createThinkificBundleEnrollments,
  updateThinkificBundleEnrollments,
  handleThinkificBundleEnrollment,
} from "../utils/thinkific.util.js";
// import getLogger from "../logger/index.js";

// const logger = getLogger(import.meta.url);

//
// ─── USERS ──────────────────────────────────────────────────────────────────────
//

export async function getThinkificUserWrapper(req, res, next) {
  const user = await getThinkificUser(req.body.email);
  res.status(200).json({ ...user });
  next();
}
export async function createThinkificUserWrapper(req, res, next) {
  const user = await createThinkificUser(req.body.user_details);
  res.status(200).json({ ...user });
  next();
}

//
// ─── COURSE ─────────────────────────────────────────────────────────────────────
//

export async function getThinkificCourseEnrollmentWrapper(req, res, next) {
  const enrollment = await getThinkificCourseEnrollment(req.body.user_id, req.body.course_id);
  res.status(200).json({ ...enrollment });
  next();
}

export async function createThinkificCourseEnrollmentWrapper(req, res, next) {
  const enrollment = await createThinkificCourseEnrollment(req.body.user_id, req.body.course_id);
  res.status(200).json({ ...enrollment });
  next();
}

export async function updateThinkificCourseEnrollmentWrapper(req, res, next) {
  const enrollment = await updateThinkificCourseEnrollment(req.body.enrollment_id);
  res.status(200).json({ ...enrollment });
  next();
}

export async function handleThinkificCourseEnrollmentWrapper(req, res, next) {
  const enrollment = await handleThinkificCourseEnrollment(req.body.user_id, req.body.course_id);
  res.status(200).json({ ...enrollment });
  next();
}

//
// ─── BUNDLE ─────────────────────────────────────────────────────────────────────
//

export async function getThinkificBundleEnrollmentsWrapper(req, res, next) {
  const enrollment = await getThinkificBundleEnrollments(req.body.user_id, req.body.bundle_id);
  res.status(200).json({ ...enrollment });
  next();
}

export async function createThinkificBundleEnrollmentsWrapper(req, res, next) {
  const enrollment = await createThinkificBundleEnrollments(req.body.user_id, req.body.bundle_id);
  res.status(200).json({ ...enrollment });
  next();
}

export async function updateThinkificBundleEnrollmentsWrapper(req, res, next) {
  const enrollment = await updateThinkificBundleEnrollments(req.body.user_id, req.body.bundle_id);
  res.status(200).json({ ...enrollment });
  next();
}

export async function handleThinkificBundleEnrollmentWrapper(req, res, next) {
  const enrollment = await handleThinkificBundleEnrollment(req.body.user_id, req.body.bundle_id);
  res.status(200).json({ ...enrollment });
  next();
}
