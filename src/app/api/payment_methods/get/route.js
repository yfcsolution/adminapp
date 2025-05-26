import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import paymentMethodsSchema from "@/models/paymentMethodsSchema";

export async function GET(req) {
  try {
    await connectDB();

    const paymentMethods = await paymentMethodsSchema
      .find()
      .sort({ createdAt: -1 });

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
