import mongoose from "mongoose";

const NewsletterListSchema = new mongoose.Schema({
  email: String,

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
  unsubscribed: { type: Boolean, default: false },
});

NewsletterListSchema.index({ email: "text" });
export const NewsletterList = mongoose.model("NewsletterList", NewsletterListSchema, "newsletter_list");
