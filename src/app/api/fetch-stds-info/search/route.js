import { NextResponse } from "next/server";
import Student from "@/models/Student"; // Assuming you're using Student model now

export async function GET(request) {
  try {
    // Extract query parameters from the URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const field = searchParams.get("field");

    // Check if query and field are provided
    if (!query || !field) {
      return NextResponse.json(
        { message: "Query and field are required" },
        { status: 400 }
      );
    }

    let searchQuery;

    // Build the search query using regular expressions for progressive search
    // For text-based fields, use $regex for partial matching
    if (field === "id" || field === "userid") {
      // For numeric fields like id and userid, match exactly
      searchQuery = { [field]: Number(query) }; // Convert query to a number for id and userid
    } else if (
      field === "firstname" ||
      field === "lastname" ||
      field === "email" ||
      field === "phonenumber"
    ) {
      // For text-based fields, use $regex for case-insensitive partial matching
      searchQuery = {
        [field]: { $regex: query, $options: "i" }, // i = case-insensitive search
      };
    } else {
      return NextResponse.json({ message: "Invalid field" }, { status: 400 });
    }

    // Find the leads based on the search query
    const students = await Student.find(searchQuery); // Assuming you're using the Student model now

    // If no students are found
    if (students.length === 0) {
      return NextResponse.json(
        { message: "No results found" },
        { status: 404 }
      );
    }

    // Return the found students
    return NextResponse.json({ students });
  } catch (error) {
    console.error("Error searching students:", error);
    return NextResponse.json(
      { message: "Error searching the database" },
      { status: 500 }
    );
  }
}
