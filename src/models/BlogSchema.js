import mongoose from "mongoose";
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
    },
    image_alt_text: {
      type: String,
    },
    video: {
      type: String,
    },
    video_position: {
      type: String,
    },
    category: {
      type: String,
    },
    author: {
      type: String,
    },
    content: {
      type: String,
    },
    isPage: {
      type: Boolean,
      default: false,
    },
    meta_description: {
      type: String,
    },
    meta_keywords: {
      type: [String],
    },
    tags: {
      type: [String],
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
