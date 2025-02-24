import connectDB from "@/config/db";
import { handleClassesHistory } from "@/controllers/proxyController";
export async function POST(req) {
  await connectDB();
  return handleClassesHistory(req);
}
