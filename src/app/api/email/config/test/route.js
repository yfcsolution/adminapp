// Test Email Configuration API
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await connectDB();

    const { testEmail, config } = await req.json();

    if (!testEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Test email address is required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address format",
        },
        { status: 400 }
      );
    }

    // Use provided config or get from database
    let emailConfig = config;
    if (!emailConfig) {
      const EmailConfig = (await import("@/models/EmailConfig")).default;
      const dbConfig = await EmailConfig.findOne({ isActive: true }).lean();
      if (!dbConfig) {
        return NextResponse.json(
          {
            success: false,
            error: "Email configuration not found. Please configure email first.",
          },
          { status: 404 }
        );
      }
      emailConfig = dbConfig;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpSecure,
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPassword,
      },
      tls: {
        rejectUnauthorized: emailConfig.tlsRejectUnauthorized !== false,
      },
    });

    // Send test email
    const mailResponse = await transporter.sendMail({
      from: emailConfig.smtpUser,
      to: testEmail,
      subject: "Test Email from Admin Portal",
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email sent from your admin portal.</p>
        <p>If you received this email, your SMTP configuration is working correctly!</p>
        <hr>
        <p><small>Sent at: ${new Date().toISOString()}</small></p>
      `,
      text: "This is a test email sent from your admin portal. If you received this email, your SMTP configuration is working correctly!",
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      data: {
        messageId: mailResponse.messageId,
        accepted: mailResponse.accepted,
        rejected: mailResponse.rejected,
      },
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send test email",
        details: error.response || null,
      },
      { status: 500 }
    );
  }
}
