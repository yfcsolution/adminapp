import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import paymentMethodsSchema from "@/models/paymentMethodsSchema";

export async function POST(req) {
  try {
    await connectDB();

    const { id, name, description, active } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );
    }

    const updatedFields = {};
    if (name) updatedFields.name = name;
    if (description !== undefined) updatedFields.description = description;
    if (active !== undefined) updatedFields.active = active;

    const updatedMethod = await paymentMethodsSchema.findOneAndUpdate(
      { id },
      updatedFields,
      { new: true }
    );

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
