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

export const addChapter = asyncHandler(async (req, res, next) => {
  const { title, video_link, sub_items, parent, active } = req.body;
  const data = { title, video_link, sub_items, parent, active };

  // validate parent type
  const valid_parents = ["chapter", "course"];
  if (parent.entity_type && valid_parents.indexOf(parent.entity_type) === -1)
    throw new ErrorResponse("Unsupported Parent Type", 501);

  // create chapter
  const result = await createShapeHandler(models.chapters, data);

  // update parent
  if (parent.entity_type === "chapter") {
    await models.chapters.updateOne(
      { _id: parent.entity_id },
      { $addToSet: { sub_items: result.data.id }, $set: { updated_at: Date.now() } },
    );
  } else if (parent.entity_type === "course") {
    await models.courses.updateOne(
      { _id: parent.entity_id },
      { $addToSet: { chapters: result.data.id }, $set: { updated_at: Date.now() } },
    );
  }

  res.status(200).json(result);
  next();
});

export const listChapters = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readListShapeHandler(req.query, models.chapters, {}, ["-__v"]));
  next();
});

export const getChapter = asyncHandler(async (req, res, next) => {
  res.status(200).json(await readOneShapeHandler(models.chapters, { _id: req.params.id }, ["-__v"]));
  next();
});

export const editChapter = asyncHandler(async (req, res, next) => {
  const { title, video_link, sub_items, parent, active } = req.body;
  const data = { title, video_link, sub_items, parent, active };

  // validate parent type
  const valid_parents = ["chapter", "course"];
  if (parent.entity_type && valid_parents.indexOf(parent.entity_type) === -1)
    throw new ErrorResponse("Unsupported Parent Type", 501);

  // update chapter
  const result = await updateOneShapeHandler(models.chapters, data, { _id: req.params.id }, ["-__v"]);

  // if parent has changed
  if (parent.entity_id !== result.match.parent.entity_id || parent.entity_type !== result.match.parent.entity_type) {
    // remove from the old parent
    if (result.match.parent.entity_type === "chapter") {
      await models.chapters.updateOne(
        { _id: result.match.parent.entity_id },
        { $pull: { sub_items: result.data.id }, $set: { updated_at: Date.now() } },
      );
    } else if (result.match.parent.entity_type === "course") {
      await models.courses.updateOne(
        { _id: result.match.parent.entity_id },
        { $pull: { chapters: result.data.id }, $set: { updated_at: Date.now() } },
      );
    }
    // add in the new parent
    if (parent.entity_type === "chapter") {
      await models.chapters.updateOne(
        { _id: parent.entity_id },
        { $addToSet: { sub_items: result.data.id }, $set: { updated_at: Date.now() } },
      );
    } else if (parent.entity_type === "course") {
      await models.courses.updateOne(
        { _id: parent.entity_id },
        { $addToSet: { chapters: result.data.id }, $set: { updated_at: Date.now() } },
      );
    }
  }

  res.status(200).json(result);
  next();
});

export const removeChapters = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteListShapeHandler(req.query, models.chapters, {}));
  next();
});

export const removeChapter = asyncHandler(async (req, res, next) => {
  res.status(200).json(await deleteOneShapeHandler(models.chapters, { _id: req.params.id }));
  next();
});
