import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  name: String,

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
  deactivated_at: Number,
  active: { type: Boolean, default: true },
});

RoleSchema.index({ name: "text" });
export const Role = mongoose.model("Role", RoleSchema);
