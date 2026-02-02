// Server-side API route for listing backups (handles auth internally)
import { NextResponse } from "next/server";
import { verifyJWT } from "@/middleware/auth_middleware";

export async function GET(req) {
  try {
    // Verify user is authenticated
    const authError = await verifyJWT(req);
    if (authError) {
      return authError;
    }

    // Call the list endpoint internally with the backup secret
    const listResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/backups/list`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.BACKUP_SECRET}`,
        },
      }
    );

    const data = await listResponse.json();
    return NextResponse.json(data, { status: listResponse.status });
  } catch (error) {
    console.error("Error listing backups:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to list backups",
      },
      { status: 500 }
    );
  }
}
