import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import LeadsForm from "@/models/LeadsForm";
import Webhook from "@/models/whatsappWebhookSchema";

// API Route Handler
export async function GET(req) {
  try {
    // Step 1: Ensure we're connected to the DB
    await connectDB();

    // Step 2: Fetch all conversations (from Webhook model)
    const conversations = await Webhook.find();
    console.log("The conversations I received are:", conversations);

    // Step 3: Fetch all leads (from LeadsForm model)
    const leads = await LeadsForm.find();
    console.log("The leads I received are:", leads);

    // Step 4: Create a mapping of phone numbers to leadIds from the LeadsForm collection
    const phoneToLeadIdMap = leads.reduce((map, lead) => {
      if (lead.PHONE_NO) {
        map[lead.PHONE_NO] = lead.LEAD_ID; // Create a mapping of phone number to leadId
      }
      return map;
    }, {});

    // Step 5: Iterate over each conversation and update leadId if there's a match with the phone number
    let updatedCount = 0;
    for (let conversation of conversations) {
      const senderPhone = conversation.sender; // Assuming 'sender' is the phone number field in Webhook model
      const leadId = phoneToLeadIdMap[senderPhone];

      if (leadId) {
        // If a matching phone number is found, update the leadId in the conversation
        await Webhook.updateOne(
          { _id: conversation._id }, // Find the specific conversation
          { $set: { leadId: leadId } } // Update the leadId
        );
        updatedCount++;
      }
    }

    // Return success response with the number of conversations updated
    return NextResponse.json({
      success: true,
      message: `${updatedCount} conversations updated successfully.`,
    });
  } catch (error) {
    console.error("Error syncing leads and conversations:", error);
    return NextResponse.json(
      { success: false, message: "Error syncing leads and conversations" },
      { status: 500 }
    );
  }
}
