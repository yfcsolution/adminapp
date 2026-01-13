// API Route for sending WhatsApp Cloud API template messages via WACRM
// WACRM is a wrapper around Meta's official WhatsApp Business API (WhatsApp Cloud API)
// This endpoint sends approved WhatsApp templates to users via Meta's Cloud API
import { NextResponse } from "next/server";
import { sendWhatsAppMessage, getPhoneNumberFromDatabase } from "@/utils/whatsappSender";
import connectDB from "@/config/db";

export async function POST(req) {
  try {
    await connectDB();

    const {
      sendTo,
      userid,
      family_id,
      lead_id,
      templateName,
      exampleArr,
      token,
      mediaUri,
    } = await req.json();

    // Validate required fields for WhatsApp Cloud API
    if (!templateName) {
      return NextResponse.json(
        { 
          error: "templateName is required",
          note: "Template must be pre-approved in Meta's WhatsApp Business Manager"
        },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { 
          error: "token (JWT) is required for WhatsApp Cloud API",
          note: "JWT token is required for authentication with Meta's WhatsApp Cloud API"
        },
        { status: 400 }
      );
    }

    // Get phone number - follows same pattern as existing WhatsApp endpoints
    // Priority: sendTo > family_id/userid (Student table) > lead_id (LeadsForm table)
    let phoneNumber = sendTo;

    if (!phoneNumber) {
      // Try to get from database using family_id/userid or lead_id
      // This matches the pattern used in other WhatsApp endpoints
      phoneNumber = await getPhoneNumberFromDatabase({ 
        userid: userid || family_id, 
        family_id: family_id || userid,
        lead_id 
      });

      if (!phoneNumber) {
        return NextResponse.json(
          { 
            error: "Phone number not found. Provide sendTo, family_id/userid, or lead_id",
            details: {
              provided: { sendTo, userid, family_id, lead_id },
              lookup: "Checked Student table (family_id/userid) and LeadsForm table (lead_id)"
            }
          },
          { status: 400 }
        );
      }
    }

    // Format phone number to E.164 format
    if (phoneNumber && !phoneNumber.startsWith("+")) {
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
