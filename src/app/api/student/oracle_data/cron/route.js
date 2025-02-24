import axios from "axios";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import { NextResponse } from "next/server";

// Helper function to add a delay

export async function GET() {
  try {
    await connectDB(); // Connect to MongoDB

    // Fetch all students with only `userid` and `id` fields
    const students = await Student.find().select("userid id");

    if (!students || students.length === 0) {
      return NextResponse.json(
        { message: "No students found in the database." },
        { status: 404 }
      );
    }

    console.log(`Total students: ${students.length}`);

    // Iterate over all students and process each independently
    for (const student of students) {
      console.log("Processing for student:", student.userid);

      // First API: Send the POST request to class_history endpoint
      try {
        const body = {
          userid: student.userid,
          studentId: student.id,
        };

        await axios.post(
          "https://www.ilmulquran.com/api/student/oracle_data/insert/class_history",
          body
        );
        console.log(`Class history updated for student ${student.userid}`);
      } catch (error) {
        console.error(
          `Error updating class history for student ${student.userid}:`,
          error.message
        );
      }

      // Second API: Send the POST request to class_schedule endpoint
      try {
        await axios.post(
          "https://www.ilmulquran.com/api/student/oracle_data/insert/class_schedule",
          { userid: student.userid }
        );
        console.log(`Class schedule updated for student ${student.userid}`);
      } catch (error) {
        console.error(
          `Error updating class schedule for student ${student.userid}:`,
          error.message
        );
      }
      // Third API: Send the POST request to family_info endpoint
      try {
        await axios.post(
          "https://www.ilmulquran.com/api/student/oracle_data/insert/family_info",
          { userid: student.userid }
        );
        console.log(`Family Data updated for student ${student.userid}`);
      } catch (error) {
        console.error(
          `Error updating family data for student ${student.userid}:`,
          error.message
        );
      }
      // Fourth API: Send the POST request to invoice_info endpoint
      try {
        await axios.post(
          "https://www.ilmulquran.com/api/student/oracle_data/insert/invoice_info",
          { userid: student.userid }
        );
        console.log(`Invoice info updated for student ${student.userid}`);
      } catch (error) {
        console.error(
          `Error updating invoice info for student ${student.userid}:`,
          error.message
        );
      }
      // Fifth API: Send the POST request to payment history endpoint
      try {
        await axios.post(
          "https://www.ilmulquran.com/api/student/oracle_data/insert/payment_history",
          { userid: student.userid }
        );
        console.log(`Invoice info updated for student ${student.userid}`);
      } catch (error) {
        console.error(
          `Error updating invoice info for student ${student.userid}:`,
          error.message
        );
      }
    }

    return NextResponse.json(
      { message: "Cron operation completed for all students." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in cron operation:", error);
    return NextResponse.json(
      { error: "Failed to execute cron operation." },
      { status: 500 }
    );
  }
}
