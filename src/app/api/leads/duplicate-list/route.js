import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import DuplicateLeads from "@/models/DuplicateLeads";

export async function POST(request) {
  try {
    await connectDB();
    const { page = 1, pageSize = 10, sortField = "updatedAt" } = await request.json();

    const skip = (page - 1) * pageSize;

    // Build sort object
    const sortObj = {};
    if (sortField === "createdAt" || sortField === "updatedAt") {
      sortObj[sortField] = -1; // Descending order
    } else {
      sortObj[sortField] = 1; // Ascending order
    }

    // Fetch duplicate leads with pagination and sorting
    const leads = await DuplicateLeads.find({})
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Get total count
    const total = await DuplicateLeads.countDocuments({});

    return NextResponse.json({
      success: true,
      data: leads,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching duplicate leads:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching duplicate leads",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
