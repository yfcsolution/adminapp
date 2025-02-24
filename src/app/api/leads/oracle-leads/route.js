import { handleoracleleads } from "@/controllers/leadsController";
import connectDB from "@/config/db";

export async function POST(req) {
  await connectDB();
  return handleoracleleads(req);
}
