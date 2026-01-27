import mongoose from "mongoose";

const templateScheduleSchema = new mongoose.Schema(
  {
    leadId: {
      type: Number,
      index: true,
    },
    userId: {
      type: Number,
      index: true,
    },
    templateName: {
      type: String,
      required: true,
    },
    templateId: {
      type: String,
    },
    daysAfter: {
      type: Number,
      required: true,
      default: 0, // 0 means send immediately
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    exampleArr: {
      type: [String],
      default: [],
    },
    mediaUri: {
      type: String,
      default: null,
    },
    messageType: {
      type: String,
      enum: ["whatsapp", "email"],
      required: true,
      index: true,
    },
    // For email schedules
    emailSubject: {
      type: String,
      default: null,
    },
    emailBody: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
templateScheduleSchema.index({ scheduledDate: 1, status: 1 });
templateScheduleSchema.index({ leadId: 1, status: 1 });
templateScheduleSchema.index({ userId: 1, status: 1 });

export default mongoose.models.TemplateSchedule ||
  mongoose.model("TemplateSchedule", templateScheduleSchema);
