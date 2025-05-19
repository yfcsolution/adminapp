import { NextResponse } from "next/server";
import Email from "@/models/Emails";
import connectDB from "@/config/db";

export const POST = async (request) => {
  await connectDB();

  try {
    const { leadId, sent, received } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    // Build the query based on the parameters
    let query = { leadId };
    let projection = {};

    if (sent) {
      query["emails.sent"] = true;
      projection.emails = { $elemMatch: { sent: true } };
    } else if (received) {
      query["emails.received"] = true;
      projection.emails = { $elemMatch: { received: true } };
    }

    // Fetch emails based on the query
    const emails = await Email.find(query, projection).sort({
      "emails.createdAt": -1,
    });

    if (!emails.length) {
      return NextResponse.json(
        { message: "No emails found for this lead" },
        { status: 404 }
      );
    }

    // Flatten the emails array for easier processing on the frontend
    const flattenedEmails = emails.flatMap((emailDoc) => emailDoc.emails);

    return NextResponse.json({ emails: flattenedEmails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
