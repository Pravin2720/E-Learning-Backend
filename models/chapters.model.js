import mongoose from "mongoose";

const ChapterSchema = new mongoose.Schema({
  title: String,
  video_link: String,
  sub_items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },
  ],
  parent: {
    type: Object,
    entity_type: String,
    entity_id: mongoose.Schema.Types.ObjectId,
  },

  created_at: { type: Number, default: Date.now },
  updated_at: { type: Number, default: Date.now },
  deactivated_at: Number,
  active: { type: Boolean, default: true },
});

ChapterSchema.index({ title: "text" });

export const Chapter = mongoose.model("Chapter", ChapterSchema);
