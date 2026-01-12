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
      `${ERP_BASE_URL}/erp/getdata/yfc/?P_USER_ID=${userid}`
    );

    const data = response.data.items; // Ensure this path is correct based on the API response structure

    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: "No family data found in API response." },
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

    // Update or insert family data based on family_name
    data.forEach((newFamilyData) => {
      const existingFamily = student.family_data.find(
        (family) => family.family_name === newFamilyData.family_name
      );

      if (existingFamily) {
        // Update existing family data
        Object.assign(existingFamily, newFamilyData);
      } else {
        // Add new family data entry
        student.family_data.push(newFamilyData);
      }
    });

    // Save the updated student document
    await student.save();

    return NextResponse.json(
      { message: "Family data updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating family data:", error);
    return NextResponse.json(
      { error: "Failed to update family data." },
      { status: 500 }
    );
  }
}
