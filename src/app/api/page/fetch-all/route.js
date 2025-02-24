import { NextResponse } from "next/server";
import connectDB from "@/config/db"; // Ensure your DB connection is set up correctly
import BlogSchema from "@/models/BlogSchema"; // Path to your Blog model

// GET route to fetch blog data
export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();

    // Fetch all blogs from the database
    const blogs = await BlogSchema.find({ isPage: true }).sort({
      createdAt: -1,
    });

    // Send success response with fetched blogs
    return NextResponse.json({ success: true, blogs }, { status: 200 });
  } catch (error) {
    // Catch any errors and send a failure response
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch blogs",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
