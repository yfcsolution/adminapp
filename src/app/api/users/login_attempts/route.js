import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import AdminLoginAttempt from "@/models/AdminLoginAttemptSchema";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    // Get query parameters for pagination
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get total number of documents
    const total = await AdminLoginAttempt.countDocuments();

    // Fetch login attempts sorted by loginTime descending with pagination
    const loginAttempts = await AdminLoginAttempt.find()
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate("adminId", "name email");

    return NextResponse.json(
      {
        message: "Data fetched successfully",
        data: loginAttempts,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching login attempts:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
