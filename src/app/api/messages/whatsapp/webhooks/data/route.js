import { whatsappWebhookData } from '@/controllers/whatsappWebhookController';
import connectDB from '@/config/db';

export async function GET(req) {
    await connectDB();

    // Extract page and pageSize from query parameters
    const { searchParams } = req.nextUrl;

    const page = parseInt(searchParams.get('page')) || 1; // Default to page 1 if not provided
    const pageSize = parseInt(searchParams.get('pageSize')) || 10; // Default to 10 items per page if not provided

    // Pass the pagination parameters to the controller
    return whatsappWebhookData({ page, pageSize });
}
