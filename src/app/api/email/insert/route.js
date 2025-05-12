import { NextResponse } from "next/server";
import { startEmailListener } from "@/lib/emailListener";

export async function GET() {
  console.log("[EMAIL API] Starting real-time email listener");

  try {
    // Start the email listener without saving to the database
    startEmailListener((email) => {
      console.log("[EMAIL LISTENER] New email received:");
      console.log("From:", email.from);
      console.log("To:", email.to);
      console.log("Subject:", email.subject);
      console.log("Date:", email.date);
      console.log("Body:", email.body);
    });

    return NextResponse.json(
      { message: "Email listener started" },
      { status: 200 }
    );
  } catch (err) {
    console.error("[EMAIL API] Error starting listener:", err);
    return NextResponse.json(
      { error: "Failed to start email listener" },
      { status: 500 }
    );
  }
}
