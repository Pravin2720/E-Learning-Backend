import mongoose from "mongoose";
import { User } from "./users.model.js";
import { Instructor } from "./instructors.model.js";
import { Chapter } from "./chapters.model.js";
import { Category } from "./categories.model.js";

const CoursesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  thinkific_course_id: Number,
  spayee_product_id: String,
  tags: [Object],

  pre_launch: { type: Boolean, default: false },
  pre_launch_date: { type: Number, default: Date.now },

  short_description: String,
  long_description: String,
  image_url: String,

  markup_price: Number,
  offer_price: Number,
  discount: Number,

  perks: [Object],
  videos: String,
  duration: Number,
  requirements: String,
  audience: String,

  instructors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Instructor,
    },
  ],
  chapters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Chapter,
    },
  ],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Category,
    },
  ],

  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
  deactivated_at: Number,
  active: { type: Boolean, default: true },
});

CoursesSchema.index({ slug: 1 });
CoursesSchema.index({ "$**": "text" });
export const Course = mongoose.model("Course", CoursesSchema);
