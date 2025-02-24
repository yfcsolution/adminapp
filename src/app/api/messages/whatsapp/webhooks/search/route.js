import { NextResponse } from "next/server";
import Webhook from "@/models/whatsappWebhookSchema";

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

    console.log("the field and query", query,field);
    

    let searchQuery;

    // Build the search query using regular expressions for progressive search
    if (
      field === "leadId" ||
      field === "conversationId" ||
      field === "familyId"
    ) {
      // For LEAD_ID, conversationId, and familyId, we will match exact values
      searchQuery = { [field]: Number(query) }; // Convert query to a number for ID-based fields
    } else if (field === "sender") {
      // For text-based fields like sender, use $regex for case-insensitive partial matching
      searchQuery = {
        [field]: { $regex: query, $options: "i" }, // i = case-insensitive search
      };
    } else {
      // Invalid field check
      return NextResponse.json({ message: "Invalid field" }, { status: 400 });
    }

    // Find the conversations based on the search query
    const conversations = await Webhook.find(searchQuery);

    // If no conversations are found
    if (conversations.length === 0) {
      return NextResponse.json({ message: "No conversation found" }, { status: 404 });
    }

    // Return the found conversations
    return NextResponse.json({ conversations });

  } catch (error) {
    console.error("Error searching conversations:", error); // Log actual error for debugging
    return NextResponse.json(
      { message: "Error searching the database", error: error.message },
      { status: 500 }
    );
  }
}
