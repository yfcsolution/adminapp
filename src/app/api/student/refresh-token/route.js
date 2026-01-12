
import connectDB from '@/config/db';
import { refreshStdAccessToken } from '@/controllers/studentAuthController';

export async function GET(req) {
    await connectDB();
    return refreshStdAccessToken(req);
}
