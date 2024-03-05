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

export const addBundle = asyncHandler(async (req, res, next) => {
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
  res.status(200).json(await createShapeHandler(models.bundles, data));
  next();
});

export const listBundles = asyncHandler(async (req, res, next) => {
  const results = await readListShapeHandler(req.query, models.bundles, {}, ["-__v"]);
  res.status(200).json(results);
  next();
});

export const getBundle = asyncHandler(async (req, res, next) => {
  const result = await readOneShapeHandler(models.bundles, { $or: [{ _id: req.params.id }, { slug: req.params.id }] }, [
    "-__v",
  ]);
  res.status(200).json({ data: { ...result.data, id: result.data.slug } });
  next();
});

export const editBundle = asyncHandler(async (req, res, next) => {
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
  res.status(200).json(await updateOneShapeHandler(models.bundles, data, { _id: req.params.id }, ["-__v"]));
  next();
});

export const removeBundles = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteListShapeHandler(req.query, models.bundles, {}));
  next();
});

export const removeBundle = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteOneShapeHandler(models.bundles, { _id: req.params.id }));
  next();
});

// export const addBundle = asyncHandler(async (req, res, next) => {
//   const { instructors, chapters, ...restData } = req.body;

//   try {
//     const chaptersData = await models.chapters.insertMany(chapters);
//     const instructorsData = await models.instructors.insertMany(instructors);

//     const chapterIds = chaptersData.map((data) => data._id);
//     const instructorIds = instructorsData.map((data) => data._id);
//     const bundle = { ...restData, instructors: instructorIds, chapters: chapterIds };

//     const bundleData = await models.bundles.create(bundle);

//     await models.bundleSettings.create({ bundle_id: bundleData._id });

//     res.status(200).json({ message: "Success" });
//     next();
//   } catch (error) {
//     logger.error(error);
//     throw error;
//   }
// });

// export const editBundle = asyncHandler(async (req, res, next) => {
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

//     // finally building bundle object
//     const bundle = { instructors: instructorIds, chapters: chapterIds, ...restData, updated_at: Date.now() };
//     await models.bundles.updateOne({ _id: req.params.id }, { $set: bundle });

//     res.status(200).json({ message: "Success" });
//     next();
//   } catch (error) {
//     logger.error(error);
//     throw error;
//   }
// });

// export const deleteBundle = asyncHandler(async (req, res, next) => {
//   try {
//     await models.bundles.updateOne(
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
