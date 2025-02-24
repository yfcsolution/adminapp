import { addStdFromLead } from "@/controllers/oracleController";
import connectDB from "@/config/db";

export async function POST(req) {
  await connectDB();
  return addStdFromLead(req);
}
