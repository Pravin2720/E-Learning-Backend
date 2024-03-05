import mongoose from "mongoose";

const InstructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },

  designation: String,
  linkedin_url: String,
  icon_url: String,
  is_featured: { type: Boolean, default: false },

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
  deactivated_at: Number,
  active: { type: Boolean, default: true },
});

InstructorSchema.index({ "$**": "text" });
export const Instructor = mongoose.model("Instructor", InstructorSchema);
