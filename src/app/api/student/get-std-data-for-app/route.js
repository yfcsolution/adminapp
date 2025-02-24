import { NextResponse } from "next/server";
import { getStdInfoForApp } from "@/controllers/studentAuthController";
export async function POST(req) {
  return getStdInfoForApp(req);
}
