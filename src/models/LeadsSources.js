import mongoose from "mongoose";
import axios from "axios";

const SourcesSchema = new mongoose.Schema(
  {
    ID: {
      type: Number,
      required: true,
    },
    NAME: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.LeadsSources ||
  mongoose.model("LeadsSources", SourcesSchema);
