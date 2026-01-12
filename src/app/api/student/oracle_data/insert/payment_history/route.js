import axios from "axios";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import ERP_BASE_URL from "@/config/erpUrl";

export async function POST(req) {
  try {
    await connectDB(); // Connect to MongoDB
    const body = await req.json(); // Parse the request body
    const { userid } = body;

    // Fetch data from the external API
    const response = await axios.get(
      `${ERP_BASE_URL}/erp/paymenthistory/getdata?P_USER_ID=${userid}`
    );

    const data = response.data.items; // Ensure this path is correct based on the API response structure
    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: "No payment history data found in API response." },
        { status: 404 }
      );
    }

    // Find the student by userid
    const student = await Student.findOne({ userid });
    if (!student) {
      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }

    // Update existing entries or add new ones based on payment_id
    data.forEach((newPayment) => {
      const existingPayment = student.payment_history.find(
        (payment) => payment.payment_id === newPayment.payment_id
      );

      if (existingPayment) {
        // Update existing payment data
        Object.assign(existingPayment, newPayment);
      } else {
        // Add new payment data
        student.payment_history.push(newPayment);
      }
    });

    // Save the updated student document
    await student.save();

    return NextResponse.json(
      { message: "Payment history updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating payment history:", error);
    return NextResponse.json(
      { error: "Failed to update payment history." },
      { status: 500 }
    );
  }
}
