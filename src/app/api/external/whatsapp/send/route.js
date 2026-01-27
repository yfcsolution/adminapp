// External API: Send WhatsApp Template by Lead ID
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { verifyApiKey } from "@/middleware/apiKeyAuth";
import LeadsForm from "@/models/LeadsForm";
import WhatsAppTemplate from "@/models/WhatsAppTemplate";
import AutoSendConfig from "@/models/AutoSendConfig";
import { sendAndLogWhatsApp } from "@/lib/wacrmService";

export async function POST(req) {
  try {
    // Verify API Key
    const authResult = await verifyApiKey(req);
    if (authResult) {
      return authResult;
    }

    await connectDB();

    const { leadId, templateName } = await req.json();

    // Validate required fields
    if (!leadId) {
      return NextResponse.json(
        {
          success: false,
          error: "leadId is required",
        },
        { status: 400 }
      );
    }

    if (!templateName) {
      return NextResponse.json(
        {
          success: false,
          error: "templateName is required",
        },
        { status: 400 }
      );
    }

    // Find lead by LEAD_ID
    const lead = await LeadsForm.findOne({ LEAD_ID: leadId }).lean();
    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          error: `Lead with ID ${leadId} not found`,
        },
        { status: 404 }
      );
    }

    // Find template by name
    const template = await WhatsAppTemplate.findOne({ 
      templateName,
      isActive: true 
    }).lean();

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: `Template "${templateName}" not found or inactive`,
        },
        { status: 404 }
      );
    }

    // Get WACRM API token from config
    const config = await AutoSendConfig.findOne({ type: "whatsapp" }).lean();
    if (!config || !config.token) {
      return NextResponse.json(
        {
          success: false,
          error: "WhatsApp API token not configured. Please configure it in admin panel.",
        },
        { status: 500 }
      );
    }

    // Validate phone number
    if (!lead.PHONE_NO) {
      return NextResponse.json(
        {
          success: false,
          error: `Lead ${leadId} does not have a phone number`,
        },
        { status: 400 }
      );
    }

    // Send WhatsApp template
    const result = await sendAndLogWhatsApp({
      sendTo: lead.PHONE_NO,
      templateName: template.templateName,
      templateId: template.templateId,
      exampleArr: template.exampleArr || [],
      token: config.token,
      mediaUri: template.mediaUri || null,
      leadId: lead.LEAD_ID,
      type: "external_api",
    });

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: "WhatsApp template sent successfully",
          data: {
            leadId: lead.LEAD_ID,
            leadName: lead.FULL_NAME,
            phoneNumber: lead.PHONE_NO,
            templateName: template.templateName,
            templateId: template.templateId,
            messageId: result.messageId,
            logId: result.logId,
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to send WhatsApp template",
          logId: result.logId,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("External WhatsApp API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
