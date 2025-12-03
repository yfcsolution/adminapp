import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Read allowed IPs (comma separated)
    const allowedIPs = (process.env.ALLOWED_IPS || "")
      .split(",")
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);

    // Identify requester IP (Vercel special handling)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const realIP = forwardedFor
      ? forwardedFor.split(",")[0].trim()
      : req.headers.get("x-real-ip") ||
        req.headers.get("cf-connecting-ip") ||
        "unknown";

    console.log("Incoming request IP:", realIP);
    console.log("Allowed IPs:", allowedIPs);

    // Allow localhost by default
    const defaultAllowed = ["127.0.0.1", "localhost"];

    const isAllowed =
      allowedIPs.includes(realIP) || defaultAllowed.includes(realIP);

    if (!isAllowed) {
      return NextResponse.json(
        {
          error: "Unauthorized IP",
          yourIP: realIP,
          allowed: allowedIPs,
        },
        { status: 403 }
      );
    }

    // Fetch Mongo URI
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
