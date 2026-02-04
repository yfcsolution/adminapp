import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

/**
 * DELETE endpoint to remove all users except dafiyahilmulquran@gmail.com
 * This is a one-time cleanup operation
 */
export async function DELETE(req) {
  try {
    await connectDB();

    const KEEP_EMAIL = "dafiyahilmulquran@gmail.com";

    // Find the user to keep
    const userToKeep = await User.findOne({ email: KEEP_EMAIL });

    if (!userToKeep) {
      return NextResponse.json(
        {
          message: `User with email ${KEEP_EMAIL} not found. Cannot proceed with cleanup.`,
          success: false,
        },
        { status: 404 }
      );
    }

    // Delete all users except the one to keep
    const result = await User.deleteMany({
      email: { $ne: KEEP_EMAIL },
    });

    return NextResponse.json(
      {
        message: `Cleanup completed successfully. Deleted ${result.deletedCount} user(s). Kept user: ${KEEP_EMAIL}`,
        deletedCount: result.deletedCount,
        keptEmail: KEEP_EMAIL,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error during user cleanup:", error);
    return NextResponse.json(
      {
        message: "Internal server error during cleanup",
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
