import { NextResponse } from "next/server";
import { verifyJWT } from "@/middleware/auth_middleware";
import User from "@/models/User";
import bcrypt from "bcrypt"; // Import bcrypt for hashing

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

    // Hash the new secret code using bcrypt
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const hashedSecreteCode = await bcrypt.hash(newCode, saltRounds);

    // Update only the secreteCode field with the hashed value
    user.secreteCode = hashedSecreteCode;
    await user.save(); // Save the updated user document

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