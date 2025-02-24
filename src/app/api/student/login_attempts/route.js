import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import StudentLoginAttempt from "@/models/StudentLoginAttemptSchema";
import Student from "@/models/Student";

export const GET = async (req) => {
  try {
    await connectDB();

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get total number of documents
    const total = await StudentLoginAttempt.countDocuments();

    // Fetch paginated login attempts
    const loginInfo = await StudentLoginAttempt.find()
      .sort({ loginTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate("studentId", "userid firstname lastname email");

    return NextResponse.json(
      {
        message: "Data fetched successfully",
        data: loginInfo,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching student login attempts:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
};
