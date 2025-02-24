import connectDB from '@/config/db';
import { loginStudent } from '@/controllers/studentAuthController';
export async function POST(req) {
    await connectDB();
    return loginStudent(req);
}
