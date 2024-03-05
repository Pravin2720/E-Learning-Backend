import thinkificAxios from "./axios.util.js";
import getLogger from "../logger/index.js";

const logger = getLogger(import.meta.url);

//
// ────────────────────────────────────────────────────── I ──────────
//   :::::: H E L P E R S : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────
//

//
// ─── USERS ──────────────────────────────────────────────────────────────────────
//

export async function getThinkificUser(email) {
  logger.info("finding Thinkific user with [email]", email);
  const usersResponse = await thinkificAxios.get("/users?query[email]=" + encodeURIComponent(email));
  if (usersResponse && usersResponse.status !== 200) {
    throw new Error("No user found against email");
  }
  return usersResponse.data && usersResponse.data.items && usersResponse.data.items.length > 0
    ? usersResponse.data.items[0]
    : null;
}

export async function createThinkificUser(userDetails) {
  logger.debug("creating Thinkific user", JSON.stringify(userDetails));
  const createUserResponse = await thinkificAxios.post("/users", userDetails);
  if (createUserResponse && createUserResponse.status !== 201) {
    throw new Error("Thinkific user creation failed");
  }
  return createUserResponse.data;
}

//
// ─── COURSE ─────────────────────────────────────────────────────────────────────
//

export async function getThinkificCourseEnrollment(userId, courseId) {
  logger.info("finding Thinkific enrollment with [userID] [courseID]", userId, courseId);
  const enrollmentQuery = new URLSearchParams();
  enrollmentQuery.set("query[user_id]", userId);
  enrollmentQuery.set("query[course_id]", courseId);
  const enrollmentResponse = await thinkificAxios.get("/enrollments?" + enrollmentQuery.toString());
  return enrollmentResponse.data && enrollmentResponse.data.items && enrollmentResponse.data.items.length > 0
    ? enrollmentResponse.data.items[0]
    : null;
}

export async function createThinkificCourseEnrollment(userId, courseId) {
  logger.info("creating Thinkific enrollment with [userID] [courseID]", userId, courseId);
  var now = new Date();
  var exp = new Date();
  exp.setFullYear(exp.getFullYear() + 50);
  var activated_at = now.toISOString();
  var expiry_date = exp.toISOString();
  const enrollmentResponse = await thinkificAxios.post("/enrollments", {
    course_id: courseId,
    user_id: userId,
    activated_at: activated_at,
    expiry_date: expiry_date,
  });
  if (enrollmentResponse && enrollmentResponse.status !== 201) {
    throw new Error("Thinkific  course enrollment creation failed");
  }
  return enrollmentResponse.data;
}

export async function updateThinkificCourseEnrollment(enrollmentId) {
  logger.info("creating Thinkific enrollment with [enrollmentId]", enrollmentId);
  var now = new Date();
  var exp = new Date();
  exp.setFullYear(exp.getFullYear() + 50);
  var activated_at = now.toISOString();
  var expiry_date = exp.toISOString();
  const enrollmentResponse = await thinkificAxios.put("/enrollments/" + enrollmentId, {
    activated_at: activated_at,
    expiry_date: expiry_date,
  });
  if (enrollmentResponse && enrollmentResponse.status !== 204) {
    throw new Error("Thinkific course enrollment update failed");
  }
  return enrollmentResponse.data;
}

