import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import EmailLog from "@/models/EmailLog";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 50;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const leadId = searchParams.get("leadId");
    const userId = searchParams.get("userId");

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (leadId) query.leadId = parseInt(leadId);
    if (userId) query.userId = parseInt(userId);

    // Fetch logs with pagination
    const [logs, total] = await Promise.all([
      EmailLog.find(query)
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      EmailLog.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });
  } catch (error) {
    console.error("Error fetching email logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
