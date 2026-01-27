import { NextResponse } from "next/server";
import { getStudentsData } from "@/controllers/authController";

export async function GET(req) {
  try {
    // Extract query parameters (page and pageSize) from the request URL
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10); // Default to page 1 if not provided
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10); // Default to 10 items per page

    // Call getStudentsData with pagination parameters
    return await getStudentsData(page, pageSize);
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { message: "An error occurred while processing the request." },
      { status: 500 }
    );
  }
}
