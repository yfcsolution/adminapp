export const dynamic = "force-dynamic";
import { handleStripeOrders } from '@/controllers/stripeController';
import connectDB from '@/config/db';

export async function POST(req) {
    await connectDB();
    return handleStripeOrders(req);
}
