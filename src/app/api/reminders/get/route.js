import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Reminders from "@/models/Reminders";
// Fetch reminders based on lead ID and type
export const POST = async (req) => {
  try {
    await connectDB();

    const { P_REL_ID, P_REL_TYPE } = await req.json();

    if (!P_REL_ID || !P_REL_TYPE) {
      return NextResponse.json(
        { error: "Missing required fields: P_REL_ID and P_REL_TYPE" },
        { status: 400 }
      );
    }

    // Find reminders based on lead ID and type
    const existingReminders = await Reminders.findOne({ P_REL_ID, P_REL_TYPE });

    if (!existingReminders || !existingReminders.Reminders.length) {
      return NextResponse.json(
        { message: "No reminders found", reminders: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Reminders fetched successfully",
        reminders: existingReminders.Reminders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
