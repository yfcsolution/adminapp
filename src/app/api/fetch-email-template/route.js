import { NextResponse } from "next/server";
import { verifyJWT } from "@/middleware/auth_middleware";
import { getTemplate } from "@/controllers/emailsController";

export async function GET(req) {
  try {
    const authResult = await verifyJWT(req);

    if (authResult instanceof NextResponse && authResult.status === 401) {
      return authResult;
    }

    return await getTemplate(req);
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { message: "An error occurred while processing the request." },
      { status: 500 }
    );
  }
}
