import axios from "axios";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { _id } = await request.json(); // Get student data from request body

    if (!_id) {
      return NextResponse.json(
        { message: "Missing _id in request body." },
        { status: 400 }
      );
    }

    await connectDB(); // Connect to MongoDB

    // Fetch the student by id
    const student = await Student.findById(_id);

    if (!student) {
      return NextResponse.json(
        { message: "Student not found in the database." },
        { status: 404 }
      );
    }

    // Return student data if found
    return NextResponse.json(
      { message: "Student found successfully.", student },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "An error occurred while fetching the student data." },
      { status: 500 }
    );
  }
}
