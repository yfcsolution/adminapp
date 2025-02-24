import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import paymentMethodsSchema from "@/models/paymentMethodsSchema";


// API Route Handler
export async function GET(req) {
  try {
    // Ensure we're connected to the DB
    await connectDB();

    // Fetch all payment methods
    const paymentMethods = await paymentMethodsSchema.find(); // lean() to get plain JS objects

    // Return response with data
    return NextResponse.json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching payment methods" },
      { status: 500 }
    );
  }
}