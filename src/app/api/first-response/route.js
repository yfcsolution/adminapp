import connectDB from '../../../config/db';
import { handleMessageSending } from '@/controllers/leadsController';
export async function POST(req) {
    await connectDB();
    return handleMessageSending(req);
}
