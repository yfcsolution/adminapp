import LeadsForm from "@/models/LeadsForm";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import Email from "@/models/EmailSchema";
import { NextResponse } from "next/server";
import { transporter } from "@/config/smtp";

export async function POST(req) {
  try {
    // Connect to the database
    await connectDB();

    // Parse the request body
    const body = await req.json();
    const { leadId, familyId, subject, mail } = body;

    if (!mail || !subject) {
      return NextResponse.json(
        { error: "Subject or Mail content is missing" },
        { status: 400 }
      );
    }

    let email;

    // Fetch email based on leadId or familyId
    if (familyId) {
      const student = await Student.findOne({ userid: familyId });
      if (student) {
        email = student.email;
        console.log("Email from student is:", email);
      } else {
        return NextResponse.json(
          { error: "No student found with the provided familyId" },
          { status: 404 }
        );
      }
    } else if (leadId) {
      const lead = await LeadsForm.findOne({ LEAD_ID: leadId });
      if (lead) {
        email = lead.EMAIL;
        console.log("Email from lead is:", email);
      } else {
        return NextResponse.json(
          { error: "No lead found with the provided leadId" },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Either leadId or familyId must be provided" },
        { status: 400 }
      );
    }

    // Email options for sending confirmation
    const mailOptions = {
      from: `"Test Sender" <${process.env.SMTP_USER}>`, // Use env variable
      to: email,
      subject,
      text: mail,
    };

    // Send the email
    const response = await transporter.sendMail(mailOptions);
    console.log("Email response:", response);

    // Ensure email was sent successfully
    if (response.accepted.length === 0) {
      return NextResponse.json(
        { error: "Email was not sent successfully" },
        { status: 500 }
      );
    }

    // Store email details in the database
    const filter = { leadId: leadId || null, familyId: familyId || null };
    const update = {
      $push: {
        emails: {
          subject,
          text: mail,
          sender: response.envelope.from,
          receiver: response.envelope.to[0],
        },
      },
    };
    const options = { upsert: true, new: true };

    let emailEntry = await Email.findOne(filter);
    if (!emailEntry) {
      emailEntry = await Email.create({
        leadId: leadId || null,
        familyId: familyId || null,
        emails: [
          {
            subject,
            text: mail,
            sender: response.envelope.from,
            receiver: response.envelope.to[0],
          },
        ],
      });
    } else {
      emailEntry = await Email.findOneAndUpdate(filter, update, options);
    }

    console.log("Email entry updated in database:", emailEntry);

    return NextResponse.json(
      { message: "Email sent and stored successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
