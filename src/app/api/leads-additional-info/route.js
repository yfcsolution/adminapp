import connectDB from '../../../config/db';
import { handleLeadsAdditionalData } from '@/controllers/leadsController';
export async function POST(req) {
    await connectDB();
    return handleLeadsAdditionalData(req);
}
