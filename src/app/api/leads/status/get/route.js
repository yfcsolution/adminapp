import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import LeadsStatus from "@/models/LeadsStatus";

export const GET = async () => {
  try {
    await connectDB();

    const leadsStatus = await LeadsStatus.find();

    return NextResponse.json(
      {
        data: leadsStatus,
        message: "Data fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching lead status:", error);
    return NextResponse.json(
      { message: "Failed to fetch lead status" },
      { status: 500 }
    );
  }
};
