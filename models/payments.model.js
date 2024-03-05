import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  payment_id: String,
  order_id: String,
  status: String,
  notes: Object,
  data: Object,

  followup_action_status: { type: String, default: "pending" },

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
});

export const Payment = mongoose.model("Payment", PaymentSchema);
