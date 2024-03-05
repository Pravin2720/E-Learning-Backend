import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  review_for: {
    type: Object,
    entity_type: String,
    entity_id: mongoose.Schema.Types.ObjectId,
  },
  name: String,
  designation: String,
  rating: Number,
  title: String,
  review_text: String,
  image_url: String,

  is_featured: Boolean,
  feature_order: Number,

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
  deactivated_at: Number,
  active: { type: Boolean, default: true },
});

ReviewSchema.index({ "$**": "text" });
export const Review = mongoose.model("Review", ReviewSchema);
