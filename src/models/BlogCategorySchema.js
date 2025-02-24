import mongoose from "mongoose";
const blogCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true,
  },
});
export default mongoose.models.BlogCategory ||
  mongoose.model("BlogCategory", blogCategorySchema);
