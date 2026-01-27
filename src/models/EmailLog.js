import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    leadId: {
      type: Number,
      index: true,
    },
    userId: {
      type: Number,
      index: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
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
emailLogSchema.index({ leadId: 1, sentAt: -1 });
emailLogSchema.index({ userId: 1, sentAt: -1 });
emailLogSchema.index({ type: 1, status: 1, sentAt: -1 });

export default mongoose.models.EmailLog ||
  mongoose.model("EmailLog", emailLogSchema);
