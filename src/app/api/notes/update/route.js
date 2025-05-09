import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/config/db";
import Notes from "@/models/Notes";

// Function to format date as DD-MMM-YYYY HH:MM am/pm (e.g., 28-Apr-2025 07:45 pm)
const formatDate = (date) => {
  if (!date) return null;
  const dt = new Date(date);
  
  // Get day part (two digits)
  const day = dt.getDate().toString().padStart(2, '0');
  
  // Get month abbreviation (title case)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[dt.getMonth()];
  
  // Get full year
  const year = dt.getFullYear();
  
  // Get hours and minutes in 12-hour format with am/pm
  let hours = dt.getHours();
  const minutes = dt.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours.toString() : '12'; // the hour '0' should be '12'
  
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
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