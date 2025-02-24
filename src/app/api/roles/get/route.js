import { handleFetchingRoles } from "@/controllers/rolesController";
import connectDB from "@/config/db";

export async function GET() {
  await connectDB();
  return handleFetchingRoles();
}
