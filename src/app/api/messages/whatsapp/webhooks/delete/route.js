
import connectDB from '@/config/db';
import { deleteWebhook } from '@/controllers/whatsappWebhookController';

export async function POST(req) {
    await connectDB();
    return deleteWebhook(req);
}
