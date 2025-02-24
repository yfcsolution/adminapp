// src/app/api/orders/[orderID]/capture/route.js
import connectDB from '@/config/db';  // DB connection setup
import { CapturePypalOrders } from '@/controllers/paypalControllers';

export async function POST(req, { params }) {
    await connectDB();  // Ensure the database is connected before processing the order
    req.params = params;  // Attach params (orderID) to req for the controller

    return CapturePypalOrders(req);  // Call the controller function
}