export async function handleThinkificCourseEnrollment(userId, courseId) {
  // check if already enrolled
  var courseEnrollmentThinkific = await getThinkificCourseEnrollment(userId, courseId);
  if (!courseEnrollmentThinkific) {
    logger.info("creating new course enrollment");
    // if not, enroll for the first time
    courseEnrollmentThinkific = await createThinkificCourseEnrollment(userId, courseId);
  } else {
    logger.info("existing course enrollment found");
  }
  var enrollmentIdThinkific = courseEnrollmentThinkific.id;
  logger.debug("[courseEnrollmentThinkific]", JSON.stringify(courseEnrollmentThinkific));
  logger.info("[enrollmentIdThinkific]", enrollmentIdThinkific);

  //
  // ─── EXPIRED ENROLLMENT HANDLING ────────────────────────────────────────────────
  //

  // if yes but expired or not yet activated (if already enrolled for a free preview), then update the duration
  if (courseEnrollmentThinkific.expired || courseEnrollmentThinkific.activated_at === null) {
    logger.info("updating existing course enrollment with [enrollmentId]", enrollmentIdThinkific);
    courseEnrollmentThinkific = await updateThinkificCourseEnrollment(enrollmentIdThinkific);
  }
}

//
// ─── BUNDLE ─────────────────────────────────────────────────────────────────────
//

export async function getThinkificBundleEnrollments(userId, bundleId) {
  const enrollmentQuery = new URLSearchParams();
  enrollmentQuery.set("query[user_id]", userId);
  const enrollmentResponse = await thinkificAxios.get(
    "/bundles/" + bundleId + "/enrollments?" + enrollmentQuery.toString(),
  );
  return enrollmentResponse.data && enrollmentResponse.data.items && enrollmentResponse.data.items.length > 0
    ? enrollmentResponse.data.items
    : null;
}

export async function createThinkificBundleEnrollments(userId, bundleId) {
  var now = new Date();
  var exp = new Date();
  exp.setFullYear(exp.getFullYear() + 50);
  var activated_at = now.toISOString();
  var expiry_date = exp.toISOString();
  const enrollmentResponse = await thinkificAxios.post("/bundles/" + bundleId + "/enrollments", {
    user_id: userId,
    activated_at: activated_at,
    expiry_date: expiry_date,
  });
  if (enrollmentResponse && enrollmentResponse.status !== 201 && enrollmentResponse.status !== 202) {
    throw new Error("Thinkific bundle enrollment creation failed");
  }
  return enrollmentResponse.data;
}

export async function updateThinkificBundleEnrollments(userId, bundleId) {
  var now = new Date();
  var exp = new Date();
  exp.setFullYear(exp.getFullYear() + 50);
  var activated_at = now.toISOString();
  var expiry_date = exp.toISOString();
  const enrollmentResponse = await thinkificAxios.put("/bundles/" + bundleId + "/enrollments", {
    user_id: userId,
    activated_at: activated_at,
    expiry_date: expiry_date,
  });
  if (enrollmentResponse && enrollmentResponse.status !== 204) {
    throw new Error("Thinkific bundle enrollment update failed");
  }
  return enrollmentResponse.data;
}

export async function handleThinkificBundleEnrollment(userId, bundleId) {
  // check if already enrolled
  var bundleEnrollmentThinkific = await getThinkificBundleEnrollments(userId, bundleId);
  if (!bundleEnrollmentThinkific) {
    logger.info("creating new bundle enrollment");
    // if not, enroll for the first time
    bundleEnrollmentThinkific = await createThinkificBundleEnrollments(userId, bundleId);
    logger.debug("[bundleEnrollmentThinkific]", JSON.stringify(bundleEnrollmentThinkific));
  } else {
    logger.info("existing bundle enrollment found");
  }

  //
  // ─── EXPIRED ENROLLMENT HANDLING ────────────────────────────────────────────────
  //

  bundleEnrollmentThinkific = await getThinkificBundleEnrollments(userId, bundleId);
  let expired = false;
  for (let i = 0; i < bundleEnrollmentThinkific.length; i++) {
    expired = expired || bundleEnrollmentThinkific[i].expired;
  }
  logger.info("expired", expired);
  // if yes but expired, then update the duration
  if (expired) {
    logger.info("updating existing bundle enrollment with [userId] [bundleId]", userId, bundleId);
    bundleEnrollmentThinkific = await updateThinkificBundleEnrollments(userId, bundleId);
  }
}
