import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(request) {
  // Authentication check
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.BACKUP_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // 1. Authenticate with Google Drive using environment variables
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
      },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    // 2. List all backup files in the specified folder
    const response = await drive.files.list({
      q: `'${
        process.env.GOOGLE_DRIVE_FOLDER_ID.split("?")[0]
      }' in parents and mimeType='application/json'`,
      fields:
        "files(id, name, createdTime, modifiedTime, size, description, webViewLink)",
      orderBy: "createdTime desc",
    });

    // 3. Format the response
    const backups = response.data.files.map((file) => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      size: file.size,
      description: file.description,
      url: file.webViewLink,
    }));

    return NextResponse.json({
      success: true,
      backups: backups,
      count: backups.length,
    });
  } catch (error) {
    console.error("Failed to list backups:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
