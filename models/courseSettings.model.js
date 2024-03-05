import mongoose from "mongoose";

const CourseSettingSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    index: true,
  },
  /************
   *
   * need to create new mongoose.Schema for category and reference here in category
   *
   * **********/
  category: { type: String, default: "" },
  course_order: { type: Number, default: null },

  is_featured: { type: Boolean, default: false },
  feature_order: { type: Number, default: null },
  is_live: { type: Boolean, default: true },
  is_special: { type: Boolean, default: false },
  is_prebook: { type: Boolean, default: false },

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
});

export const CourseSettings = mongoose.model("CourseSettings", CourseSettingSchema);
