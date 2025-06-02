import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("Im running the list backups API");

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.list({
      q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      fields: "files(id, name, createdTime, description, webViewLink)",
      orderBy: "createdTime desc",
    });

    return NextResponse.json({
      success: true,
      backups: response.data.files,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
