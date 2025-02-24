import { fetchLeadsData } from '@/controllers/leadsController';
import connectDB from '@/config/db';

export async function GET(req) {
    await connectDB();
    return fetchLeadsData(req);
}
