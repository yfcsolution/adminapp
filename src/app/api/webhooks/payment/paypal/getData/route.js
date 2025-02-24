import connectDB from "@/config/db";
import Payment from "@/models/PaymentSchema";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Connect to the database
    await connectDB();
    // Fetch payment data from the Payment model
    const payments = await Payment.find().sort({ _id: -1 });
    // Customize this query as per your needs

    // If payments are found, return the data with a success response
    if (payments.length > 0) {
      return NextResponse.json(payments, { status: 200 });
    }

    // If no payments found, return a not found response
    return NextResponse.json({ message: "No payments found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching payment data:", error);

    // Return an error response if something goes wrong
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
