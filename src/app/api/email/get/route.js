import { NextResponse } from "next/server";
import Email from "@/models/Emails";
import connectDB from "@/config/db";

export const POST = async (request) => {
  await connectDB();

  try {
    const { leadId, sent, received, page = 1, limit = 20 } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

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

    // Fetch emails based on the query with pagination
    const emailDocs = await Email.find(query, projection)
      .sort({ "emails.createdAt": -1 })
      .lean();

    if (!emailDocs.length) {
      return NextResponse.json(
        { 
          emails: [],
          pagination: { page, limit, total: 0, pages: 0 }
        },
        { status: 200 }
      );
    }

    // Flatten the emails array for easier processing on the frontend
    const allEmails = emailDocs.flatMap((emailDoc) => emailDoc.emails || []);
    
    // Sort by date (newest first)
    allEmails.sort((a, b) => 
      new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt)
    );
    
    // Apply pagination
    const total = allEmails.length;
    const pages = Math.ceil(total / limit);
    const paginatedEmails = allEmails.slice(skip, skip + limit);

    return NextResponse.json({ 
      emails: paginatedEmails,
      pagination: {
        page,
        limit,
        total,
        pages,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
};
