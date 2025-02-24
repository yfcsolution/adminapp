import connectDB from "@/config/db";
import Payment from "@/models/PaymentSchema";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Connect to the database
    await connectDB();

    // Extract the search query from the request's URL
    const { searchParams } = new URL(req.url);
    const familyId = searchParams.get("familyId");

    // Create a filter for familyId
    let filter = {};
    if (familyId) {
      filter = { familyId: { $regex: `^${familyId}`, $options: "i" } };
    }

    // Fetch payment data from the Payment model using the filter
    const payments = await Payment.find(filter).sort({ _id: -1 });

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
