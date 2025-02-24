import { refreshAccessToken } from '@/controllers/authController';
import connectDB from '@/config/db';

export async function GET(req) {
    await connectDB();
    return refreshAccessToken(req);
}
