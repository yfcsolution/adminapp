import { NextResponse } from "next/server";
import connectDB from "@/config/db"; // Ensure your DB connection is set up correctly
import DuplicateLeads from "@/models/DuplicateLeads";

// POST route to fetch lead data
export async function POST(request) {
  try {
    // Connect to the database
    await connectDB();

    // Parse the incoming JSON request body
    const { Lead_Id } = await request.json(); // Await the json() parsing

    if (!Lead_Id) {
      return NextResponse.json(
        { error: "Lead_Id is required" },
        { status: 400 }
      );
    }

    // Fetch leads based on Lead_Id and sort by _id in descending order (newest first)
    const leads = await DuplicateLeads.find({
      LEAD_ID: Lead_Id,
    }).sort({ _id: -1 });

    if (!leads || leads.length === 0) {
      return NextResponse.json({ data: [], total: 0 }); // Return empty data and total leads count if no leads found
    }

    // Mask the EMAIL and PHONE_NO fields
    const maskedLeads = leads.map((lead) => ({
      ...lead.toObject(),
      EMAIL: "***********",
      PHONE_NO: "***********",
    }));

    // Calculate total leads count
    const totalLeads = leads.length;

    return NextResponse.json({ data: maskedLeads, total: totalLeads }); // Send back the masked leads and total count
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Error fetching leads" },
      { status: 500 }
    ); // Return a 500 error response
  }
}
