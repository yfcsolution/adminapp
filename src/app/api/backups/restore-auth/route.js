// Server-side API route for restoring backups (handles auth internally)
import { NextResponse } from "next/server";
import { verifyJWT } from "@/middleware/auth_middleware";

export async function POST(req) {
  try {
    // Verify user is authenticated
    const authError = await verifyJWT(req);
    if (authError) {
      return authError;
    }

    const { fileId } = await req.json();

    // Call the restore endpoint internally with the backup secret
    const restoreResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"}/api/backups/restore`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKUP_SECRET}`,
        },
        body: JSON.stringify({ fileId }),
      }
    );

    const data = await restoreResponse.json();
    return NextResponse.json(data, { status: restoreResponse.status });
  } catch (error) {
    console.error("Error restoring backup:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to restore backup",
      },
      { status: 500 }
    );
  }
}
