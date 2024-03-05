import mongoose from "mongoose";

const WebhookSchema = new mongoose.Schema({
  header_event_id: String,
  signature: String,
  data: Object,
  received_at: { type: Number, default: Date.now },
  valid: { type: Boolean, default: false },
  ack_sent: { type: Boolean, default: false },
});

export const Webhook = mongoose.model("Webhook", WebhookSchema);
