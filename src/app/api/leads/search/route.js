import { NextResponse } from "next/server"; 
import LeadsForm from "@/models/LeadsForm"; 
 
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
    if (field === "LEAD_ID" || field === "REQUEST_FORM") {
      // For LEAD_ID and REQUEST_FORM, we will match exact numbers
      searchQuery = { [field]: Number(query) }; // Convert query to a number for LEAD_ID and REQUEST_FORM
    } else if (
      field === "FULL_NAME" ||
      field === "EMAIL" ||
      field === "PHONE_NO" ||
      field === "COUNTRY" ||
      field === "STATE" ||
      field === "LEAD_IP"
    ) {
      // For text-based fields, use $regex for case-insensitive partial matching
      searchQuery = {
        [field]: { $regex: query, $options: "i" } // i = case-insensitive search
      };
    } else {
      return NextResponse.json({ message: "Invalid field" }, { status: 400 });
    }

    // Find the leads based on the search query
    const leads = await LeadsForm.find(searchQuery);

    // If no leads are found
    if (leads.length === 0) {
      return NextResponse.json({ message: "No leads found" }, { status: 404 });
    }

    // Return the found leads
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error searching leads:", error);
    return NextResponse.json(
      { message: "Error searching the database" },
      { status: 500 }
    );
  }
}
