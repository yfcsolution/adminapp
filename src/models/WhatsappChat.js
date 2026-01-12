// import mongoose from "mongoose";
// import axios from "axios";

// // Define the webhook schema
// const webhookSchema = new mongoose.Schema(
//   {
//     conversationId: { type: Number, default: 1 }, // Default conversationId is set to 1
//     leadId: { type: Number },
//     familyId: { type: Number },
//     conversation: [
//       {
//         text: { type: String }, // The message content
//         isReply: { type: Boolean, default: false }, // True for replies, false for received messages
//         sender: { type: String }, // Sender details (e.g., "user" or "lead")
//         receiver: { type: String }, // Receiver details
//         createdAt: { type: Date, default: Date.now }, // Time of the message
//         senderTimestamp: { type: Number },
//         recipientTimestamp: { type: Number },
//         senderKeyHash: { type: String },
//         recipientKeyHash: { type: String },
//         messageSecret: { type: String },
//       },
//     ],
//     syncedToOracle: {
//       type: Boolean,
//       default: false, // Track whether the lead has been synced to Oracle
//     },
//     isVerified: { type: Boolean, default: true },
//   },
//   { minimize: true, timestamps: true }
// );

// // Pre-save hook to increment conversationId
// webhookSchema.pre("save", async function (next) {
//   // If it's a new document, increment the conversationId
//   if (this.isNew) {
//     try {
//       const lastWebhook = await Webhook.findOne()
//         .sort({ conversationId: -1 })
//         .exec();
//       if (lastWebhook) {
//         this.conversationId = lastWebhook.conversationId + 1;
//       } else {
//         this.conversationId = 1; // If no previous webhook exists, start with 1
//       }
//       next();
//     } catch (error) {
//       console.error("Error fetching last conversationId:", error);
//       next(error); // Pass the error to the next middleware
//     }
//   } else {
//     next(); // If not a new document, just proceed with the save
//   }
// });

// // Helper function to format date in a specific timezone
// const formatDateInTimeZone = (date, timeZone = "Asia/Karachi") => {
//   return new Date(date).toLocaleString("en-US", {
//     timeZone,
//     weekday: "short", // day of the week (e.g., Mon)
//     year: "numeric",
//     month: "short", // abbreviated month (e.g., Nov)
//     day: "2-digit", // day of the month (e.g., 10)
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true, // AM/PM format
//   });
// };

// // Custom method to send data to Oracle API
// webhookSchema.methods.sendToOracle = async function () {
//   try {
//     // Prepare the data to send to Oracle API
//     const data = {
//       CONVERSATION: this.conversation,
//       RECEIVER: this.receiver,
//       SENDER: "*********",
//       SENDER_TIMESTAMP: new Date(
//         this.senderTimestamp * 1000
//       ).toLocaleDateString("en-US"), // Format timestamp
//       RECIPIENT_TIMESTAMP: new Date(
//         this.recipientTimestamp * 1000
//       ).toLocaleDateString("en-US"), // Format timestamp
//       SENDER_KEYHASH: this.senderKeyHash,
//       RECIPIENT_KEYHASH: this.recipientKeyHash,
//       MESSAGE_SECRET: this.messageSecret,
//       CREATEDAT: formatDateInTimeZone(this.createdAt, "Asia/Karachi"), // Format createdAt field to Asia/Karachi timezone
//       LEAD_ID: this.leadId,
//       FAMILY_ID: this.familyId,
//     };

//     // Make the POST request to Oracle API
//     const response = await axios.post(
//       "${ERP_BASE_URL}/yfc_erp/waconversations/insert/",
//       data
//     );

//     if (response.status === 200) {
//       console.log("Data successfully sent to Oracle API.");
//       this.syncedToOracle = true;
//       await this.save();
//       return true;
//     } else {
//       console.error("Failed to send data to Oracle API.");
//       return false;
//     }
//   } catch (error) {
//     console.error("Error sending data to Oracle:", error);
//     return false;
//   }
// };

// // Define the model using the schema
// const Webhook =
//   mongoose.models.whatsappWebhook ||
//   mongoose.model("whatsappWebhook", webhookSchema);

// export default Webhook;
