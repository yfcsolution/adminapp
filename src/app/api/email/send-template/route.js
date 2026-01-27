// API Route for sending emails (aligned with WhatsApp structure)
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import LeadsForm from "@/models/LeadsForm";
import EmailLog from "@/models/EmailLog";
import { transporter } from "@/config/nodemailer";

export async function POST(req) {
  try {
    await connectDB();

    const {
      leadId,
      userId,
      userid,
      family_id,
      to,
      subject,
      body,
      type = "manual",
    } = await req.json();

    // Validate required fields
    if (!subject || !body) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject and body are required",
        },
        { status: 400 }
      );
    }

    // Get email from database if not provided directly
    let email = to;
    const finalLeadId = leadId || null;
    const finalUserId = userId || userid || family_id || null;

    if (!email) {
      if (finalUserId) {
        const student = await Student.findOne({
          userid: finalUserId,
        }).select("email").lean();
        if (student?.email) {
          email = student.email;
        }
      } else if (finalLeadId) {
        const lead = await LeadsForm.findOne({
          LEAD_ID: finalLeadId,
        }).select("EMAIL").lean();
        if (lead?.EMAIL) {
          email = lead.EMAIL;
        }
      }

      if (!email) {
        return NextResponse.json(
          {
            success: false,
            error: "Email not found. Provide to, userId, or leadId",
          },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email address format",
        },
        { status: 400 }
      );
    }

    // Prepare log data
    let logData = {
      leadId: finalLeadId,
      userId: finalUserId,
      email,
      subject,
      body,
      type,
      status: "failed",
      sentAt: new Date(),
    };

    try {
      // Send email
      const mailResponse = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
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
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send email",
      },
      { status: 500 }
    );
  }
}
