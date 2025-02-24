import { NextResponse } from "next/server";
import Reminders from "@/models/Reminders";
import connectDB from "@/config/db";
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
      P_DATE,
      P_ISNOTIFIED,
      P_STAFF,
      P_NOTIFY_BY_EMAIL,
      P_CREATOR,
      P_CUSTOMER,
      P_CONTACT,
      P_ASSIGNED_TO,
    } = await req.json();

    if (!P_REL_ID || !P_REL_TYPE || !P_DESCRIPTION) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format the dates
    const formattedDate = formatDate(P_DATE);
    const formattedAddedDate = formatDate(new Date());

    let existingReminder = await Reminders.findOne({ P_REL_ID, P_REL_TYPE });

    let newReminder;

    if (existingReminder) {
      // Add new reminder to the Reminders array
      newReminder = {
        P_DESCRIPTION,
        P_DATE: formattedDate,
        P_ISNOTIFIED,
        P_STAFF,
        P_NOTIFY_BY_EMAIL,
        P_CREATOR,
        P_CUSTOMER,
        P_CONTACT,
        P_ASSIGNED_TO,
      };

      existingReminder.Reminders.push(newReminder);
      await existingReminder.save();

      // Fetch the updated document to get the correct _id
      const updatedReminder = await Reminders.findById(existingReminder._id);
      const lastReminder =
        updatedReminder.Reminders[updatedReminder.Reminders.length - 1];

      // Call the schema method to sync (passing P_REL_ID and P_REL_TYPE)
      await updatedReminder.syncToExternalAPI(
        lastReminder,
        P_REL_ID,
        P_REL_TYPE
      );

      return NextResponse.json(
        { message: "Reminder added successfully", data: updatedReminder },
        { status: 200 }
      );
    }

    // If no existing document, create a new one
    const newRecord = new Reminders({
      P_REL_ID,
      P_REL_TYPE,
      Reminders: [
        {
          P_DESCRIPTION,
          P_DATE: formattedDate,
          P_ISNOTIFIED,
          P_STAFF,
          P_NOTIFY_BY_EMAIL,
          P_CREATOR,
          P_CUSTOMER,
          P_CONTACT,
          P_ASSIGNED_TO,
        },
      ],
    });

    await newRecord.save();

    // Fetch the newly created document to get the correct _id
    const savedRecord = await Reminders.findById(newRecord._id);
    const lastReminder =
      savedRecord.Reminders[savedRecord.Reminders.length - 1];

    // Call the schema method to sync (passing P_REL_ID and P_REL_TYPE)
    await savedRecord.syncToExternalAPI(lastReminder, P_REL_ID, P_REL_TYPE);

    return NextResponse.json(
      { message: "New reminder created", data: savedRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding reminder:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
