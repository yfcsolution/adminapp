import { getStripePaymentDetails } from "../../../controllers/stripeController";
import connectDB from "@/config/db";

export async function POST(req) {
  await connectDB();
  return getStripePaymentDetails(req);
}
