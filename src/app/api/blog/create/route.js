import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import connectDB from "@/config/db"; // Make sure your DB connection is set up correctly
import BlogSchema from "@/models/BlogSchema"; // Path to your Blog model

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dqg91j1eb",
  api_key: "314791842446172",
  api_secret: "6d9Adg6Ou7urU15IYJEfhnQvLfo",
});

// POST route for creating a new blog
export async function POST(request) {
  try {
    // Parse the incoming form data instead of JSON
    const formData = await request.formData();

    // Extract form data
    const title = formData.get("title");
    const slug = formData.get("slug");
    const image = formData.get("image"); // image should be a file object
    const image_alt_text = formData.get("image_alt_text");
    const video = formData.get("video");
    const video_position = formData.get("video_position");
    const category = formData.get("category");
    const author = formData.get("author");
    const content = formData.get("content");
    const isPage = formData.get("isPage");
    // New fields for meta_description, meta_keywords, and tags
    const meta_description = formData.get("meta_description");
    const meta_keywords = JSON.parse(formData.get("meta_keywords") || "[]"); // Parse JSON string
    const tags = JSON.parse(formData.get("tags") || "[]"); // Parse JSON string
    // Connect to the database
    await connectDB();

    // Upload image to Cloudinary if image is provided
    let imageUrl = "";
    if (image) {
      const uploadedImage = await cloudinary.v2.uploader.upload(image, {
        folder: "blogs", // Optionally, specify a folder in Cloudinary
      });
      imageUrl = uploadedImage.secure_url; // Get the secure URL of the uploaded image
    }

    // Create a new blog document
    const newBlog = new BlogSchema({
      title,
      slug,
      image: imageUrl,
      image_alt_text,
      video,
      video_position,
      category,
      author,
      content,
      isPage,
      meta_description, // Add meta_description to schema
      meta_keywords, // Add meta_keywords to schema
      tags, // Add tags to schema
    });

    // Save the blog to the database
    const savedBlog = await newBlog.save();

    // Send success response
    return NextResponse.json(
      { success: true, message: "Blog created successfully", blog: savedBlog },
      { status: 201 }
    );
  } catch (error) {
    // Catch any errors and send a failure response
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create blog",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
