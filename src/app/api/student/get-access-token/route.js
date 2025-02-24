import { getStdAccessToken } from '@/controllers/studentAuthController';
import connectDB from '@/config/db';

export async function GET(req) {
    await connectDB();
    return getStdAccessToken(req);
}
