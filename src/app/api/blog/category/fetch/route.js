import { NextResponse } from 'next/server';
import connectDB from '@/config/db'; // Ensure your DB connection is set up correctly
import BlogCategorySchema from '@/models/BlogCategorySchema'; // Ensure you're using the correct schema

// GET route for fetching blog categories
export async function GET(request) {
  try {
    // Connect to the database
    await connectDB();

    // Fetch all blog categories from the database
    const categories = await BlogCategorySchema.find();

    // Check if categories are found
    if (categories.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No categories found' },
        { status: 404 }
      );
    }

    // Send success response with categories
    return NextResponse.json(
      { success: true, categories },
      { status: 200 }
    );
  } catch (error) {
    // Catch any errors and send a failure response
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories', error: error.message },
      { status: 500 }
    );
  }
}
