import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Webhook from "@/models/whatsappWebhookSchema"; // Ensure this path points to your Webhook model

// GET function to handle API requests
export async function POST(req) {
  await connectDB();
  const { leadId, familyId, conversationId } = await req.json();
  try {
    let webhooks;

    if (familyId) {
      // Fetch data based on familyId if it's provided
      webhooks = await Webhook.find({ familyId }).sort({ createdAt: 1 });
    } else if (leadId) {
      // If familyId is not provided, fetch data based on leadId
      webhooks = await Webhook.find({ leadId }).sort({ createdAt: 1 });
    } else if (conversationId) {
      // If familyId is not provided, fetch data based on leadId
      console.log(`i received conversationId which is ${conversationId}`);

      webhooks = await Webhook.find({ _id: conversationId }).sort({
        createdAt: 1,
      });
    } else {
      // If neither familyId nor leadId is provided, return an error
      return NextResponse.json(
        {
          success: false,
          error: "Either familyId or leadId must be provided.",
        },
        { status: 400 }
      );
    }

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
