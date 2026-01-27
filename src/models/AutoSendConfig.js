import mongoose from "mongoose";

const autoSendConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["whatsapp", "email"],
      required: true,
      unique: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    templateName: {
      type: String,
      default: null,
    },
    templateId: {
      type: String,
      default: null,
    },
    exampleArr: {
      type: [String],
      default: [],
    },
    mediaUri: {
      type: String,
      default: null,
    },
    // For email
    subject: {
      type: String,
      default: null,
    },
    body: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null, // For WhatsApp API token
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.AutoSendConfig ||
  mongoose.model("AutoSendConfig", autoSendConfigSchema);
