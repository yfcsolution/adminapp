// app/api/set-secret-code/route.js

import { NextResponse } from "next/server"; // Import NextResponse
import dbConnect from "../../../../config/db";
import SecretCode from "@/models/secretCodeSchema";

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

    // Check if there is already a secret code in the database
    const existingCode = await SecretCode.findOne();

    if (existingCode) {
      return NextResponse.json(
        { error: "A secret code already exists. Cannot add another one." },
        { status: 400 }
      );
    }

    // If no secret code exists, create a new one
    const newSecretCode = new SecretCode({ code: secretCode });
    await newSecretCode.save();

    return NextResponse.json(
      { success: true, message: "Secret code added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
