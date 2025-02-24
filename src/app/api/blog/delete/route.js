import { NextResponse } from "next/server";
import connectDB from "@/config/db"; // Ensure your DB connection is set up correctly
import BlogSchema from "@/models/BlogSchema"; // Path to your Blog model


// POST route for editing an existing blog
export async function POST(request) {
  try {
    // Parse the incoming form data
    const formData = await request.formData();

    // Extract form data
    const id = formData.get("id"); // Get blog ID from form data
   

    // Connect to the database
    await connectDB();

    // Find the blog by its ID
    const blog = await BlogSchema.findByIdAndDelete(id);

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog not found",
        },
        { status: 404 }
      );
    }


    // Send success response
    return NextResponse.json(
      {
        success: true,
        message: "Blog deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete blog",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
