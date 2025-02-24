import { NextResponse } from 'next/server';
import connectDB from '@/config/db'; // Ensure your DB connection is set up correctly
import BlogCategorySchema from '@/models/BlogCategorySchema'; // Ensure you're using the correct schema

// POST route for creating a new blog category
export async function POST(request) {
  try {
    // Parse the incoming JSON data
    const { category } = await request.json(); // Assumes category is passed as JSON

    // Check if the category is provided
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectDB();

    // Create a new blog category document
    const newBlogCategory = new BlogCategorySchema({
      category,
    });

    // Save the blog category to the database
    const savedBlogCategory = await newBlogCategory.save();

    // Send success response
    return NextResponse.json(
      { success: true, message: 'Blog Category added successfully', category: savedBlogCategory },
      { status: 201 }
    );
  } catch (error) {
    // Catch any errors and send a failure response
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Failed to create category', error: error.message },
      { status: 500 }
    );
  }
}
