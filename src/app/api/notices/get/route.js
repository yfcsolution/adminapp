import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Notices from "@/models/Notices";

export const POST = async (req) => {
  try {
    await connectDB();

    const { P_REL_ID, P_REL_TYPE } = await req.json();

    if (!P_REL_ID || !P_REL_TYPE) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch notices based on P_REL_ID and P_REL_TYPE
    const noticeRecord = await Notices.findOne({ P_REL_ID, P_REL_TYPE });

    if (!noticeRecord) {
      return NextResponse.json(
        { message: "No notices found", data: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Notices retrieved successfully", data: noticeRecord.Notices },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching notices:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
