import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Notes from "@/models/Notes";

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

    // Fetch Notes based on P_REL_ID and P_REL_TYPE
    const NoteRecord = await Notes.findOne({ P_REL_ID, P_REL_TYPE });

    if (!NoteRecord) {
      return NextResponse.json(
        { message: "No Notes found", data: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Notes retrieved successfully",
        data: NoteRecord.Notes.reverse(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching Notes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
