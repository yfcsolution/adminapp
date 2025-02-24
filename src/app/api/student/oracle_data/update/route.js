import axios from "axios";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { id, userid } = await request.json(); // Get student data from request body

    if (!id || !userid) {
      return NextResponse.json(
        { message: "Missing id or userid in request body." },
        { status: 400 }
      );
    }

    await connectDB(); // Connect to MongoDB

    // Fetch the student by id and userid
    const student = await Student.findOne({ id, userid });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found in the database." },
        { status: 404 }
      );
    }

    console.log("Processing for student:", student.userid);

    // Base URL for the API
    const baseUrl = "https://www.ilmulquran.com";

    // API Endpoints
    const endpoints = [
      {
        path: "/api/student/oracle_data/insert/class_history",
        body: { userid: student.userid, studentId: student.id },
      },
      {
        path: "/api/student/oracle_data/insert/class_schedule",
        body: { userid: student.userid },
      },
      {
        path: "/api/student/oracle_data/insert/family_info",
        body: { userid: student.userid },
      },
      {
        path: "/api/student/oracle_data/insert/invoice_info",
        body: { userid: student.userid },
      },
      {
        path: "/api/student/oracle_data/insert/payment_history",
        body: { userid: student.userid },
      },
    ];

    // Process all endpoints
    for (const { path, body } of endpoints) {
      try {
        await axios.post(`${baseUrl}${path}`, body);
        console.log(
          `Successfully updated for endpoint ${path} and student ${student.userid}`
        );
      } catch (error) {
        console.error(
          `Error updating ${path} for student ${student.userid}:`,
          error.message
        );
      }
    }

    return NextResponse.json(
      { message: `Processing completed for student ${student.userid}.` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing student:", error);
    return NextResponse.json(
      { error: "Failed to process the student." },
      { status: 500 }
    );
  }
}
