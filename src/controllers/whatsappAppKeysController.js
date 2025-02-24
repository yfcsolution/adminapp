import WhatsappAppKeys from "@/models/WhatsappAppKeys";
import { NextResponse } from "next/server";

export const handleLeadEmails = async (req) => {
  try {
    // Extract appKey and optionally appKeyId from the request body
    const { appKey } = await req.json();

    // Validate that appKey is provided
    if (!appKey) {
      return NextResponse.json(
        { message: "App key is required" },
        { status: 400 }
      );
    }

    // Create a new WhatsappAppKeys document
    const newAppKey = new WhatsappAppKeys({
      appKeyId: appKeyId || undefined, // appKeyId will be auto-assigned if not provided
      appKey,
    });

    // Save the document to the database
    await newAppKey.save();

    // Respond with success
    return NextResponse.json(
      { message: "App key saved successfully", data: newAppKey },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving app key:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
};
