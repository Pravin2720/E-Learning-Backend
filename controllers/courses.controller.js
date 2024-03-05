import { asyncHandler } from "../middlewares/index.js";
import models from "../models/index.js";
import {
  createShapeHandler,
  deleteListShapeHandler,
  deleteOneShapeHandler,
  readListShapeHandler,
  readOneShapeHandler,
  updateOneShapeHandler,
} from "../utils/shapes.util.js";

// import getLogger from "../logger/index.js";
// const logger = getLogger(import.meta.url);

export const addCourse = asyncHandler(async (req, res, next) => {
  const {
    title,
    slug,
    spayee_product_id,
    tags,
    short_description,
    long_description,
    image_url,
    markup_price,
    offer_price,
    discount,
    perks,
    videos,
    duration,
    requirements,
    audience,
    instructors,
    chapters,
    categories,
    active,
  } = req.body;
  const data = {
    title,
    slug,
    spayee_product_id,
    tags,
    short_description,
    long_description,
    image_url,
    markup_price,
    offer_price,
    discount,
    perks,
    videos,
    duration,
    requirements,
    audience,
    instructors,
    chapters,
    categories,
    active,
  };
  res.status(200).json(await createShapeHandler(models.courses, data));
  next();
});

export const listCourses = asyncHandler(async (req, res, next) => {
  const results = await readListShapeHandler(req.query, models.courses, {}, ["-__v"]);
  res.status(200).json(results);
  next();
});

export const getCourse = asyncHandler(async (req, res, next) => {
  const result = await readOneShapeHandler(models.courses, { $or: [{ _id: req.params.id }, { slug: req.params.id }] }, [
    "-__v",
  ]);
  res.status(200).json({ data: { ...result.data, id: result.data.slug } });
  next();
});

export const editCourse = asyncHandler(async (req, res, next) => {
  const {
    title,
    slug,
    spayee_product_id,
    tags,
    short_description,
    long_description,
    image_url,
    markup_price,
    offer_price,
    discount,
    perks,
    videos,
    duration,
    requirements,
    audience,
    instructors,
    chapters,
    categories,
    active,
  } = req.body;
  const data = {
    title,
    slug,
    spayee_product_id,
    tags,
    short_description,
    long_description,
    image_url,
    markup_price,
    offer_price,
    discount,
    perks,
    videos,
    duration,
    requirements,
    audience,
    instructors,
    chapters,
    categories,
    active,
  };
  res.status(200).json(await updateOneShapeHandler(models.courses, data, { _id: req.params.id }, ["-__v"]));
  next();
});

export const removeCourses = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteListShapeHandler(req.query, models.courses, {}));
  next();
});

export const removeCourse = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteOneShapeHandler(models.courses, { _id: req.params.id }));
  next();
});

// export const addCourse = asyncHandler(async (req, res, next) => {
//   const { instructors, chapters, ...restData } = req.body;

//   try {
//     const chaptersData = await models.chapters.insertMany(chapters);
//     const instructorsData = await models.instructors.insertMany(instructors);

//     const chapterIds = chaptersData.map((data) => data._id);
//     const instructorIds = instructorsData.map((data) => data._id);
//     const course = { ...restData, instructors: instructorIds, chapters: chapterIds };

//     const courseData = await models.courses.create(course);

//     await models.courseSettings.create({ course_id: courseData._id });

//     res.status(200).json({ message: "Success" });
//     next();
//   } catch (error) {
//     logger.error(error);
//     throw error;
//   }
// });

// export const editCourse = asyncHandler(async (req, res, next) => {
//   const { instructors, chapters, ...restData } = req.body;

//   const instructorIds = instructors.map((data) => data._id);
//   const chapterIds = [];
//   try {
//     // updating existing chapter and adding new title
//     for (let i = 0; i < chapters.length; i++) {
//       if (chapters[i]._id) {
//         await models.chapters.updateOne({ _id: chapters[i]._id }, { $set: chapters[i] });
//         chapterIds.push(chapters[i]._id);
//       } else {
//         const chapter = await models.chapters.create(chapters[i]);
//         chapterIds.push(chapter._id);
//       }
//     }

//     // updating instructors
//     for (let j = 0; j < instructors.length; j++) {
//       await models.instructors.updateOne({ _id: instructors[j]._id }, { $set: instructors[j] });
//     }

//     // finally building course object
//     const course = { instructors: instructorIds, chapters: chapterIds, ...restData, updated_at: Date.now() };
//     await models.courses.updateOne({ _id: req.params.id }, { $set: course });

//     res.status(200).json({ message: "Success" });
//     next();
//   } catch (error) {
//     logger.error(error);
//     throw error;
//   }
// });

// export const deleteCourse = asyncHandler(async (req, res, next) => {
//   try {
//     await models.courses.updateOne(
//       { _id: req.params.id },
//       {
//         $set: {
//           active: false,
//           updated_at: Date.now(),
//         },
//       },
//     );
//     res.status(200).json({ message: "Success" });
//     next();
//   } catch (error) {
//     logger.error(error);
//     throw error;
//   }
// });
