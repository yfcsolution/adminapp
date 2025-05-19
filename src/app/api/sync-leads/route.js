import LeadsForm from "@/models/LeadsForm";
import connectDB from "@/config/db";
import axios from "axios"; // Make sure axios is installed
import { NextResponse } from "next/server"; // Import NextResponse

export async function POST(req) {
  try {
    // Connect to the database
    await connectDB();

    // Find unsynced leads
    const unsyncedLeads = await LeadsForm.find({ syncedToOracle: false });

    // Sync each lead with Oracle
    for (const lead of unsyncedLeads) {
      try {
        // Prepare the lead data to be sent in the POST request
        const leadData = {
          LEAD_ID: lead.LEAD_ID,
          FULL_NAME: lead.FULL_NAME,
          EMAIL: "********",
          PHONE_NO: "********",
          REMARKS: lead.REMARKS,
          COUNTRY: lead.COUNTRY,
          TIME_ZONE: lead.TIME_ZONE,
          CURRENCY: lead.CURRENCY,
          STATE: lead.STATE,
          LEAD_IP: lead.LEAD_IP,
          REQUEST_FORM: lead.REQUEST_FORM,
          WHATSAPP_STATUS: lead.WHATSAPP_STATUS,
          // Add other fields you want to send here
        };

        // Send the lead data to the specified endpoint
        const response = await axios.post(
          "https://sss.yourfuturecampus.com:8443/apeks/apps/erp/YfcLeads/insertleads",
          leadData
        );
        if (response.status == 200) {
          // Mark lead as synced after successful insertion
          lead.syncedToOracle = true;
          await lead.save();
        } else {
          console.error(response.data.error);
        }
      } catch (error) {
        console.error("Error syncing lead");
      }
    }

    return NextResponse.json({
      message: "Sync completed successfully",
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Sync failed",
        error: error.message,
        success: false,
      },
      { status: 500 }
    );
  }
}
