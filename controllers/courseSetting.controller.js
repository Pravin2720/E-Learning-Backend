import { asyncHandler } from "../middlewares/index.js";
import models from "../models/index.js";
import getLogger from "../logger/index.js";

const logger = getLogger(import.meta.url);

export const getSetting = asyncHandler(async (req, res, next) => {
  const setting = await models.courseSettings
    .find({ active: true })
    .select("-created_at -updated_at -__v")
    .populate("course_id", "_id title is_deleted")
    .lean();

  let settingData = [];
  for (let i = 0; i < setting.length; i++) {
    if (!setting[i].course_id.is_deleted) {
      // delete setting[i].course_id.is_deleted;
      setting[i] = {
        ...setting[i]._doc,
        course_id: { _id: setting[i].course_id._id, title: setting[i].course_id.title },
      };
      settingData = [...settingData, setting[i]];
    }
  }

  res.status(200).json({ data: settingData });
  next();
});

export const getCourseSetting = asyncHandler(async (req, res, next) => {
  let courseSetting = await models.courseSettings
    .findOne({ course_id: req.params.id, active: true })
    .select("-created_at -updated_at -__v")
    .populate("course_id", "_id title is_deleted")
    .lean();

  if (!courseSetting.course_id.is_deleted) {
    // delete setting[i].course_id.is_deleted;
    courseSetting = {
      ...courseSetting._doc,
      course_id: { _id: courseSetting.course_id._id, title: courseSetting.course_id.title },
    };
    res.status(200).json({ data: courseSetting });
    next();
  }

  res.status(404).json({ data: "Not Found" });
  next();
});

export const updateCourseSetting = asyncHandler(async (req, res, next) => {
  await models.courseSettings.updateOne({ course_id: req.params.id }, { $set: req.body, updated_at: Date.now() });

  res.status(200).json({ message: "Success" });
  next();
});

export const updateSetting = asyncHandler(async (req, res, next) => {
  const coursesSetting = req.body.data;
  for (let i = 0; i < coursesSetting.length; i++) {
    await models.courseSettings.updateOne(
      {
        course_id: coursesSetting[i].course_id,
      },
      { $set: coursesSetting[i], updated_at: Date.now() },
    );
  }

  res.status(200).json({ message: "Success" });
  next();
});

export const addCourseSetting = asyncHandler(async (req, res, next) => {
  await models.courseSettings.create(req.body);
  res.status(200).json({ message: "Success" });
  next();
});
