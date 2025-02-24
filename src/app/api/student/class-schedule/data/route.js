import axios from "axios";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB(); // Connect to MongoDB

    // Fetch the student by id
    const students = await Student.find()
      .select("class_schedule -_id")
      .limit(200
      );

    if (!students) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    // Return student data if found
    return NextResponse.json(
      { message: "Student found successfully.", students },
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
