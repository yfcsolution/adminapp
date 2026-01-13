// API Route for sending WhatsApp template messages via WACRM
import { NextResponse } from "next/server";
import { sendWhatsAppMessage, getPhoneNumberFromDatabase } from "@/utils/whatsappSender";
import { getCurrentServer } from "@/config/getCurrentServer";
import connectDB from "@/config/db";

export async function POST(req) {
  try {
    await connectDB();
    const server = await getCurrentServer();

    // Only allow template sending via WACRM
    if (server !== "wacrm") {
      return NextResponse.json(
        {
          error: "Template messages are only available via WACRM provider",
          currentProvider: server,
        },
        { status: 400 }
      );
    }

    const {
      sendTo,
      userid,
      lead_id,
      templateName,
      exampleArr,
      token,
      mediaUri,
    } = await req.json();

    // Validate required fields
    if (!templateName) {
      return NextResponse.json(
        { error: "templateName is required" },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "token is required for WACRM API" },
        { status: 400 }
      );
    }

    // Get phone number
    let phoneNumber = sendTo;

    if (!phoneNumber) {
      // Try to get from database
      phoneNumber = await getPhoneNumberFromDatabase({ userid, lead_id });

      if (!phoneNumber) {
        return NextResponse.json(
          { error: "Phone number not found. Provide sendTo, userid, or lead_id" },
          { status: 400 }
        );
      }
    }

    // Format phone number (ensure it starts with +)
    if (!phoneNumber.startsWith("+")) {
      phoneNumber = `+${phoneNumber}`;
    }

    // Send template message
    const result = await sendWhatsAppMessage({
      to: phoneNumber,
      templateName: templateName,
      exampleArr: exampleArr || [],
      token: token,
      mediaUri: mediaUri,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Template message sent successfully",
        metaResponse: result.response,
        provider: result.provider,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending template message:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.error || error.message,
        details: error.details,
        provider: error.provider,
      },
      { status: error.status || 500 }
    );
  }
}
