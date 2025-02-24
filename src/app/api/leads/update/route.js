import connectDB from "@/config/db";
import { updateLead } from "@/controllers/leadsController";

export async function PUT(req) {
  await connectDB();
  return updateLead(req);
}
