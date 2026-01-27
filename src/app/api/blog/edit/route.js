import { NextResponse } from "next/server";
import cloudinary from "cloudinary";
import connectDB from "@/config/db"; // Ensure your DB connection is set up correctly
import BlogSchema from "@/models/BlogSchema"; // Path to your Blog model
import { Readable } from "stream"; // To convert file to readable stream
// Configure Cloudinary
cloudinary.config({
  cloud_name: "dqg91j1eb",
  api_key: process.env.BLOG_API_KEY || "",
  api_secret: process.env.BLOG_API_SECRET || "",
});

// POST route for editing an existing blog
export async function POST(request) {
  try {
    // Parse the incoming form data
    const formData = await request.formData();

    // Extract form data
    const id = formData.get("id"); // Get blog ID from form data
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
    const meta_description = formData.get("meta_description");
    const meta_keywords = JSON.parse(formData.get("meta_keywords") || "[]"); // Parse JSON string
    const tags = JSON.parse(formData.get("tags") || "[]");

    // Connect to the database
    await connectDB();

    // Find the blog by its ID
    const blog = await BlogSchema.findById(id);

    if (!blog) {
      return NextResponse.json(
        {
          success: false,
          message: "Blog not found",
        },
        { status: 404 }
      );
    }

    // Upload image to Cloudinary if new image is provided
    let imageUrl = blog.image; // Default to the existing image URL
    if (image && typeof image.arrayBuffer === "function") {
      const imageBuffer = await image.arrayBuffer(); // Convert the file to buffer
      const readableImageStream = Readable.from(Buffer.from(imageBuffer)); // Convert buffer to stream

      // Create a Promise for the Cloudinary upload
      const uploadedImage = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { folder: "blogs" },
          (error, result) => {
            if (error) {
              reject(
                new Error("Error uploading to Cloudinary: " + error.message)
              );
            }
            resolve(result);
          }
        );

        readableImageStream.pipe(uploadStream); // Pipe the stream to Cloudinary upload
      });

      imageUrl = uploadedImage?.secure_url; // Get the secure URL of the uploaded image
    }

    // Update the blog document with the new data
    blog.title = title || blog.title;
    blog.slug = slug || blog.slug;
    blog.image = imageUrl;
    blog.image_alt_text = image_alt_text || blog.image_alt_text;
    blog.video = video || blog.video;
    blog.video_position = video_position || blog.video_position;
    blog.category = category || blog.category;
    blog.author = author || blog.author;
    blog.content = content || blog.content;
    blog.isPage = isPage || blog.isPage;
    blog.meta_description = meta_description || blog.meta_description;
    blog.meta_keywords = meta_keywords || blog.meta_keywords;
    blog.tags = tags || blog.tags;

    // Save the updated blog to the database
    const updatedBlog = await blog.save();

    // Send success response
    return NextResponse.json(
      {
        success: true,
        message: "Blog updated successfully",
        blog: updatedBlog,
      },
      { status: 200 }
    );
  } catch (error) {
    // Catch any errors and send a failure response
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update blog",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
