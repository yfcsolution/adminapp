import mongoose from "mongoose";

const loginOtpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      default: "Unknown",
    },
    userAgent: {
      type: String,
      default: "Unknown",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optional TTL index for automatic cleanup (e.g. 1 day after creation)
loginOtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.models.LoginOtp ||
  mongoose.model("LoginOtp", loginOtpSchema);

