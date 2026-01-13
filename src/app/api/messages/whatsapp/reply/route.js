import connectDB from "@/config/db";
import Webhook from "@/models/whatsappWebhookSchema";
import { NextResponse } from "next/server";
import { sendWhatsAppMessage } from "@/utils/whatsappSender";

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;
  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
}

export async function POST(req) {
  await connectDB();

  try {
    const { Id, templateName, exampleArr, token, mediaUri } = await req.json();

    // Validate required fields for WACRM
    if (!templateName) {
      return NextResponse.json(
        { error: "templateName is required for WACRM (WhatsApp Cloud API)" },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "token (JWT) is required for WACRM (WhatsApp Cloud API)" },
        { status: 400 }
      );
    }

    if (!Id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    // Get conversation and extract receiver from last message - optimized query
    const existingConversation = await Webhook.findById(Id)
      .select("conversation")
      .lean();
    
    if (!existingConversation || !existingConversation.conversation?.length) {
      return NextResponse.json(
        { error: "No conversation found for the provided ID" },
        { status: 404 }
      );
    }

    const lastMessage = existingConversation.conversation[existingConversation.conversation.length - 1];
    const receiver = formatPhoneNumber(
      lastMessage?.isReply ? lastMessage.receiver : lastMessage.sender
    );

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver phone number not found in conversation" },
        { status: 404 }
      );
    }

    // Send template message using WACRM
    const sendResult = await sendWhatsAppMessage({
      to: receiver,
      templateName,
      exampleArr: exampleArr || [],
      token,
      mediaUri,
    });


    // Save to DB if message sent successfully
    if (sendResult.success) {
      const newMessage = {
        text: `Template: ${templateName}`,
        isReply: true,
        sender: "WACRM",
        receiver,
        createdAt: new Date(),
      };

      const webhookEntry = await Webhook.findByIdAndUpdate(
        Id,
        { $push: { conversation: newMessage } },
        { new: true }
      );

      // Send to Oracle
      if (webhookEntry) {
        await webhookEntry.sendToOracle().catch(err => 
          console.error("Oracle sync failed:", err)
        );
      }

      return NextResponse.json(
        {
          message: "WhatsApp reply message sent successfully",
          status: sendResult.status,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in sending custom messages:", error);

    if (error.response) {
      return NextResponse.json(
        {
          error: "Failed to send WhatsApp custom message",
          details: error.response.data,
          status: error.response.status,
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
