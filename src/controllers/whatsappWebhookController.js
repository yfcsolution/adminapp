import { NextResponse } from "next/server"; // Import NextResponse
import Webhook from "@/models/whatsappWebhookSchema"; // Import Webhook model
import axios from "axios";
import ERP_BASE_URL from "@/config/erpUrl";

// Function to fetch all webhook data from the database
export const whatsappWebhookData = async ({ page = 1, pageSize = 10 }) => {
  try {
    // Calculate the number of documents to skip
    const skip = (page - 1) * pageSize;

    // Fetch paginated data
    const webhooks = await Webhook.find({})
      .sort({ createdAt: -1 }) // Sort by created date, descending
      .skip(skip) // Skip the records based on the page
      .limit(pageSize); // Limit the number of records to return

    // Get total count for pagination info
    const totalCount = await Webhook.countDocuments();

    // Return the paginated data with the total count for pagination
    return NextResponse.json(
      {
        success: true,
        data: webhooks, // The paginated webhook data
        totalCount, // Total number of records
        page,
        pageSize,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle errors such as connection failure or query failure
    console.error("Error fetching webhook data:", error);

    // Return error response using NextResponse
    return NextResponse.json(
      {
        success: false,
        error: error.message, // Send the error message
      },
      { status: 500 }
    );
  }
};

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

export const handleUnSyncedLogs = async () => {
  try {
    // Fetch unsynced logs from the database
    const logs = await Webhook.find({ syncedToOracle: false });

    // Loop through each log and send it to the Oracle API
    for (const log of logs) {
      const data = {
        CONVERSATION: log.conversation,
        RECEIVER: log.receiver,
        SENDER: "*********", // Masking sender if needed
        SENDER_TIMESTAMP: new Date(
          log.senderTimestamp * 1000
        ).toLocaleDateString("en-US"),
        RECIPIENT_TIMESTAMP: new Date(
          log.recipientTimestamp * 1000
        ).toLocaleDateString("en-US"),
        SENDER_KEYHASH: log.senderKeyHash,
        RECIPIENT_KEYHASH: log.recipientKeyHash,
        MESSAGE_SECRET: log.messageSecret,
        CREATEDAT: formatDateInTimeZone(log.createdAt, "Asia/Karachi"),
        LEAD_ID: log.leadId,
        FAMILY_ID: log.familyId,
      };

      try {
        // Send the data to the Oracle API
        const response = await axios.post(
          `${ERP_BASE_URL}/yfcerp/waconversations/insert/`,
          data
        );

        // If the request was successful, mark the log as synced
        if (response.status === 200) {
          log.syncedToOracle = true; // Update the synced status
          await log.save(); // Save the updated status to the database
          console.log(
            `Log with LEAD_ID ${log.leadId} successfully synced to Oracle.`
          );
        } else {
          console.log(`Failed to sync log with LEAD_ID ${log.leadId}.`);
        }
      } catch (error) {
        console.error(
          `Error syncing log with LEAD_ID ${log.leadId}:`,
          error.message
        );
      }
    }

    // Return the result of the operation
    return NextResponse.json({
      success: true,
      message: "Logs processed and synced where applicable",
    });
  } catch (error) {
    console.error("Error processing unsynced logs:", error.message);
    return NextResponse.json({
      success: false,
      message: "Error processing unsynced logs",
    });
  }
};

export const deleteWebhook = async (req) => {
  try {
    const { conversationId } = await req.json(); // Parse the incoming request JSON

    if (!conversationId) {
      return new Response(
        JSON.stringify({ message: "Conversation ID is required" }),
        {
          status: 400,
        }
      );
    }

    // Attempt to find and delete the lead by ID
    const conversation = await Webhook.findOneAndDelete(conversationId);

    if (!conversation) {
      return new Response(
        JSON.stringify({ message: "conversation not found" }),
        {
          status: 404,
        }
      );
    }

    // If lead is deleted, return success message
    return new Response(
      JSON.stringify({ message: "conversation deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      {
        status: 500,
      }
    );
  }
};
