import mongoose from "mongoose";
import { User } from "./users.model.js";
import { Instructor } from "./instructors.model.js";

const WorkshopsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  spayee_product_id: String,

  short_description: String,
  long_description: String,
  image_url: String,
  workshop_date: String,
  workshop_time: String,

  markup_price: Number,
  offer_price: Number,
  discount: Number,

  instructors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Instructor,
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

WorkshopsSchema.index({ slug: 1 });
WorkshopsSchema.index({ "$**": "text" });
export const Workshop = mongoose.model("Workshop", WorkshopsSchema);
