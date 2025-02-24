import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Webhook from "@/models/whatsappWebhookSchema"; // Ensure this path points to your Webhook model

// GET function to handle API requests
export async function GET(req) {
  await connectDB();
  try {
    // Fetch all webhook data, sorted by created date (descending)
    const webhooks = await Webhook.aggregate([
      {
        $addFields: {
          lastConversationDate: {
            $let: {
              vars: {
                lastElement: { $arrayElemAt: ["$conversation", -1] }, // Get the last element of the conversation array
              },
              in: "$$lastElement.createdAt", // Extract createdAt from the last element
            },
          },
        },
      },
      { $sort: { lastConversationDate: -1 } }, // Sort by lastConversationDate in descending order
    ]);

    // Return the webhook data
    return NextResponse.json(
      {
        success: true,
        data: webhooks, // All webhook data
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
}
