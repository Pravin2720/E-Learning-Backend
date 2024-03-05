import mongoose from "mongoose";
import { User } from "./users.model.js";

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
  items: [
    {
      type: Object,
      entity_type: String,
      entity_id: mongoose.Schema.Types.ObjectId,
    },
  ],

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
});

CartSchema.index({ user: 1 });
export const Cart = mongoose.model("Cart", CartSchema);
