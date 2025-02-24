import connectDB from "@/config/db";
import axios from "axios"; // Ensure axios is installed
import { NextResponse } from "next/server";
import Webhook from "@/models/whatsappWebhookSchema";

const formatDateInTimeZone = (date, timeZone = "Asia/Karachi") => {
  return new Date(date).toLocaleString("en-US", {
    timeZone,
    weekday: "short", // day of the week (e.g., Mon)
    year: "numeric",
    month: "short", // abbreviated month (e.g., Nov)
    day: "2-digit", // day of the month (e.g., 10)
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // AM/PM format
  });
};

export async function POST(req) {
  try {
    // Connect to the database
    await connectDB();

    // Parse the request body to extract conversationId
    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { message: "Conversation ID is required", success: false },
        { status: 400 }
      );
    }

    // Find the conversation in the database
    const conversation = await Webhook.findOne({ conversationId });

    if (!conversation) {
      return NextResponse.json(
        {
          message: `Conversation with conversationId ${conversationId} not found`,
          success: false,
        },
        { status: 404 }
      );
    }

    // Prepare the data to be sent in the POST request
    const data = {
      CONVERSATION: conversation.conversation,
      RECEIVER: conversation.receiver,
      SENDER: "*********", // Mask sender if required
      SENDER_TIMESTAMP: new Date(
        conversation.senderTimestamp * 1000
      ).toLocaleDateString("en-US"),
      RECIPIENT_TIMESTAMP: new Date(
        conversation.recipientTimestamp * 1000
      ).toLocaleDateString("en-US"),
      SENDER_KEYHASH: conversation.senderKeyHash,
      RECIPIENT_KEYHASH: conversation.recipientKeyHash,
      MESSAGE_SECRET: conversation.messageSecret,
      CREATEDAT: formatDateInTimeZone(conversation.createdAt, "Asia/Karachi"),
      LEAD_ID: conversation.leadId,
      FAMILY_ID: conversation.familyId,
    };

    // Send the data to the Oracle API
    const response = await axios.post(
      "http://103.18.23.62:8080/apeks/apps/erp/waconversations/insert/",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // If the request was successful, mark the conversation as synced
    if (response.status === 200) {
      conversation.syncedToOracle = true; // Update the synced status
      await conversation.save(); // Save the updated status to the database
      return NextResponse.json({
        message: `Conversation with conversationId ${conversationId} successfully synced to Oracle.`,
        success: true,
      });
    } else {
      console.error("Failed to sync conversation:", response.data.error);
      return NextResponse.json(
        {
          message: "Failed to sync conversation to Oracle",
          error: response.data.error || "Unknown error",
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error during conversation sync:", error.message);
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
