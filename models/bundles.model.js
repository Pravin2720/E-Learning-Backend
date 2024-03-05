import mongoose from "mongoose";
import { User } from "./users.model.js";
import { Instructor } from "./instructors.model.js";
import { Category } from "./categories.model.js";
import { Course } from "./courses.model.js";

const BundlesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  thinkific_bundle_id: Number,
  spayee_product_id: String,
  tags: [String],

  short_description: String,
  long_description: String,
  image_url: String,

  markup_price: Number,
  offer_price: Number,
  discount: Number,

  perks: [Object],
  videos: Number,
  duration: Number,
  requirements: String,
  audience: String,

  instructors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Instructor,
    },
  ],
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Course,
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

BundlesSchema.index({ slug: 1 });
BundlesSchema.index({ "$**": "text" });
export const Bundle = mongoose.model("Bundle", BundlesSchema);
