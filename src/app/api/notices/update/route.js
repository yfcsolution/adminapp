import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/config/db";
import Notices from "@/models/Notices";

// Function to format date as DD-MMM-YY (e.g., 19-FEB-2025)
const formatDate = (date) => {
  if (!date) return null;
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString("en-GB", options).toUpperCase();
};

export const POST = async (req) => {
  try {
    await connectDB();

    const {
      P_REL_ID,
      P_REL_TYPE,
      P_SYNC_ID,
      P_DESCRIPTION,
      P_DATE_CONTACTED,
      P_ADDEDFROM,
    } = await req.json();

    if (!P_REL_ID || !P_REL_TYPE || !P_SYNC_ID) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert P_SYNC_ID to ObjectId
    const syncObjectId = new mongoose.Types.ObjectId(P_SYNC_ID);

    // Format the dates
    const formattedContactedDate = formatDate(P_DATE_CONTACTED);
    const formattedUpdatedDate = formatDate(new Date());

    let existingNotice = await Notices.findOne({ P_REL_ID, P_REL_TYPE });

    if (!existingNotice) {
      return NextResponse.json(
        { error: "Notice record not found" },
        { status: 404 }
      );
    }

    // Find the specific notice using ObjectId comparison
    const noticeToUpdate = existingNotice.Notices.find((notice) =>
      notice._id.equals(syncObjectId)
    );

    if (!noticeToUpdate) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    // Update the notice details
    noticeToUpdate.P_DESCRIPTION = P_DESCRIPTION;
    noticeToUpdate.P_DATE_CONTACTED = formattedContactedDate;
    noticeToUpdate.P_ADDEDFROM = P_ADDEDFROM;
    noticeToUpdate.P_DATEUPDATED = formattedUpdatedDate;

    await existingNotice.save();

    // Call the schema method to sync the updated notice
    await existingNotice.syncToExternalAPI(
      noticeToUpdate,
      P_REL_ID,
      P_REL_TYPE
    );

    return NextResponse.json(
      { message: "Notice updated successfully", data: existingNotice },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating notice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
