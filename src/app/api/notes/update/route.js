import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/config/db";
import Notes from "@/models/Notes";

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

    let existingNote = await Notes.findOne({ P_REL_ID, P_REL_TYPE });

    if (!existingNote) {
      return NextResponse.json(
        { error: "Note record not found" },
        { status: 404 }
      );
    }

    // Find the specific Note using ObjectId comparison
    const NoteToUpdate = existingNote.Notes.find((Note) =>
      Note._id.equals(syncObjectId)
    );

    if (!NoteToUpdate) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    // Update the Note details
    NoteToUpdate.P_DESCRIPTION = P_DESCRIPTION;
    NoteToUpdate.P_DATE_CONTACTED = formattedContactedDate;
    NoteToUpdate.P_ADDEDFROM = P_ADDEDFROM;
    NoteToUpdate.P_DATEUPDATED = formattedUpdatedDate;

    await existingNote.save();

    // Call the schema method to sync the updated Note
    await existingNote.syncToExternalAPI(NoteToUpdate, P_REL_ID, P_REL_TYPE);

    return NextResponse.json(
      { message: "Note updated successfully", data: existingNote },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating Note:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
