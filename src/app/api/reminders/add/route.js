import { NextResponse } from "next/server";
import Reminders from "@/models/Reminders";
import connectDB from "@/config/db";

// Function to format date as DD-MMM-YYYY
const formatDate = (date) => {
  if (!date) return null;
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString("en-GB", options).toUpperCase();
};

// Function to format datetime as DD-MMM-YYYY HH:mm:ss A
const formatDateTime = (dateTime) => {
  if (!dateTime) return null;
  const date = new Date(dateTime);
  const formattedDate = date
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

  const hours = date.getHours() % 12 || 12; // Convert 24h to 12h format
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const amPm = date.getHours() >= 12 ? "PM" : "AM";

  return `${formattedDate} ${hours}:${minutes} ${amPm}`;
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
      P_NOTIFY_BY_SMS_CLIENT,
      P_STARTDATE,
    } = await req.json();

    if (!P_REL_ID || !P_REL_TYPE || !P_DESCRIPTION) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format the dates
    const formattedDate = formatDateTime(P_DATE);
    const formattedStartDate = formatDateTime(P_STARTDATE);
    console.log("formatted date is", formattedDate, "and", formattedStartDate);

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
        P_NOTIFY_BY_SMS_CLIENT,
        P_STARTDATE: formattedStartDate,
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
          P_NOTIFY_BY_SMS_CLIENT,
          P_STARTDATE: formattedStartDate,
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
