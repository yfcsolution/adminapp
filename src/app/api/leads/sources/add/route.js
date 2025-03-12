import { NextResponse } from "next/server";
import connectDB from "@/config/db"; // Ensure this file connects to MongoDB
import LeadsSources from "@/models/LeadsSources";
export async function POST(req) {
  await connectDB(); // Connect to the database

  try {
    const { ID, NAME } = await req.json(); // Extract request body

    // Validate required fields
    if (!ID) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    // Create a new source entry
    const newSource = await LeadsSources.create({ ID, NAME });

    return NextResponse.json(
      { success: true, data: newSource },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding source:", error);
    return NextResponse.json(
      { success: false, message: "Error adding source", error: error.message },
      { status: 500 }
    );
  }
}
