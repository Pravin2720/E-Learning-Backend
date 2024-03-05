import mongoose from "mongoose";

const ForgetPasswordSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expire_at: { type: Date, required: true },
  consumed_at: Date,

  created_at: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

ForgetPasswordSchema.index({ email: "text" });
export const ForgetPassword = mongoose.model("ForgetPassword", ForgetPasswordSchema);
