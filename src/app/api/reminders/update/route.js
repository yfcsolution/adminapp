import { NextResponse } from "next/server";
import mongoose from "mongoose";
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

  return `${formattedDate} ${hours}:${minutes}: ${amPm}`;
};

export async function POST(req) {
  try {
    await connectDB();

    const {
      P_REL_ID,
      P_REL_TYPE,
      P_SYNC_ID, // Used to find and update the correct reminder
      P_DESCRIPTION,
      P_DATE,
      P_ISNOTIFIED,
      P_STAFF,
      P_NOTIFY_BY_EMAIL,
      P_CREATOR,
      P_CUSTOMER,
      P_CONTACT,
      P_ASSIGNED_TO,
      P_NOTIFY_BY_SMS_CLIENT, // ✅ New field added
      P_STARTDATE, // ✅ New field added
    } = await req.json();

    if (!P_REL_ID || !P_REL_TYPE || !P_SYNC_ID) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Format date values
    const formattedDate = formatDateTime(P_DATE);
    const formattedStartDate = formatDateTime(P_STARTDATE);

    // Find the existing reminder document
    let existingReminder = await Reminders.findOne({ P_REL_ID, P_REL_TYPE });

    if (!existingReminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    // Convert P_SYNC_ID to ObjectId
    const objectIdSyncId = new mongoose.Types.ObjectId(P_SYNC_ID);

    // Find the specific reminder in the array
    let reminderIndex = existingReminder.Reminders.findIndex((reminder) =>
      reminder._id.equals(objectIdSyncId)
    );

    if (reminderIndex === -1) {
      return NextResponse.json(
        { error: "Reminder entry not found" },
        { status: 404 }
      );
    }

    // Update only the provided fields without modifying _id
    let reminderToUpdate = existingReminder.Reminders[reminderIndex];

    reminderToUpdate.P_DESCRIPTION =
      P_DESCRIPTION ?? reminderToUpdate.P_DESCRIPTION;
    reminderToUpdate.P_DATE = formattedDate ?? reminderToUpdate.P_DATE;
    reminderToUpdate.P_ISNOTIFIED =
      P_ISNOTIFIED ?? reminderToUpdate.P_ISNOTIFIED;
    reminderToUpdate.P_STAFF = P_STAFF ?? reminderToUpdate.P_STAFF;
    reminderToUpdate.P_NOTIFY_BY_EMAIL =
      P_NOTIFY_BY_EMAIL ?? reminderToUpdate.P_NOTIFY_BY_EMAIL;
    reminderToUpdate.P_CREATOR = P_CREATOR ?? reminderToUpdate.P_CREATOR;
    reminderToUpdate.P_CUSTOMER = P_CUSTOMER ?? reminderToUpdate.P_CUSTOMER;
    reminderToUpdate.P_CONTACT = P_CONTACT ?? reminderToUpdate.P_CONTACT;
    reminderToUpdate.P_ASSIGNED_TO =
      P_ASSIGNED_TO ?? reminderToUpdate.P_ASSIGNED_TO;
    reminderToUpdate.P_NOTIFY_BY_SMS_CLIENT =
      P_NOTIFY_BY_SMS_CLIENT ?? reminderToUpdate.P_NOTIFY_BY_SMS_CLIENT;
    reminderToUpdate.P_STARTDATE =
      formattedStartDate ?? reminderToUpdate.P_STARTDATE;

    // Save the updated document
    await existingReminder.save();

    // Sync updated reminder to external API
    await existingReminder.syncToExternalAPI(
      existingReminder.Reminders[reminderIndex],
      P_REL_ID,
      P_REL_TYPE
    );

    return NextResponse.json(
      { message: "Reminder updated successfully", data: existingReminder },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating reminder:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
