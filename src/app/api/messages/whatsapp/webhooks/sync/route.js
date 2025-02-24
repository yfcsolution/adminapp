import connectDB from "@/config/db";
import { handleUnSyncedLogs } from "@/controllers/whatsappWebhookController";

export async function GET(req) {
  await connectDB();
  return handleUnSyncedLogs(req);
}
