import connectDB from '../../../config/db';
import { handleSecondMessageSending } from '@/controllers/leadsController';
export async function POST(req) {
    await connectDB();
    return handleSecondMessageSending(req);
}
