import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
  name: String,
  description: String,

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
  deactivated_at: Number,
  active: { type: Boolean, default: true },
});

CategorySchema.index({ "$**": "text" });
export const Category = mongoose.model("Category", CategorySchema);
