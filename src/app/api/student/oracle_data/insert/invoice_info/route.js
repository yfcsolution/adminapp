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
      `${ERP_BASE_URL}/yfcerp/invoiceinfo/getdata?P_USER_ID=${userid}`
    );

    const data = response.data.items; // Ensure this path is correct based on the API response structure
    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: "No invoice data found in API response." },
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

    // Update existing invoices or add new ones based on inv_no
    data.forEach((newInvoice) => {
      const existingInvoice = student.invoice_info.find(
        (invoice) => invoice.inv_no === newInvoice.inv_no
      );

      if (existingInvoice) {
        // Update existing invoice data
        Object.assign(existingInvoice, newInvoice);
      } else {
        // Add new invoice data
        student.invoice_info.push(newInvoice);
      }
    });

    // Save the updated student document
    await student.save();

    return NextResponse.json(
      { message: "Invoice info updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating invoice info:", error);
    return NextResponse.json(
      { error: "Failed to update invoice info." },
      { status: 500 }
    );
  }
}
