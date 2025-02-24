import { updateUser } from '@/controllers/authController';
import connectDB from '@/config/db';

export async function PUT(req) {
  await connectDB();
  return updateUser(req);
}
