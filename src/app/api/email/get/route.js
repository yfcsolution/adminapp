import { NextResponse } from "next/server";
import Email from "@/models/Emails";
import connectDB from "@/config/db";


export const POST = async (request) => {
  await connectDB();

  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const emails = await Email.find({ leadId }).sort({ createdAt: -1 });

    if (!emails || emails.length === 0) {
      return NextResponse.json(
        { message: "No emails found for this lead" },
        { status: 404 }
      );
    }

    return NextResponse.json({ emails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};