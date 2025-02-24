import connectDB from '../../../config/db';
import { handleLeadsSubmit } from '@/controllers/leadsController';
export async function POST(req) {
    await connectDB();
    return handleLeadsSubmit(req);
}
