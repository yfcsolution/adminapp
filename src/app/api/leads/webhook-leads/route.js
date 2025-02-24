import connectDB from "@/config/db";
import { handleWebhookLeads } from "@/controllers/leadsController";
export async function POST(req) {
  await connectDB();
  return handleWebhookLeads(req);
}
