import { NextResponse } from "next/server";
import { getTemplate } from "@/controllers/emailsController";

export async function GET(req) {
  try {
    return await getTemplate(req);
  } catch (error) {
    console.error("Error in GET handler:", error);
    return NextResponse.json(
      { message: "An error occurred while processing the request." },
      { status: 500 }
    );
  }
}
