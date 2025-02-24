import LeadsForm from "@/models/LeadsForm";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import Email from "@/models/EmailSchema";
import { NextResponse } from "next/server";
import { transporter } from "@/config/nodemailer";

export async function POST(req) {
  try {
    // Connect to the database
    await connectDB();

    // Parse the request body
    const body = await req.json();
    const { _id, subject, mail } = body;

    if (!_id) {
      return NextResponse.json(
        { error: "_id is missing" },

        { status: 400 }
      );
    }

    let email;

    // Fetch email based on leadId or familyId
    if (_id) {
      const conversation = await Email.findById(_id);
      if (conversation) {
        const emails = conversation.emails;
        const lastEmail = [...emails]
          .reverse()
          .find(
            (email) => email.isReply === false || email.isReply === undefined
          );

        if (lastEmail) {
          email = lastEmail.sender; // Replace with the actual sender value
        }
      } else {
        return NextResponse.json(
          { error: "No conversation found with the provided _id" },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "_id must be provided" },
        { status: 400 }
      );
    }

    // Email options for sending confirmation
    const mailOptions = {
      from: "admin@ilmulquran.com",
      to: email,
      subject,
      text: mail,
    };

    // Send the email
    const response = await transporter.sendMail(mailOptions);
    console.log("Response I got is:", response);

    // Ensure response has valid recipients
    const recipient = response.envelope?.to?.[0];
    if (!recipient) {
      return NextResponse.json(
        { error: "Email was not sent successfully" },
        { status: 500 }
      );
    }

    // Store email details in the database
    const filter = {
      _id,
    };

    const update = {
      $push: {
        emails: {
          subject,
          text: mail,
          sender: response.envelope.from,
          receiver: recipient,
        },
      },
    };

    const options = { upsert: true, new: true };

    // Check if an existing entry exists
    let emailEntry = await Email.findOne(filter);
    if (emailEntry) {
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
