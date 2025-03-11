import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { updateLead } from "@/controllers/leadsController";

export async function POST(req) {
  await connectDB();

  // Handle update logic
  const response = await updateLead(req);

  // Set CORS headers in response
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204, // No content response
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
  
