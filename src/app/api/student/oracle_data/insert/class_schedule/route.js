import axios from "axios";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB(); // Connect to MongoDB
    const body = await req.json(); // Parse the request body
    const { userid } = body;

    // Fetch data from the external API
    const response = await axios.get(
      `${ERP_BASE_URL}/yfc_erp/classschedule/getdata/?P_USER_ID=${userid}`
    );

    const data = response.data.items; // Ensure this path is correct based on the API response structure
    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: "No class schedule data found in API response." },
        { status: 404 }
      );
    }

    console.log("Fetched Data:", data); // Log fetched data for debugging

    // Use bulk insertion by replacing the entire class_schedule array
    const result = await Student.updateOne(
      { userid }, // Match student by userid
      { $set: { class_schedule: data } } // Replace class_schedule with new data
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Class schedule updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating class schedule:", error);
    return NextResponse.json(
      { error: "Failed to update class schedule." },
      { status: 500 }
    );
  }
}
