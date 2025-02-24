// src/middleware.js
import { NextResponse } from "next/server";

const allowedOrigins = ["*"];
const allowedMethods = ["GET", "POST", "OPTIONS"];
const allowedHeaders = "Content-Type, Authorization";

export function middleware(req) {
  const origin = req.headers.get("origin");
// Check if the request origin is allowed
  if (origin && !allowedOrigins.includes(origin) && allowedOrigins[0] !== "*") {
    return new NextResponse("CORS origin not allowed", { status: 403 });
  }

// Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0]);
    response.headers.set(
      "Access-Control-Allow-Methods",
      allowedMethods.join(",")
    );
    response.headers.set("Access-Control-Allow-Headers", allowedHeaders);
    return response;
  }

// Add CORS headers for other requests
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", allowedOrigins[0]);
  response.headers.set(
    "Access-Control-Allow-Methods",
    allowedMethods.join(",")
  );
  response.headers.set("Access-Control-Allow-Headers", allowedHeaders);
  return response;
}
