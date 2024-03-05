import mongoose from "mongoose";
import { User } from "./users.model.js";

const KeyStoreSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true,
  },
  primary_key: { type: String, required: true },
  secondary_key: { type: String, required: true },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deactivated_at: Date,
  active: { type: Boolean, default: true },
});

KeyStoreSchema.index({ client: 1, primary_key: 1 });
KeyStoreSchema.index({ client: 1, primary_key: 1, secondary_key: 1 });
export const KeyStore = mongoose.model("KeyStore", KeyStoreSchema);
