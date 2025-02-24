import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    role_id: {
      type: Number,
      required: true,
      unique: true,
    },
    role_name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Use existing model if already registered, otherwise create a new one
export default mongoose.models.Role || mongoose.model("Role", roleSchema);
