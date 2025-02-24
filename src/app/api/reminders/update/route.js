import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Reminders from "@/models/Reminders";
import connectDB from "@/config/db";

const formatDate = (date) => {
  if (!date) return null;
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return new Date(date).toLocaleDateString("en-GB", options).toUpperCase();
};

export async function POST(req) {
  // ✅ Update API route
  try {
    await connectDB();

    const {
      P_REL_ID,
      P_REL_TYPE,
      P_SYNC_ID, // ✅ Used to find and update the correct reminder
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

    if (!P_REL_ID || !P_REL_TYPE || !P_SYNC_ID) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const formattedDate = formatDate(P_DATE);

    // ✅ Find the existing reminder document
    let existingReminder = await Reminders.findOne({ P_REL_ID, P_REL_TYPE });

    if (!existingReminder) {
      return NextResponse.json(
        { error: "Reminder not found" },
        { status: 404 }
      );
    }

    // ✅ Convert P_SYNC_ID to ObjectId
    const objectIdSyncId = new mongoose.Types.ObjectId(P_SYNC_ID);

    // ✅ Find the specific reminder in the array
    let reminderIndex = existingReminder.Reminders.findIndex((reminder) =>
      reminder._id.equals(objectIdSyncId)
    );

    if (reminderIndex === -1) {
      return NextResponse.json(
        { error: "Reminder entry not found" },
        { status: 404 }
      );
    }

    // ✅ Update only provided fields
    let reminderToUpdate = existingReminder.Reminders[reminderIndex];

    existingReminder.Reminders[reminderIndex] = {
      ...reminderToUpdate,
      P_DESCRIPTION: P_DESCRIPTION ?? reminderToUpdate.P_DESCRIPTION,
      P_DATE: formattedDate ?? reminderToUpdate.P_DATE,
      P_ISNOTIFIED: P_ISNOTIFIED ?? reminderToUpdate.P_ISNOTIFIED,
      P_STAFF: P_STAFF ?? reminderToUpdate.P_STAFF,
      P_NOTIFY_BY_EMAIL:
        P_NOTIFY_BY_EMAIL ?? reminderToUpdate.P_NOTIFY_BY_EMAIL,
      P_CREATOR: P_CREATOR ?? reminderToUpdate.P_CREATOR,
      P_CUSTOMER: P_CUSTOMER ?? reminderToUpdate.P_CUSTOMER,
      P_CONTACT: P_CONTACT ?? reminderToUpdate.P_CONTACT,
      P_ASSIGNED_TO: P_ASSIGNED_TO ?? reminderToUpdate.P_ASSIGNED_TO,
    };

    await existingReminder.save();

    // ✅ Sync updated reminder to external API
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
