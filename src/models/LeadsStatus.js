import mongoose from "mongoose";

const LeadsStatusSchema = new mongoose.Schema(
  {
    ID: {
      type: Number,
      required: true,
      unique: true, // Ensure ID is unique
    },
    NAME: {
      type: String,
      required: true,
    },
    STATUSORDER: {
      type: Number,
    },
    COLOR: {
      type: String,
    },
    ISDEFAULT: {
      type: Boolean,
      default: false, // Default value is false
    },
    CREATE_BY: {
      type: Number,
    },
    CREATED_DATE: {
      type: Date,
      default: Date.now, // Automatically set to current date/time
    },
    UPDATED_BY: {
      type: Number,
    },
    UPDATED_DATE: {
      type: Date,
    },
  },
  {
    timestamps: false, // Disable Mongoose default timestamps since we have custom fields
  }
);

export default mongoose.models.LeadsStatus ||
  mongoose.model("LeadsStatus", LeadsStatusSchema);
