import { fetchLeadsContacts } from "../../../../controllers/oracleController";
import connectDB from "@/config/db";
import { verifyJWT } from "@/middleware/auth_middleware";
import { NextResponse } from "next/server";
export async function POST(req) {
  await connectDB();
  const authResult = await verifyJWT(req);
  // If verifyJWT returns an error response, return it immediately
  if (authResult instanceof NextResponse && authResult.status === 401) {
    return authResult;
  }
  return fetchLeadsContacts(req);
  
}
