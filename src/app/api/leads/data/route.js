import { NextResponse } from "next/server";
import { verifyJWT } from "@/middleware/auth_middleware";
import { fetchRoleBasedLeads } from "@/controllers/leadsController";
import connectDB from "@/config/db";
export async function POST(req) {
  // Run the verifyJWT middleware
  await connectDB();
  const authResult = await verifyJWT(req);

  // If verifyJWT returns an error response, return it immediately
  if (authResult instanceof NextResponse && authResult.status === 401) {
    return authResult;
  }
  // If the user is authenticated, proceed to log them out
  return fetchRoleBasedLeads(req);
}
