import { NextResponse } from "next/server";
import LeadsForm from "@/models/LeadsForm";
import connectDB from "@/config/db";

export const POST = async (req) => {
  try {
    await connectDB();

    // Parse the request body
    const { leadId, statusId } = await req.json();

    // Validate required fields
    if (!leadId || !statusId) {
      return NextResponse.json(
        {
          message: "leadId and statusId are required",
        },
        {
          status: 400,
        }
      );
    }

    // Find the lead by leadId
    const lead = await LeadsForm.findOne({ LEAD_ID: leadId });
    if (!lead) {
      return NextResponse.json(
        {
          message: "Lead not found",
        },
        {
          status: 404,
        }
      );
    }

    // Update the P_STATUS field
    lead.P_STATUS = statusId;

    // Save the updated lead
    await lead.save();

    try {
      // Run the syncWithOracle method defined in the schema
      await lead.syncWithOracle();

      // Return success response
      return NextResponse.json(
        {
          message: "Lead status updated and synced to Oracle successfully",
          data: lead,
        },
        {
          status: 200,
        }
      );
    } catch (syncError) {
      // If syncWithOracle fails, return a custom message
      return NextResponse.json(
        {
          message: "Lead status updated, but sync to Oracle failed",
          error: syncError.message,
        },
        {
          status: 200, // Use 200 to indicate partial success
        }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
};
