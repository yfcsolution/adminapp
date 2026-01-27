// API Key Authentication Middleware for External APIs
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Verify API Key from request header
 * @param {Request} req - Next.js request object
 * @returns {NextResponse|null} - Error response or null if valid
 */
export async function verifyApiKey(req) {
  try {
    // Get API key from header (preferred) or query param (fallback)
    const apiKey = 
      req.headers.get("x-api-key") || 
      req.headers.get("authorization")?.replace("Bearer ", "") ||
      new URL(req.url).searchParams.get("api_key");

    if (!apiKey) {
      return NextResponse.json(
        { 
          success: false,
          error: "API key is required. Provide it in 'x-api-key' header or 'api_key' query parameter." 
        },
        { status: 401 }
      );
    }

    // Get expected API key from environment
    const expectedApiKey = process.env.EXTERNAL_API_KEY;

    if (!expectedApiKey) {
      console.error("EXTERNAL_API_KEY not configured in environment variables");
      return NextResponse.json(
        { 
          success: false,
          error: "Server configuration error" 
        },
        { status: 500 }
      );
    }

    // Use constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(apiKey),
      Buffer.from(expectedApiKey)
    );

    if (!isValid) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid API key" 
        },
        { status: 401 }
      );
    }

    return null; // Valid API key
  } catch (error) {
    console.error("API key verification error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Authentication error" 
      },
      { status: 500 }
    );
  }
}
