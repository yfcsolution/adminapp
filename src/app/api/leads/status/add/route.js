import { NextResponse } from "next/server";
import LeadsStatus from "@/models/LeadsStatus"; // Ensure correct path
import connectDB from "@/config/db";

export async function POST(req) {
  try {
    await connectDB();
    const { ID, NAME, STATUSORDER, COLOR, ISDEFAULT, CREATE_BY, UPDATED_BY } =
      await req.json();

    // Validate required fields
    if (!ID || !NAME) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if a lead status with the same ID already exists
    const existingStatus = await LeadsStatus.findOne({ ID });
    if (existingStatus) {
      return NextResponse.json(
        {
          success: false,
          message: "A lead status with this ID already exists",
        },
        { status: 400 }
      );
    }

    // Create a new lead status
    const newLeadStatus = new LeadsStatus({
      ID,
      NAME,
      STATUSORDER,
      COLOR,
      ISDEFAULT: ISDEFAULT || false, // Default to false if not provided
      CREATE_BY,
      CREATED_DATE: new Date(), // Automatically set the creation date
      UPDATED_BY,
      UPDATED_DATE: UPDATED_BY ? new Date() : null, // Set updated date only if UPDATED_BY is provided
    });

    // Save to database
    await newLeadStatus.save();

    return NextResponse.json(
      {
        success: true,
        message: "Lead status added successfully",
        data: newLeadStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding lead status:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
