import { handleUpdatingRole } from "@/controllers/rolesController";
import connectDB from "@/config/db";

export async function PATCH(req) {
  await connectDB();
  return handleUpdatingRole(req);
}
