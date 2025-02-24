import { NextResponse } from "next/server";
import connectDB from "@/config/db"; // Ensure your DB connection is set up correctly
import BlogSchema from "@/models/BlogSchema"; // Path to your Blog model

// POST route to fetch a blog based on slug
export async function POST(request) {
  try {
    // Parse the incoming JSON request body
    const { slug } = await request.json();

    // Ensure the slug is provided
    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Fetch the blog by slug
    const page = await BlogSchema.findOne({ slug, isPage: true });

    // If no blog is found with the provided slug
    if (!page) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    // Send success response with the fetched blog
    return NextResponse.json({ success: true, page }, { status: 200 });
  } catch (error) {
    // Catch any errors and send a failure response
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch blog", error: error.message },
      { status: 500 }
    );
  }
}
