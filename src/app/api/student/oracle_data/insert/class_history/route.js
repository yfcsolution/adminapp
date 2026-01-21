import axios from "axios";
import connectDB from "@/config/db";
import Student from "@/models/Student";
import { NextResponse } from "next/server";
import ERP_BASE_URL from "@/config/erpUrl";

// Helper function to format a date to DD-MMM-YYYY
const formatToDD_MMM_YYYY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase(); // Get abbreviated month name in uppercase
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};
// Helper function to get the date one month ago in DD-MMM-YYYY
const getOneMonthAgoDate = () => {
  const now = new Date();
  now.setMonth(now.getMonth() - 1); // Subtract one month
  return formatToDD_MMM_YYYY(now); // Format the date to DD-MMM-YYYY
};

// Helper function to get the current date in DD-MMM-YYYY
const getCurrentDate = () => {
  const now = new Date();
  return formatToDD_MMM_YYYY(now); // Format the date to DD-MMM-YYYY
};

// Named export for the POST method
export async function POST(req) {
  try {
    await connectDB(); // Connect to MongoDB

    const body = await req.json(); // Parse the request body
    const { userid, studentId } = body;

    if (!userid || !studentId) {
      return NextResponse.json(
        { error: "User ID and Student ID are required." },
        { status: 400 }
      );
    }

    const oneMonthAgo = getOneMonthAgoDate();
    const currentDate = getCurrentDate();

    // Fetch data from the external API
    const response = await axios.get(
      `${ERP_BASE_URL}/yfcerp/classhistory/getdata?P_USER_ID=${userid}&P_STUDENT_ID=${studentId}&P_FROM_DATE=${currentDate}&P_TO_DATE=${oneMonthAgo}`
    );

    const data = response.data.items; // Ensure this path is correct based on the API response structure
    if (!data || data.length === 0) {
      return NextResponse.json(
        { message: "No class history data found in API response." },
        { status: 404 }
      );
    }

    // Filter data to keep only entries from the last month
    const filteredData = data.filter(
      (item) => new Date(item.lesson_date) >= new Date(oneMonthAgo)
    );

    // Data to store: If no filtered data, use the original data
    const dataToStore = filteredData.length > 0 ? filteredData : data;

    // Find the student by userid
    let student = await Student.findOne({ userid });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      );
    }

    // Replace the existing class_history array or add new data
    student.class_history = dataToStore;

    // Save the updated student document
    await student.save();

    return NextResponse.json(
      { message: "Class history updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating class history:", error);
    return NextResponse.json(
      { error: "Failed to update class history." },
      { status: 500 }
    );
  }
}
