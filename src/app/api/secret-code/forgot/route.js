import { NextResponse } from "next/server";
import { verifyJWT } from "@/middleware/auth_middleware";
import User from "@/models/User";
import SecretCode from "@/models/secretCodeSchema";

export async function POST(req) {
  // Run the verifyJWT middleware to check if the user is authenticated
  const authResult = await verifyJWT(req);

  // If verifyJWT returns an error response, return it immediately
  if (authResult instanceof NextResponse && authResult.status === 401) {
    return authResult;
  }

  try {
    // Get the admin password and new secret code from the request body
    const { adminPassword, newCode } = await req.json();

    // Find the user in the database using the user ID from JWT payload (req.user)
    const user = await User.findById(req.user._id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify if the user has the correct admin password
    const isPasswordCorrect = await user.isPasswordCorrect(adminPassword);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Admin password is incorrect" },
        { status: 400 }
      );
    }

    // Now that the admin is authenticated, find the existing secret code entry
    const secretCodeEntry = await SecretCode.findOne();

    if (!secretCodeEntry) {
      return NextResponse.json(
        { message: "Secret code not found" },
        { status: 404 }
      );
    }

    // Update the secret code with the new code from the frontend
    secretCodeEntry.code = newCode;
    await secretCodeEntry.save();

    // Return a success response indicating that the secret code was updated
    return NextResponse.json(
      { message: "Secret code updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating secret code:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the secret code" },
      { status: 500 }
    );
  }
}
