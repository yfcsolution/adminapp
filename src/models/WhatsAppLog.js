import mongoose from "mongoose";

const whatsappLogSchema = new mongoose.Schema(
  {
    leadId: {
      type: Number,
      index: true,
    },
    userId: {
      type: Number,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    templateName: {
      type: String,
      required: true,
    },
    templateId: {
      type: String,
    },
    exampleArr: {
      type: [String],
      default: [],
    },
    mediaUri: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["auto", "manual"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
      index: true,
    },
    messageId: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
whatsappLogSchema.index({ leadId: 1, sentAt: -1 });
whatsappLogSchema.index({ userId: 1, sentAt: -1 });
whatsappLogSchema.index({ type: 1, status: 1, sentAt: -1 });

export default mongoose.models.WhatsAppLog ||
  mongoose.model("WhatsAppLog", whatsappLogSchema);
