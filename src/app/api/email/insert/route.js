import { NextResponse } from "next/server";
import { startEmailListener } from "@/lib/emailListener";
import Student from "@/models/Student";
import Email from "@/models/Emails";
import LeadsForm from "@/models/LeadsForm";

export async function GET() {
  console.log("[EMAIL API] Starting real-time email listener");

  try {
    startEmailListener(async (email) => {
      try {
        // 1. Extract and clean the FROM and TO email addresses
        const fromEmail = extractEmailAddress(email.from);
        const toEmail = extractEmailAddress(email.to);

        // 2. Clean the body before storing
        const cleanedBody = cleanEmailBody(email.body);

        // 3. Find the student by cleaned email
        let student = await Student.findOne({ email: fromEmail });
        let familyId = student?.userid || null;
        let leadId = null;

        // 4. If student is not found, search for lead in LeadsForm
        if (!student) {
          console.log("[INFO] Student not found, searching for lead...");
          const lead = await LeadsForm.findOne({
            EMAIL: fromEmail,
          });

          if (lead) {
            leadId = lead.LEAD_ID;
            console.log("Lead ID found:", leadId);
            familyId = null;

            // Check if the lead already exists in the Email collection
            const existingEmailDoc = await Email.findOne({ leadId });

            if (existingEmailDoc) {
              console.log(
                "Existing lead found in Emails collection, updating..."
              );
              await Email.findOneAndUpdate(
                { leadId },
                {
                  $push: {
                    emails: createEmailData(
                      email,
                      cleanedBody,
                      fromEmail,
                      toEmail
                    ),
                  },
                },
                { new: true }
              );
            } else {
              console.log("Creating new email document for lead...");
              await Email.create({
                from: fromEmail,
                to: toEmail,
                leadId,
                emails: [
                  createEmailData(email, cleanedBody, fromEmail, toEmail),
                ],
              });
            }

            console.log(`[EMAIL LISTENER] Email stored for lead ${leadId}`);
            return;
          } else {
            console.log("[INFO] Lead not found, skipping...");
            return;
          }
        }

        // 5. Prepare email data for students
        const emailData = createEmailData(
          email,
          cleanedBody,
          fromEmail,
          toEmail
        );

        // 6. Find or create the Email document for students
        await Email.findOneAndUpdate(
          { from: fromEmail },
          {
            $set: { leadId, familyId },
            $push: { emails: emailData },
          },
          { upsert: true, new: true }
        );

        console.log(`[EMAIL LISTENER] Email stored for student ${fromEmail}`);
      } catch (err) {
        console.error("[EMAIL LISTENER] Error saving email:", err);
      }
    });

    return NextResponse.json(
      { message: "Email listener started" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[EMAIL API] Error starting listener:", err);
    return NextResponse.json(
      { error: "Failed to start email listener" },
      { status: 500 }
    );
  }
}

// Helper function to extract clean email address
function extractEmailAddress(emailField) {
  // Extract the actual email address from formats like "Ijaz Wakeel <ijazwakeel.dev@gmail.com>"
  const match = emailField.match(/<([^>]+)>/);
  if (match && match[1]) {
    return match[1].toLowerCase().trim();
  }
  // If no name is present, return the email directly
  return emailField.toLowerCase().trim();
}

// Helper function to check if the email is a reply
function checkIfReply(subject, body) {
  const lowerSubject = subject.toLowerCase();
  const lowerBody = body.toLowerCase();
  return (
    lowerSubject.startsWith("re:") ||
    lowerBody.includes("original message") ||
    lowerBody.includes("on wrote:")
  );
}

// Helper function to clean the email body
function cleanEmailBody(body) {
  // Remove boundary markers and extra headers
  return body
    .replace(/--[a-zA-Z0-9]+(\r?\n)?/g, "")
    .replace(/\r?\n/g, "\n") // Normalize line breaks
    .trim();
}

// Helper function to create email data
function createEmailData(email, cleanedBody, fromEmail, toEmail) {
  return {
    subject: email.subject,
    body: cleanedBody,
    isReply: checkIfReply(email.subject, cleanedBody),
    sender: fromEmail,
    receiver: toEmail,
    messageId: email.messageId,
    opened: false,
    openedAt: "",
    sent: true,
  };
}
