// Server-side API route for creating backups (handles auth internally)
import { NextResponse } from "next/server";
import { verifyJWT } from "@/middleware/auth_middleware";

export async function POST(req) {
  try {
    // Verify user is authenticated
    const authError = await verifyJWT(req);
    if (authError) {
      return authError;
    }

    // Call the store endpoint internally with the backup secret
    const storeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/backups/store`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.BACKUP_SECRET}`,
        },
      }
    );

    const data = await storeResponse.json();
    return NextResponse.json(data, { status: storeResponse.status });
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create backup",
      },
      { status: 500 }
    );
  }
}
