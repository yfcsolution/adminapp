import Student from "@/models/Student";
import connectDB from "@/config/db";
import PaymentLinks from "@/models/PaymentLinks";
import { NextResponse } from "next/server";
import axios from "axios";
import ERP_BASE_URL from "@/config/erpUrl";

export const GET = async () => {
  try {
    await connectDB();
    const students = await Student.find();

    if (!students || students.length === 0) {
      return NextResponse.json(
        { message: "No students found" },
        { status: 404 }
      );
    }

    // Process all students and wait for all requests to complete
    const results = await Promise.all(
      students.map(async (student) => {
        const userid = student.userid;
        const _id = student._id.toString();
        const paymentLink = `https://sp.ilmulquran.com/student/invoice/${userid}/${_id}`;

        try {
          const response = await axios.post(
            `${ERP_BASE_URL}/yfcerp/family_paymentlink/postdata`,
            {
              FAMILY_ID: userid,
              URL_LINK: paymentLink, // Changed from duplicate FAMILY_ID
            }
          );
          console.log("response for", userid, "is", response.data);
          return { success: true, userid, response: response.data };
        } catch (error) {
          console.error("Error for", userid, error);
          return { success: false, userid, error: error.message };
        }
      })
    );

    return NextResponse.json(
      {
        message: "Process completed",
        results,
        total: results.length,
        successCount: results.filter((r) => r.success).length,
        errorCount: results.filter((r) => !r.success).length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Global error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
};
