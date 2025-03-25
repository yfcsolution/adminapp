import { fetchSearchLeadProfileData } from "@/controllers/leadsController";
import connectDB from "@/config/db";

export async function POST(req) {
  await connectDB();
  return fetchSearchLeadProfileData(req);
}
