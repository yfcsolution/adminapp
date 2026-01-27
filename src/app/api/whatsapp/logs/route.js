// API Route for WhatsApp Logs
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import WhatsAppLog from "@/models/WhatsAppLog";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");
    const userId = searchParams.get("userId");
    const type = searchParams.get("type"); // auto or manual
    const status = searchParams.get("status"); // success or failed
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    let query = {};

    if (leadId) {
      query.leadId = parseInt(leadId);
    }
    if (userId) {
      query.userId = parseInt(userId);
    }
    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }

    const [logs, total] = await Promise.all([
      WhatsAppLog.find(query)
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WhatsAppLog.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching WhatsApp logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
