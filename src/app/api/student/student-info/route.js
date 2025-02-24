import { NextResponse } from "next/server";
import { stdVerifyJWT } from "@/middleware/auth_middleware";
import { getStdInfo } from "@/controllers/studentAuthController";
export async function GET(req) {
    // Run the verifyJWT middleware
    const authResult = await stdVerifyJWT(req);

    // If verifyJWT returns an error response, return it immediately
    if (authResult instanceof NextResponse && authResult.status === 401) {
        return authResult;
    }

    // If the user is authenticated, proceed to log them out
    return getStdInfo(req);
}
