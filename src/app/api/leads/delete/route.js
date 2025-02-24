
import connectDB from '@/config/db';
import { deleteLead } from '@/controllers/leadsController';

export async function POST(req) {
    await connectDB();
    return deleteLead(req);
}
