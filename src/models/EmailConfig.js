import mongoose from "mongoose";

const emailConfigSchema = new mongoose.Schema(
  {
    smtpHost: {
      type: String,
      required: true,
      trim: true,
    },
    smtpPort: {
      type: Number,
      required: true,
      default: 587,
    },
    smtpSecure: {
      type: Boolean,
      default: false, // true for 465 (SSL), false for 587 (TLS)
    },
    smtpUser: {
      type: String,
      required: true,
      trim: true,
    },
    smtpPassword: {
      type: String,
      required: true,
    },
    tlsRejectUnauthorized: {
      type: Boolean,
      default: false, // Set to true in production with valid certificates
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.EmailConfig ||
  mongoose.model("EmailConfig", emailConfigSchema);
