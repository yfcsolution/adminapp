import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Webhook from "@/models/whatsappWebhookSchema"; // Ensure correct path

export async function GET(req) {
  await connectDB();
  try {
    // Fetch webhook data where BOTH familyId and leadId are missing or empty
    const webhooks = await Webhook.aggregate([
      {
        $match: {
          $and: [
            {
              $or: [
                { familyId: { $exists: false } }, // familyId does not exist
                { familyId: null }, // familyId is null
                { familyId: "" }, // familyId is empty
              ],
            },
            {
              $or: [
                { leadId: { $exists: false } }, // leadId does not exist
                { leadId: null }, // leadId is null
                { leadId: "" }, // leadId is empty
              ],
            },
          ],
        },
      },
      {
        $addFields: {
          lastConversationDate: {
            $let: {
              vars: {
                lastElement: { $arrayElemAt: ["$conversation", -1] }, // Get last conversation element
              },
              in: "$$lastElement.createdAt", // Extract createdAt from last element
            },
          },
        },
      },
      { $sort: { lastConversationDate: -1 } }, // Sort by last conversation date (descending)
    ]);

    return NextResponse.json(
      { success: true, data: webhooks },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching webhook data:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
