import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  name: String,
  description: String,
  code: String,

  discount_type: String,
  value: Number,
  quantity: Number,
  stackable: { type: Boolean, default: false },
  exclusive: { type: Object, default: {} },

  starts_at: Number,
  expires_at: Number,

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
  deactivated_at: Number,
  active: { type: Boolean, default: true },
});

CouponSchema.index({ "$**": "text" });
export const Coupon = mongoose.model("Coupon", CouponSchema);
