import { NextResponse } from "next/server";
import Email from "@/models/Emails";
import connectDB from "@/config/db";

export async function GET(request) {
  await connectDB();
  console.log("Tracking route started");

  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");
    console.log("Received messageId:", messageId);

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId parameter is required" },
        { status: 400 }
      );
    }

    const emailRecord = await Email.findOne({
      "emails.messageId": messageId,
    });

    if (!emailRecord) {
      console.log("No matching email found for messageId:", messageId);
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    const updated = await Email.updateOne(
      {
        _id: emailRecord._id,
        "emails.messageId": messageId,
      },
      {
        $set: { "emails.$.opened": true, "emails.$.openedAt": new Date() },
      }
    );

    if (updated.modifiedCount === 0) {
      console.log("No email updated for messageId:", messageId);
    }

    console.log("Email opened status updated for messageId:", messageId);

    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    return new Response(pixel, {
      headers: {
        "Content-Type": "image/gif",
        "Content-Length": pixel.length.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error in email tracking:", error);
    return NextResponse.json(
      { error: "Failed to track email" },
      { status: 500 }
    );
  }
}
