// app/api/validate-secret-code/route.js

import { NextResponse } from "next/server"; // Import NextResponse
import dbConnect from "../../../../config/db";
import SecretCode from "@/models/secretCodeSchema";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { secretCode } = await req.json();

  if (!secretCode) {
    return NextResponse.json(
      { error: "Secret code is required" },
      { status: 400 }
    );
  }

  try {
    await dbConnect(); // Connect to MongoDB
    const storedCode = await SecretCode.findOne();

    if (!storedCode) {
      return NextResponse.json(
        { error: "No secret code found in the database" },
        { status: 404 }
      );
    }

    // Compare the entered code with the hashed code in the database
    const isMatch = await bcrypt.compare(secretCode, storedCode.code);

    if (isMatch) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Invalid secret code" },
        { status: 403 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
