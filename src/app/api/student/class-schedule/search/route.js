import axios from "axios";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB(); // Connect to MongoDB

    // Extract the userId from query parameters (assuming it's passed in the URL)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "UserId is required to filter the data." },
        { status: 400 }
      );
    }

    // Fetch the student class schedule for a specific userId
    const students = await Student.find({ userid: userId })
      .select("class_schedule -_id") // Select only the class_schedule field and exclude _id
      .limit(200);

    if (!students || students.length === 0) {
      return NextResponse.json(
        { message: "No data found for the given userId" },
        { status: 404 }
      );
    }

    // Return student data if found
    return NextResponse.json(
      { message: "Student class schedule found successfully.", students },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the class schedule data." },
      { status: 500 }
    );
  }
}
