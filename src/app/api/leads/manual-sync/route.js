import LeadsForm from "@/models/LeadsForm";
import connectDB from "@/config/db";
import axios from "axios"; // Make sure axios is installed
import { NextResponse } from "next/server"; // Import NextResponse

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
    const response = await axios.post(
      "https://sss.yourfuturecampus.com:8443/apeks/apps/erp/YfcLeads/insertleads",
      leadData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status == 200) {
      // Mark lead as synced after successful insertion
      lead.syncedToOracle = true;
      await lead.save();

      return NextResponse.json({
        message: "Lead synced successfully",
        success: true,
      });
    } else {
      console.error("Oracle response error:", response.data.error);
      return NextResponse.json(
        {
          message: "Failed to sync lead to Oracle",
          error: response.data.error,
          success: false,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error during lead sync:", error.message);
    return NextResponse.json(
      {
        message: "An unexpected error occurred",
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
