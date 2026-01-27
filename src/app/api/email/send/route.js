import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import Student from "@/models/Student";
import LeadsForm from "@/models/LeadsForm";
import Email from "@/models/Emails";
import EmailLog from "@/models/EmailLog";
import EmailConfig from "@/models/EmailConfig";
import connectDB from "@/config/db";

// Get email transporter from database config
async function getEmailTransporter() {
  await connectDB();
  const config = await EmailConfig.findOne({ isActive: true }).lean();

  if (!config) {
    // Fallback to environment variables if no config in database
    return nodemailer.createTransport({
      host: process.env.EMAIL_SMTP_HOST || "mail.ilmulquran.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || "test@ilmulquran.com",
        pass: process.env.EMAIL_PASSWORD || "2025@Ijaz",
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
    tls: {
      rejectUnauthorized: config.tlsRejectUnauthorized !== false,
    },
  });
}

export async function POST(request) {
  await connectDB();

  try {
    const { to, userId, leadId, subject, body } = await request.json();

    if (!subject || !body) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 }
      );
    }

    let receiver;
    let identifier = {};

    if (userId) {
      const foundStudent = await Student.findOne({ userid: userId });
      if (!foundStudent) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }
      receiver = foundStudent.email;
      identifier.familyId = foundStudent.userid;
    } else if (leadId) {
      const foundLead = await LeadsForm.findOne({ LEAD_ID: leadId });
      if (!foundLead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      receiver = foundLead.EMAIL;
      identifier.leadId = foundLead.LEAD_ID;
    } else if (to) {
      receiver = to;

      // Look for student with this email
      const foundStudent = await Student.findOne({ email: to });
      if (foundStudent) {
        identifier.familyId = foundStudent.userid;
      } else {
        // If no student found, look for lead with this email
        const foundLead = await LeadsForm.findOne({ EMAIL: to });
        if (foundLead) {
          identifier.leadId = foundLead.LEAD_ID;
        } else {
          // If neither student nor lead found, just use the email
          identifier.receiverEmail = to;
        }
      }
    } else {
      return NextResponse.json(
        { error: "No valid recipient specified" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiver)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Generate a unique messageId for tracking
    const messageId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Create tracking pixel URL - use your actual domain in production
    const trackingPixelUrl = `https://ap.ilmulquran.com/api/email/track?messageId=${encodeURIComponent(
      messageId
    )}`;

    const bodyWithTracking = `
      <html>
        <body>
          ${body}
          <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="tracking pixel" />
        </body>
      </html>
    `;

    // Get transporter from database config
    const transporter = await getEmailTransporter();
    
    // Get sender email from config
    const emailConfig = await EmailConfig.findOne({ isActive: true }).lean();
    const senderEmail = emailConfig?.smtpUser || process.env.EMAIL_USER || "test@ilmulquran.com";

    // Send the email with tracking pixel
    let mailResponse;
    let emailSent = false;
    let emailError = null;

    try {
      mailResponse = await transporter.sendMail({
        from: senderEmail,
        to: receiver,
        subject,
        html: bodyWithTracking,
        text: body.replace(/<[^>]*>?/gm, ""),
        headers: {
          "X-Message-ID": messageId, // Custom header for tracking
        },
      });
      emailSent = true;
    } catch (error) {
      console.error("Error sending email:", error);
      emailError = error.message;
      emailSent = false;
      // Still log the failure
    }

    // Prepare email data for the database
    const emailData = {
      subject,
      body: bodyWithTracking,
      isReply: false,
      sender: senderEmail,
      receiver,
      messageId,
      opened: false,
      sent: true,
      sentAt: new Date(),
    };

    // Determine the query based on what identifiers we have
    let query;
    if (identifier.leadId) {
      query = { leadId: identifier.leadId };
    } else if (identifier.familyId) {
      query = { familyId: identifier.familyId };
    } else {
      query = {
        $or: [
          { "emails.receiver": identifier.receiverEmail },
          { to: identifier.receiverEmail },
        ],
        familyId: { $exists: false },
        leadId: { $exists: false },
      };
    }

    // Save to the Email model (for conversation history)
    if (emailSent) {
      const existingRecord = await Email.findOne(query);
      if (existingRecord) {
        await Email.findByIdAndUpdate(existingRecord._id, {
          $push: { emails: emailData },
        });
      } else {
        await Email.create({
          emails: [emailData],
          leadId: identifier.leadId || null,
          familyId: identifier.familyId || null,
          to: identifier.receiverEmail || null,
        });
      }
    }

    // ALWAYS log to EmailLog (for tracking all outgoing emails)
    await EmailLog.create({
      leadId: identifier.leadId || null,
      userId: identifier.familyId || null,
      email: receiver,
      subject,
      body: bodyWithTracking,
      type: "manual",
      status: emailSent ? "success" : "failed",
      messageId: emailSent ? (mailResponse?.messageId || messageId) : null,
      error: emailError,
      response: emailSent ? {
        accepted: mailResponse?.accepted || [],
        rejected: mailResponse?.rejected || [],
      } : null,
      sentAt: new Date(),
    });

    if (!emailSent) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send email",
          details: emailError,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email sent and logged successfully",
        messageId: mailResponse?.messageId || messageId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in email route:", error);
    return NextResponse.json(
      {
        error: "Failed to process email",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
