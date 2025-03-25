import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingId = searchParams.get("trackingId");

    console.log(`Email Opened - Tracking ID: ${trackingId}`);

    // You can store this info in a database to track opens
    return new NextResponse("", {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    console.error("Tracking error:", error);
    return new NextResponse("Failed to track email", { status: 500 });
  }
}
