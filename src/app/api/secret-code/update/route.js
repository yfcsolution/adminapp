// app/api/validate-secret-code/route.js

import { NextResponse } from "next/server"; // Import NextResponse
import dbConnect from "../../../../config/db";
import SecretCode from "@/models/secretCodeSchema";
import bcrypt from "bcrypt";

export async function POST(req) {
  const { currentSecretCode, newSecretCode } = await req.json(); // Receive both current and new codes

  if (!currentSecretCode || !newSecretCode) {
    return NextResponse.json(
      { error: "Both current and new secret codes are required" },
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

    // Compare the entered current secret code with the hashed code in the database
    const isMatch = await bcrypt.compare(currentSecretCode, storedCode.code);

    if (isMatch) {
      // If the current code is correct, hash the new secret code

      // Update the secret code in the database
      storedCode.code = newSecretCode;
      await storedCode.save();

      return NextResponse.json({ success: true, message: "Secret code updated successfully" }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Invalid current secret code" },
        { status: 403 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
