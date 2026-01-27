// API Route for sending WhatsApp templates
// Supports both lead_id and userid
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { sendAndLogWhatsApp } from "@/lib/wacrmService";
import { getPhoneNumberFromDatabase } from "@/utils/whatsappSender";
import WhatsAppTemplate from "@/models/WhatsAppTemplate";

export async function POST(req) {
  try {
    await connectDB();

    const {
      leadId,
      userId,
      userid,
      family_id,
      sendTo,
      templateName,
      templateId,
      exampleArr = [],
      token,
      mediaUri = null,
      type = "manual",
    } = await req.json();

    // Validate required fields
    if (!templateName) {
      return NextResponse.json(
        {
          success: false,
          error: "Template name is required",
        },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "API token is required",
        },
        { status: 400 }
      );
    }

    // Get phone number from database if not provided directly
    let phoneNumber = sendTo;
    const finalLeadId = leadId || null;
    const finalUserId = userId || userid || family_id || null;

    if (!phoneNumber) {
      phoneNumber = await getPhoneNumberFromDatabase({
        userid: finalUserId,
        family_id: finalUserId,
        lead_id: finalLeadId,
      });

      if (!phoneNumber) {
        return NextResponse.json(
          {
            success: false,
            error: "Phone number not found. Provide sendTo, userId, or leadId",
          },
          { status: 400 }
        );
      }
    }

    // Get template details if templateId is provided
    let finalTemplateId = templateId;
    if (!finalTemplateId && templateName) {
      const template = await WhatsAppTemplate.findOne({
        templateName,
        isActive: true,
      }).lean();
      if (template) {
        finalTemplateId = template.templateId;
      }
    }

    // Send WhatsApp template
    const result = await sendAndLogWhatsApp({
      sendTo: phoneNumber,
      templateName,
      templateId: finalTemplateId,
      exampleArr,
      token,
      mediaUri,
      leadId: finalLeadId,
      userId: finalUserId,
      type,
    });

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: "WhatsApp template sent successfully",
          data: {
            messageId: result.messageId,
            logId: result.logId,
            response: result.response,
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          logId: result.logId,
          details: result.details,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending WhatsApp template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send WhatsApp template",
      },
      { status: 500 }
    );
  }
}
