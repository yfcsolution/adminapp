// app/api/validate-secret-code/route.js

import { NextResponse } from "next/server"; // Import NextResponse
import dbConnect from "../../../../config/db"; // Import dbConnect
import bcrypt from "bcrypt"; // Import bcrypt for hashing
import { verifyJWT } from "@/middleware/auth_middleware"; // Import verifyJWT middleware
import User from "@/models/User"; // Import User model

export async function POST(req) {
  const authResult = await verifyJWT(req);

  // If verifyJWT returns an error response, return it immediately
  if (authResult instanceof NextResponse && authResult.status === 401) {
    return authResult;
  }

  try {
    await dbConnect(); // Connect to MongoDB

    // Parse the request body to get the secret code
    const { secretCode } = await req.json();

    // Validate if the secret code is provided
    if (!secretCode) {
      return NextResponse.json(
        { error: "Secret code is required" },
        { status: 400 }
      );
    }

    // Find the user in the database using the user ID from JWT payload (req.user)
    const user = await User.findById(req.user._id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Get the stored hashed secret code from the user document
    const storedCode = user.secreteCode;

    if (!storedCode) {
      return NextResponse.json(
        { error: "No secret code found in the database" },
        { status: 404 }
      );
    }

    // Compare the entered secret code with the stored hashed secret code
    const isMatch = await bcrypt.compare(secretCode, storedCode);

    if (isMatch) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "Invalid secret code" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Error validating secret code:", error);
    return NextResponse.json(
      { error: "An error occurred while validating the secret code" },
      { status: 500 }
    );
  }
}
