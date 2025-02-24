import { addStdDetails } from "@/controllers/oracleController";
import connectDB from "@/config/db";

export async function POST(req) {
  await connectDB();
  return addStdDetails(req);
}
