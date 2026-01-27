// src/middleware.js
import { NextResponse } from "next/server";

// SECURITY: Restrict CORS to specific origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["*"]; // Fallback to all in development

const allowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const allowedHeaders = "Content-Type, Authorization, x-api-key";

export function middleware(req) {
  const origin = req.headers.get("origin");
  const pathname = req.nextUrl.pathname;

  // Allow external API routes to have more permissive CORS
  const isExternalApi = pathname.startsWith("/api/external/");

  // Check if the request origin is allowed
  if (
    origin &&
    !allowedOrigins.includes("*") &&
    !allowedOrigins.includes(origin) &&
    !isExternalApi
  ) {
    return new NextResponse("CORS origin not allowed", { status: 403 });
  }

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set(
      "Access-Control-Allow-Origin",
      isExternalApi ? "*" : allowedOrigins[0]
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      allowedMethods.join(",")
    );
    response.headers.set("Access-Control-Allow-Headers", allowedHeaders);
    response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours
    return response;
  }

  // Add CORS headers for other requests
  const response = NextResponse.next();
  response.headers.set(
    "Access-Control-Allow-Origin",
    isExternalApi ? "*" : allowedOrigins[0]
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    allowedMethods.join(",")
  );
  response.headers.set("Access-Control-Allow-Headers", allowedHeaders);

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Enforce HTTPS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  return response;
}
