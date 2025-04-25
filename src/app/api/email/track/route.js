import { NextResponse } from "next/server";
import Email from "@/models/Emails";
import connectDB from "@/config/db";
export async function GET(request) {
  await connectDB();

  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return NextResponse.json(
        { error: "messageId parameter is required" },
        { status: 400 }
      );
    }

    // Find the email record that contains the messageId in its emails array
    const emailRecord = await Email.findOne({
      "emails.messageId": messageId,
    });

    if (!emailRecord) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Update the opened status for the specific email
    await Email.updateOne(
      {
        _id: emailRecord._id,
        "emails.messageId": messageId,
      },
      {
        $set: { "emails.$.opened": true, "emails.$.openedAt": new Date() },
      }
    );

    // Return a transparent pixel
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
