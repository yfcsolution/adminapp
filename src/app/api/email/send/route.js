import { NextResponse } from "next/server";
import { transporter } from "@/config/nodemailer";
import Student from "@/models/Student";
import LeadsForm from "@/models/LeadsForm";
import Email from "@/models/Emails";
import connectDB from "@/config/db";

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
    let foundLead = null;
    let foundStudent = null;
    let identifier = {};

    if (userId) {
      foundStudent = await Student.findOne({ userid: userId });
      if (!foundStudent) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }
      receiver = foundStudent.email;
      identifier.familyId = foundStudent.userid;
    } else if (leadId) {
      foundLead = await LeadsForm.findOne({ LEAD_ID: leadId });
      if (!foundLead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      receiver = foundLead.EMAIL;
      identifier.leadId = foundLead.LEAD_ID;
    } else if (to) {
      receiver = to;
      identifier.receiverEmail = to;
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

    // First create email data without tracking pixel
    const emailData = {
      subject,
      body, // Will be updated with tracking pixel later
      isReply: false,
      sender: process.env.EMAIL_USER,
      receiver,
      opened: false,
    };

    let mailResponse;
    try {
      // First send email without tracking pixel to get messageId
      mailResponse = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: receiver,
        subject,
        html: body,
        text: body.replace(/<[^>]*>?/gm, ""),
      });

      // Now that we have messageId, add tracking pixel
      const trackingPixel = `<img src="http://localhost:3000/api/email/track?messageId=${encodeURIComponent(
        mailResponse.messageId
      )}" width="1" height="1" style="display:none;" />`;
      const bodyWithTracking = `${body}${trackingPixel}`;

      // Update email data with tracking pixel
      emailData.body = bodyWithTracking;
      emailData.messageId = mailResponse.messageId;
      emailData.sent = true;

      // Resend the email with tracking pixel
      mailResponse = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: receiver,
        subject,
        html: bodyWithTracking,
        text: body.replace(/<[^>]*>?/gm, ""),
      });
    } catch (sendError) {
      console.error("Error sending email:", sendError);
      emailData.messageId = `failed-${Date.now()}`;
      emailData.sent = false;
      throw sendError;
    }

    let query = {};
    if (identifier.leadId) {
      query.leadId = identifier.leadId;
    } else if (identifier.familyId) {
      query.familyId = identifier.familyId;
    } else {
      query = { "emails.receiver": identifier.receiverEmail };
    }

    try {
      const existingRecord = await Email.findOne(query);

      if (existingRecord) {
        const updateFields = {
          $push: { emails: emailData },
          $set: {},
        };

        if (identifier.leadId) {
          updateFields.$set.leadId = identifier.leadId;
        }
        if (identifier.familyId) {
          updateFields.$set.familyId = identifier.familyId;
        }

        await Email.findOneAndUpdate({ _id: existingRecord._id }, updateFields);
      } else {
        const newRecordData = {
          emails: [emailData],
          leadId: identifier.leadId || null,
          familyId: identifier.familyId || null,
          to: identifier.receiverEmail || null,
        };

        if (to) {
          newRecordData.to = to;
        }

        await Email.create(newRecordData);
      }

      if (mailResponse) {
        return NextResponse.json(
          {
            success: true,
            message: "Email sent and logged successfully",
            messageId: mailResponse.messageId,
          },
          { status: 200 }
        );
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save email record");
    }
  } catch (error) {
    console.error("Error in email route:", error);

    let fallbackReceiver = "unknown@example.com";
    let subject = "Failed to send";
    let body = "N/A";

    try {
      const parsedBody = await request.json();
      fallbackReceiver = parsedBody.to || fallbackReceiver;
      subject = parsedBody.subject || subject;
      body = parsedBody.body || body;
    } catch (_) {}

    const emailData = {
      subject,
      body,
      isReply: false,
      sender: process.env.EMAIL_USER,
      receiver: fallbackReceiver,
      messageId: `failed-${Date.now()}`,
      opened: false,
      sent: false,
    };

    try {
      await Email.create({ emails: [emailData] });
    } catch (saveError) {
      console.error("Failed to save error record:", saveError);
    }

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

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
