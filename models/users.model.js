import mongoose from "mongoose";
import { Role } from "./roles.model.js";

const UserSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  avatar_url: String,
  password: String,

  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Role,
    },
  ],

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
  deactivated_at: Number,
  active: { type: Boolean, default: true },
});

UserSchema.index({ first_name: "text", last_name: "text", email: "text" });
export const User = mongoose.model("User", UserSchema);
