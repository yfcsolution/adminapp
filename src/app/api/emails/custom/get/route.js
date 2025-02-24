import connectDB from "@/config/db";
import Email from "@/models/EmailSchema";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Connect to the database
    await connectDB();

    // Fetch all emails from the database
    const emails = await Email.find(); // You can modify this query to filter based on parameters if needed

    // Check if emails were found
    if (emails.length === 0) {
      return NextResponse.json(
        { message: "No email records found" },
        { status: 404 }
      );
    }

    // Return the emails in the response
    return NextResponse.json(
      { emails },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error occurred:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch emails", details: error.message },
      { status: 500 }
    );
  }
}
