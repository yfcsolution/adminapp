import { NextResponse } from "next/server";
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

    let existingNotice = await Notices.findOne({ P_REL_ID, P_REL_TYPE });

    let newNotice;

    if (existingNotice) {
      // Add new notice to the Notices array
      newNotice = {
        P_DESCRIPTION,
        P_DATE_CONTACTED: formattedContactedDate,
        P_ADDEDFROM,
        P_DATEADDED: formattedAddedDate,
      };

      existingNotice.Notices.push(newNotice);
      await existingNotice.save();

      // Fetch the updated document to get the correct _id
      const updatedNotice = await Notices.findById(existingNotice._id);
      const lastNotice =
        updatedNotice.Notices[updatedNotice.Notices.length - 1];

      // Call the schema method to sync (passing P_REL_ID and P_REL_TYPE)
      await updatedNotice.syncToExternalAPI(lastNotice, P_REL_ID, P_REL_TYPE);

      return NextResponse.json(
        { message: "Notice added successfully", data: updatedNotice },
        { status: 200 }
      );
    }

    // If no existing document, create a new one
    const newRecord = new Notices({
      P_REL_ID,
      P_REL_TYPE,
      Notices: [
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
    const savedRecord = await Notices.findById(newRecord._id);
    const lastNotice = savedRecord.Notices[savedRecord.Notices.length - 1];

    // Call the schema method to sync (passing P_REL_ID and P_REL_TYPE)
    await savedRecord.syncToExternalAPI(lastNotice, P_REL_ID, P_REL_TYPE);

    return NextResponse.json(
      { message: "New notice created", data: savedRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding notice:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
