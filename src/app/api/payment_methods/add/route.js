import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import paymentMethodsSchema from "@/models/paymentMethodsSchema";

export async function POST(req) {
  try {
    await connectDB();

    const { id, name, description, active } = await req.json();

    if (!id || !name) {
      return NextResponse.json(
        { success: false, message: "ID and Name are required" },
        { status: 400 }
      );
    }

    // Check if ID already exists
    const existingMethod = await paymentMethodsSchema.findOne({ id });
    if (existingMethod) {
      return NextResponse.json(
        { success: false, message: "Payment method with this ID already exists" },
        { status: 400 }
      );
    }

    const newMethod = new paymentMethodsSchema({
      id,
      name,
      description: description || "",
      active: active !== undefined ? active : true,
    });

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
