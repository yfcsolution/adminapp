import mongoose from "mongoose";

const whatsappTemplateSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    templateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    exampleArr: {
      type: [String],
      default: [],
    },
    mediaUri: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.WhatsAppTemplate ||
  mongoose.model("WhatsAppTemplate", whatsappTemplateSchema);
