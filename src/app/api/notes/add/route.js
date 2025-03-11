import { NextResponse } from "next/server";
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
      P_DESCRIPTION,
      P_DATE_CONTACTED,
      P_ADDEDFROM,
    } = await req.json();

    if (!P_REL_ID || !P_REL_TYPE || !P_DESCRIPTION) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format the dates
    const formattedContactedDate = formatDate(P_DATE_CONTACTED);
    const formattedAddedDate = formatDate(new Date());

    let existingNote = await Notes.findOne({ P_REL_ID, P_REL_TYPE });

    let newNote;

    if (existingNote) {
      // Add new Note to the Notes array
      newNote = {
        P_DESCRIPTION,
        P_DATE_CONTACTED: formattedContactedDate,
        P_ADDEDFROM,
        P_DATEADDED: formattedAddedDate,
      };

      existingNote.Notes.push(newNote);
      await existingNote.save();

      // Fetch the updated document to get the correct _id
      const updatedNote = await Notes.findById(existingNote._id);
      const lastNote = updatedNote.Notes[updatedNote.Notes.length - 1];

      // Call the schema method to sync (passing P_REL_ID and P_REL_TYPE)
      await updatedNote.syncToExternalAPI(lastNote, P_REL_ID, P_REL_TYPE);

      return NextResponse.json(
        { message: "Note added successfully", data: updatedNote },
        { status: 200 }
      );
    }

    // If no existing document, create a new one
    const newRecord = new Notes({
      P_REL_ID,
      P_REL_TYPE,
      Notes: [
        {
          P_DESCRIPTION,
          P_DATE_CONTACTED: formattedContactedDate,
          P_ADDEDFROM,
          P_DATEADDED: formattedAddedDate,
        },
      ],
    });

    await newRecord.save();

    // Fetch the newly created document to get the correct _id
    const savedRecord = await Notes.findById(newRecord._id);
    const lastNote = savedRecord.Notes[savedRecord.Notes.length - 1];

    // Call the schema method to sync (passing P_REL_ID and P_REL_TYPE)
    await savedRecord.syncToExternalAPI(lastNote, P_REL_ID, P_REL_TYPE);

    return NextResponse.json(
      { message: "New Note created", data: savedRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding Note:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
