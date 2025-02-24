import { NextResponse } from "next/server";
import LeadsForm from "@/models/LeadsForm";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1; // Default to page 1 if not provided
    const limit = parseInt(url.searchParams.get("limit")) || 10; // Default to 10 leads per page

    const skip = (page - 1) * limit; // Calculate the number of documents to skip

    // Fetch the leads with pagination
    const leads = await LeadsForm.find()
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });

    // Get the total count of leads for pagination info
    const totalLeads = await LeadsForm.countDocuments();

    if (leads.length === 0) {
      return NextResponse.json({ message: "No leads found" }, { status: 404 });
    }

    // Send response with leads and pagination information
    return NextResponse.json({
      leads,
      totalLeads,
      currentPage: page,
      totalPages: Math.ceil(totalLeads / limit),
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { message: "Error searching the database" },
      { status: 500 }
    );
  }
}
