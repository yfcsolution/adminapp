import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import paymentMethodsSchema from "@/models/paymentMethodsSchema";

// API Route Handler
export async function POST(req) {
  try {
    // Ensure we're connected to the DB
    await connectDB();

    // Parse incoming request body
    const { MethodName, Available } = await req.json(); // Getting data from the request body

    // Validation
    if (!MethodName) {
      return NextResponse.json(
        { success: false, message: "MethodName is required" },
        { status: 400 }
      );
    }

    // Convert MethodName to lowercase before inserting it into the database
    const formattedMethodName = MethodName.toLowerCase();

    // Create new payment method with lowercase MethodName
    const newMethod = new paymentMethodsSchema({
      MethodName: formattedMethodName,
      Available: Available || true, // Default to true if not provided
    });

    // Save the payment method to the database
    await newMethod.save();

    return NextResponse.json({
      success: true,
      message: "Payment method created successfully",
      data: newMethod,
    });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
