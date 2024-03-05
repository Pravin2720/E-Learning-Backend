import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  order_id: String,
  status: { type: String, default: "created" },
  valid: { type: String, default: "invalid" },
  mode: String,
  notes: Object,
  data: Object,
  entity: {
    // ! deprecated
    type: Object,
    entity_type: String,
    entity_id: mongoose.Schema.Types.ObjectId,
  },
  entities: [
    {
      type: Object,
      entity_type: String,
      entity_id: mongoose.Schema.Types.ObjectId,
    },
  ],
  pre_launch_entities: [
    // ? experimental
    {
      type: Object,
      entity_type: String,
      entity_id: mongoose.Schema.Types.ObjectId,
    },
  ],
  amount: Number,
  coupon_applied: { type: Object, ref: "Coupon" },

  followup_action_status: { type: String, default: "pending" },

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
  deactivated_at: Number,
});

OrderSchema.index({ order_id: 1 });
OrderSchema.index({ "$**": "text" });
export const Order = mongoose.model("Order", OrderSchema);
