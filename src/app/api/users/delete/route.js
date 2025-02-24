import { deleteUser } from '@/controllers/authController';
import connectDB from '@/config/db';

export async function DELETE(req) {
  await connectDB();
  return deleteUser(req);
}
