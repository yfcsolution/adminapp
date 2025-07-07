import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const allowedIP = process.env.allowedIP; // Add your IP to .env.local
    console.log("allowed ip is",allowedIP)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    console.log("Ip is", ip)

    if (ip !== allowedIP) {
      return NextResponse.json({ error: "Unauthorized IP" }, { status: 403 });
    }

    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      return NextResponse.json(
        { error: "MONGO_URI is not defined" },
        { status: 500 }
      );
    }

    return NextResponse.json({ MONGO_URI });
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong", details: error.message },
      { status: 500 }
    );
  }
}
