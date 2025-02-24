import { NextResponse } from "next/server";
import Student from "@/models/Student"; // Assuming you're using Student model now

export async function GET(req) {
  try {
    // Extract query parameters for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;

    // Calculate the skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch the students with pagination
    const students = await Student.find()
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });

    // Count the total number of students for pagination calculation
    const totalStudents = await Student.countDocuments();

    // If no students are found
    if (students.length === 0) {
      return NextResponse.json(
        { message: "No results found" },
        { status: 404 }
      );
    }

    // Return the found students along with pagination info
    return NextResponse.json({
      students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalStudents / limit),
        totalStudents,
      },
    });
  } catch (error) {
    console.error("Error searching students:", error);
    // Return a generic error response
    return NextResponse.json(
      { message: "Error searching the database" },
      { status: 500 }
    );
  }
}
