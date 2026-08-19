import mongoose from "mongoose";

const highlightItemSchema = new mongoose.Schema({
  media: { type: String, required: true },
  mediaType: { type: String, enum: ["image", "video"], default: "image" },
  caption: { type: String, default: "" },
  addedAt: { type: Date, default: Date.now },
});

const highlightSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "Highlights" },
    cover: { type: String, default: "" },
    items: [highlightItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Highlight", highlightSchema);
