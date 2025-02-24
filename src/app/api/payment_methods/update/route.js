import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import paymentMethodsSchema from "@/models/paymentMethodsSchema";

// API Route Handler for updating payment method using POST
export async function POST(req) {
  try {
    // Ensure we're connected to the DB
    await connectDB();

    // Parse incoming request body
    const { MethodId, MethodName, Available } = await req.json();

    // Validation: Ensure MethodId is provided
    if (!MethodId) {
      return NextResponse.json(
        { success: false, message: "MethodId is required" },
        { status: 400 }
      );
    }

    // Prepare the update fields
    const updatedFields = {};
    if (MethodName) {
      updatedFields.MethodName = MethodName.toLowerCase(); // Convert MethodName to lowercase
    }
    if (Available !== undefined) {
      updatedFields.Available = Available;
    }

    // Find the payment method by MethodId and update it
    const updatedMethod = await paymentMethodsSchema.findOneAndUpdate(
      { MethodId },
      updatedFields,
      { new: true } // Return the updated document
    );

    // Check if the payment method was found
    if (!updatedMethod) {
      return NextResponse.json(
        { success: false, message: "Payment method not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment method updated successfully",
      data: updatedMethod,
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    return NextResponse.json(
      { success: false, message: "Error updating payment method" },
      { status: 500 }
    );
  }
}
