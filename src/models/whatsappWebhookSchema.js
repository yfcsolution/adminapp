import mongoose from "mongoose";
import axios from "axios";

// Define the webhook schema
const webhookSchema = new mongoose.Schema(
  {
    conversationId: { type: Number, default: 1 }, // Default conversationId is set to 1
    leadId: { type: Number },
    familyId: { type: Number },
    conversation: [
      {
        text: { type: String }, // The message content
        isReply: { type: Boolean, default: false }, // True for replies, false for received messages
        sender: { type: String }, // Sender details
        receiver: { type: String }, // Receiver details
        createdAt: { type: Date, default: Date.now }, // Time of the message
        senderTimestamp: { type: Number },
        recipientTimestamp: { type: Number },
        senderKeyHash: { type: String },
        recipientKeyHash: { type: String },
        messageSecret: { type: String },
      },
    ],
    syncedToOracle: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: true },
  },
  { minimize: true, timestamps: true }
);

// Pre-save hook to increment conversationId
webhookSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const lastWebhook = await Webhook.findOne().sort({ conversationId: -1 });
      this.conversationId = lastWebhook ? lastWebhook.conversationId + 1 : 1;
    } catch (error) {
      console.error("Error fetching last conversationId:", error);
      return next(error);
    }
  }
  next();
});

// Helper function to format date in a specific timezone
const formatDateInTimeZone = (date, timeZone = "Asia/Karachi") => {
  return new Date(date).toLocaleString("en-US", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
};

// Custom method to send data to Oracle API
webhookSchema.methods.sendToOracle = async function () {
  const lastMessage =
    this.conversation && this.conversation.length > 0
      ? this.conversation[this.conversation.length - 1]
      : null;

  if (!lastMessage) {
    console.error("No conversation data available.");
    return false;
  }

  const data = {
    CONVERSATION_ID: this.conversationId,
    LEAD_ID: this.leadId,
    FAMILY_ID: this.familyId,
    TEXT: lastMessage.text,
    IS_REPLY: lastMessage.isReply ? "yes" : "no",
    SENDER: lastMessage.isReply ? lastMessage.sender : "********",
    RECEIVER: lastMessage.isReply ? "*******" : lastMessage.receiver,
    CREATED_AT: formatDateInTimeZone(this.createdAt),
    SENDER_TIMESTAMP: lastMessage.senderTimestamp,
    RECIPIENT_TIMESTAMP: lastMessage.recipientTimestamp,
    SENDER_KEY_HASH: lastMessage.senderKeyHash,
    RECIPIENT_KEY_HASH: lastMessage.recipientKeyHash,
    MESSAGE_SECRET: lastMessage.messageSecret,
    CONVERSATION_CREATED_AT: formatDateInTimeZone(lastMessage.createdAt),
    CONVERSATION_UPDATED_AT: formatDateInTimeZone(
      this.updatedAt || lastMessage.createdAt
    ),
    C_ID: this._id,
  };

  try {
    const response = await axios.post(
      "${ERP_BASE_URL}/yfc_erp/whatsapp/insert/",
      data
    );
    if (response.status === 200) {
      console.log("Data successfully sent to Oracle API.");
      this.syncedToOracle = true;
      await this.save();
      return true;
    } else {
      console.error("Failed to send data to Oracle API.");
      return false;
    }
  } catch (error) {
    console.error("Error sending data to Oracle:", error);
    return false;
  }
};

// Define the model using the schema
const Webhook =
  mongoose.models.whatsappChat || mongoose.model("whatsappChat", webhookSchema);

export default Webhook;
