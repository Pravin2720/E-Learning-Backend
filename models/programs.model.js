import mongoose from "mongoose";
import { User } from "./users.model.js";
import { Instructor } from "./instructors.model.js";
import { Chapter } from "./chapters.model.js";
import { Category } from "./categories.model.js";

const ProgramsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  role: { type: String, required: true },
  slug: { type: String, required: true },
  tags: [String],

  short_description: String,
  long_description: String,
  registration_url: String,
  image_url: String,

  markup_price: Number,
  offer_price: Number,
  discount: Number,

  perks: [String],
  videos: String,
  duration_in_weeks: Number,
  daily_commitment: Number,
  remaining_capacity: Number,
  total_capacity: Number,
  fees_fixed: String,
  fees_variable: String,
  batch_start_date: Number,
  registration_last_date: Number,
  steps: [Object],

  pre_requisites: String,
  outcome: String,
  requirements: String,
  audience: String,

  instructors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Instructor,
    },
  ],
  curriculum: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Chapter,
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

ProgramsSchema.index({ "$**": "text" });
export const Program = mongoose.model("Program", ProgramsSchema);
