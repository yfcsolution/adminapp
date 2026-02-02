import { NextResponse } from "next/server";
import connectDB from "@/config/db"; // Ensure your DB connection is set up correctly
import DuplicateLeads from "@/models/DuplicateLeads";

// POST route to fetch lead data
export async function POST(request) {
  try {
    // Connect to the database
    await connectDB();
    // Parse the incoming JSON request body
    const { Lead_Id, Email, Phone } = await request.json(); // Support multiple search criteria

    if (!Lead_Id && !Email && !Phone) {
      return NextResponse.json(
        { error: "At least one search parameter (Lead_Id, Email, or Phone) is required" },
        { status: 400 }
      );
    }

    // Build query - if Lead_Id is provided, use it; otherwise use Email or Phone
    const query = {};
    if (Lead_Id) {
      // If Lead_Id is provided, fetch duplicates for that specific lead ID
      query.LEAD_ID = Lead_Id;
    } else {
      // If Email or Phone is provided (from main lead), find duplicates matching those
      const $or = [];
      if (Email) {
        $or.push({ EMAIL: Email });
      }
      if (Phone) {
        $or.push({ PHONE_NO: Phone });
      }
      if ($or.length > 0) {
        query.$or = $or;
      }
    }

    // Fetch leads based on query and sort by _id in descending order (newest first)
    const leads = await DuplicateLeads.find(query).sort({ _id: -1 });

    if (!leads || leads.length === 0) {
      return NextResponse.json({ data: [], total: 0 }); // Return empty data and total leads count if no leads found
    }

    // Return actual data (not masked) for admin view
    const leadsData = leads.map((lead) => lead.toObject());

    // Calculate total leads count
    const totalLeads = leads.length;

    return NextResponse.json({ 
      success: true,
      data: leadsData, 
      total: totalLeads 
    }); // Send back the leads and total count
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Error fetching leads" },
      { status: 500 }
    ); // Return a 500 error response
  }
}
