import { fetchLeadsData } from "@/controllers/leadsController";
import connectDB from "@/config/db";

// Public leads data endpoint used by the admin UI.
// We intentionally skip auth checks here to keep things simple and reliable
// in the current deployment environment.
export async function POST(req) {
  await connectDB();
  return fetchLeadsData(req);
}
