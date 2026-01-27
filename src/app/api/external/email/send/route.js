// External API: Send Email by Lead ID
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { verifyApiKey } from "@/middleware/apiKeyAuth";
import LeadsForm from "@/models/LeadsForm";
import EmailLog from "@/models/EmailLog";
import nodemailer from "nodemailer";

// Get email transporter from config stored in database
async function getEmailTransporter() {
  await connectDB();
  const EmailConfig = (await import("@/models/EmailConfig")).default;
  const config = await EmailConfig.findOne({ isActive: true }).lean();

  if (!config) {
    throw new Error("Email configuration not found. Please configure email in admin panel.");
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure, // true for 465, false for other ports
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
    tls: {
      rejectUnauthorized: config.tlsRejectUnauthorized !== false,
    },
  });
}

export async function POST(req) {
  try {
    // Verify API Key
    const authResult = await verifyApiKey(req);
    if (authResult) {
      return authResult;
    }

    await connectDB();

    const { leadId, subject, body } = await req.json();

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

    if (!subject || !body) {
      return NextResponse.json(
        {
          success: false,
          error: "subject and body are required",
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

    // Validate email address
    if (!lead.EMAIL) {
      return NextResponse.json(
        {
          success: false,
          error: `Lead ${leadId} does not have an email address`,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lead.EMAIL)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid email address format for lead ${leadId}`,
        },
        { status: 400 }
      );
    }

    // Get email transporter
    const transporter = await getEmailTransporter();

    // Prepare log data
    let logData = {
      leadId: lead.LEAD_ID,
      email: lead.EMAIL,
      subject,
      body,
      type: "external_api",
      status: "failed",
      sentAt: new Date(),
    };

    try {
      // Get sender email from config
      const EmailConfig = (await import("@/models/EmailConfig")).default;
      const config = await EmailConfig.findOne({ isActive: true }).lean();

      // Send email
      const mailResponse = await transporter.sendMail({
        from: config.smtpUser,
        to: lead.EMAIL,
        subject,
        html: body,
        text: body.replace(/<[^>]*>?/gm, ""),
      });

      // Log success
      logData.status = "success";
      logData.messageId = mailResponse.messageId;
      logData.response = {
        accepted: mailResponse.accepted,
        rejected: mailResponse.rejected,
      };

      const log = new EmailLog(logData);
      await log.save();

      return NextResponse.json(
        {
          success: true,
          message: "Email sent successfully",
          data: {
            leadId: lead.LEAD_ID,
            leadName: lead.FULL_NAME,
            email: lead.EMAIL,
            subject,
            messageId: mailResponse.messageId,
            logId: log._id,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      // Log failure
      logData.error = error.message;
      logData.response = error.response || null;

      const log = new EmailLog(logData);
      await log.save();

      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to send email",
          logId: log._id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("External Email API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
