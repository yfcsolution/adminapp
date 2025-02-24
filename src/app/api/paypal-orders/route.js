import connectDB from '@/config/db';
import { handlePaypalOrders } from '@/controllers/paypalControllers';

export async function POST(req) {
    await connectDB();
    return handlePaypalOrders(req);
}
