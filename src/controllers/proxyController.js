import { NextResponse } from "next/server";
import axios from "axios";

export const handleClassesHistory = async (req) => {
  try {
    // Parse the JSON body of the incoming request
    const { P_STUDENT_ID, P_USER_ID, P_FROM_DATE, P_TO_DATE } =
      await req.json();

    // Validate the required parameters
    if (!P_STUDENT_ID || !P_USER_ID || !P_FROM_DATE || !P_TO_DATE) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Define the external API URL
    const EXTERNAL_API_URL =
      "${ERP_BASE_URL}/yfc_erp/classhistory/getdata";

    // Make the request to the external API
    const response = await axios.get(EXTERNAL_API_URL, {
      params: {
        P_USER_ID,
        P_STUDENT_ID,
        P_FROM_DATE,
        P_TO_DATE,
      },
    });

    // Log the API response for debugging

    // Return the external API response
    return NextResponse.json(
      {
        message: "Data fetched successfully",
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching data from external API:", error);

    // Return an error response
    return NextResponse.json(
      {
        message: "Something went wrong fetching data",
        error: error.response?.data || error.message,
      },
      { status: 500 }
    );
  }
};
