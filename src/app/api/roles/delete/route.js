import { handleDeletingRole } from "@/controllers/rolesController";
import connectDB from "@/config/db";

export async function DELETE(req) {
  await connectDB();
  return handleDeletingRole(req);
}
