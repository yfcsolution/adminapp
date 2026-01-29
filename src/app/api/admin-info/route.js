import { NextResponse } from "next/server";
import { verifyJWT } from "@/middleware/auth_middleware";
import { getAdminData } from "@/controllers/authController";

export async function GET(req) {
  // Run the verifyJWT middleware
  const authResult = await verifyJWT(req);

  // If verifyJWT returns an error response, return it immediately
  if (authResult instanceof NextResponse && authResult.status === 401) {
    return authResult;
  }

  // If the user is authenticated, proceed to get admin data
  const response = await getAdminData(req);
  
  // Add caching headers for better performance
  if (response instanceof NextResponse) {
    response.headers.set("Cache-Control", "private, max-age=60");
  }
  
  return response;
}
