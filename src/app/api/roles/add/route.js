import { handleAddingRole } from "@/controllers/rolesController";
import connectDB from "@/config/db";

export async function POST(req) {
  await connectDB();
  return handleAddingRole(req);
}
