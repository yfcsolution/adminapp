import mongoose from "mongoose";

const emailMessageSchema = new mongoose.Schema(
  {
    subject: { type: String },
    text: { type: String }, // The message content
    isReply: { type: Boolean, default: false }, // True for replies, false for received messages
    sender: { type: String }, // Sender details
    receiver: { type: String }, // Receiver details
    createdAt: { type: Date, default: Date.now }, // Time of the message
  },
  { _id: false } // Prevents creating separate _id for each message in the array
);

const emailSchema = new mongoose.Schema(
  {
    leadId: { type: Number },
    familyId: { type: Number },
    emails: [emailMessageSchema], // Reusable subdocument schema
    syncedToOracle: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Email = mongoose.models.Email || mongoose.model("Email", emailSchema);
export default Email;
