import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import LeadsSources from "@/models/LeadsSources"; // Ensure this matches your schema file

export async function GET() {
  await connectDB();
  try {
    // Fetch all sources from the database
    const sources = await LeadsSources.find();
    return NextResponse.json(
      {
        success: true,
        data: sources,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching sources",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
