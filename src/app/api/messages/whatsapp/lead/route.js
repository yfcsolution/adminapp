import { handleWhatsappMessageLeads } from "@/controllers/whatsappController";
import connectDB from "@/config/db";

export async function POST(req) {
  await connectDB();
  return handleWhatsappMessageLeads(req);
}
