import LeadsForm from "@/models/LeadsForm";
import connectDB from "@/config/db";
import axios from "axios"; // Make sure axios is installed
import { NextResponse } from "next/server"; // Import NextResponse
import ERP_BASE_URL from "@/config/erpUrl";

export async function POST(req) {
  try {
    // Connect to the database
    await connectDB();

    // Parse the request body to extract LEAD_ID
    const { LEAD_ID } = await req.json();

    if (!LEAD_ID) {
      return NextResponse.json(
        { message: "LEAD_ID is required", success: false },
        { status: 400 }
      );
    }

    // Find the lead in the database
    const lead = await LeadsForm.findOne({ LEAD_ID });

    if (!lead) {
      return NextResponse.json(
        { message: `Lead with ID ${LEAD_ID} not found`, success: false },
        { status: 404 }
      );
    }

    // Prepare the lead data to be sent in the POST request
    const leadData = {
      LEAD_ID: lead.LEAD_ID,
      FULL_NAME: lead.FULL_NAME,
      EMAIL: "********", // Masked for privacy
      PHONE_NO: "********", // Masked for privacy
      REMARKS: lead.REMARKS,
      COUNTRY: lead.COUNTRY,
      TIME_ZONE: lead.TIME_ZONE,
      CURRENCY: lead.CURRENCY,
      STATE: lead.STATE,
      LEAD_IP: lead.LEAD_IP,
      REQUEST_FORM: lead.REQUEST_FORM,
      WHATSAPP_STATUS: lead.WHATSAPP_STATUS,
    };
    // Send the lead data to the Oracle endpoint
    try {
      const response = await axios.post(
        `${ERP_BASE_URL}/erp/YfcLeads/insertleads`,
        leadData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          validateStatus: function (status) {
            // Accept all status codes to handle errors manually
            return status >= 200 && status < 600;
          },
        }
      );

      if (response.status === 200) {
        // Mark lead as synced after successful insertion
        lead.syncedToOracle = true;
        await lead.save();

        return NextResponse.json({
          message: "Lead synced successfully",
          success: true,
        });
      } else {
        console.error("Oracle response error:", {
          status: response.status,
          statusText: response.statusText,
          data: response.data,
        });
        return NextResponse.json(
          {
            message: "Failed to sync lead to Oracle",
            error: response.data?.error || response.data?.message || `ERP returned status ${response.status}`,
            success: false,
          },
          { status: 500 }
        );
      }
    } catch (axiosError) {
      // Handle axios-specific errors
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Oracle API error response:", {
          status: axiosError.response.status,
          statusText: axiosError.response.statusText,
          data: axiosError.response.data,
        });
        return NextResponse.json(
          {
            message: "Failed to sync lead to Oracle",
            error: axiosError.response.data?.error || axiosError.response.data?.message || `ERP returned status ${axiosError.response.status}`,
            success: false,
          },
          { status: 500 }
        );
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error("Oracle API request error - no response:", axiosError.message);
        return NextResponse.json(
          {
            message: "Failed to connect to Oracle ERP",
            error: "No response received from ERP server. Please check network connectivity.",
            success: false,
          },
          { status: 500 }
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Oracle API setup error:", axiosError.message);
        return NextResponse.json(
          {
            message: "Failed to sync lead to Oracle",
            error: axiosError.message,
            success: false,
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Error during lead sync:", error);
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: error.message || "Unknown error",
        success: false,
      },
      { status: 500 }
    );
  }
}
