import { MongoClient } from "mongodb";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(request) {
  // Authorization check
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.BACKUP_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }
  // Verify environment variables
  const requiredEnvVars = [
    "MONGO_URI",
    "GOOGLE_DRIVE_FOLDER_ID",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_PROJECT_ID",
    "GOOGLE_PRIVATE_KEY_ID",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_X509_CERT_URL",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  if (missingVars.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Missing environment variables: ${missingVars.join(", ")}`,
      },
      { status: 500 }
    );
  }

  let client;
  try {
    // MongoDB connection
    console.log("Connecting to MongoDB...");
    client = new MongoClient(process.env.MONGO_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });
    await client.connect();

    // Export data
    console.log("Exporting collections...");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    const backupData = {};

    for (const collection of collections) {
      console.log(`Exporting ${collection.name}...`);
      backupData[collection.name] = await db
        .collection(collection.name)
        .find()
        .toArray();
    }

    // Google Drive authentication
    console.log("Authenticating with Google Drive...");
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
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_");
    const fileName = `mongobackup-${timestamp}.json`;
    console.log(`Uploading ${fileName} to Google Drive...`);
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID.split("?")[0]], // Remove query parameters
        description: `MongoDB backup created on ${new Date().toISOString()}`,
      },
      media: {
        mimeType: "application/json",
        body: JSON.stringify(backupData),
      },
      fields: "id,name,webViewLink",
    });

    console.log("Backup completed successfully");
    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      fileUrl: response.data.webViewLink,
      timestamp: new Date().toISOString(),
      collections: collections.map((c) => c.name),
    });
  } catch (error) {
    console.error("Backup failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details:
          process.env.NODE_ENV === "development"
            ? {
                stack: error.stack,
                env: {
                  MONGO_URI: !!process.env.MONGO_URI,
                  GOOGLE_DRIVE_FOLDER_ID: !!process.env.GOOGLE_DRIVE_FOLDER_ID,
                  GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
                  GOOGLE_CLIENT_EMAIL: !!process.env.GOOGLE_CLIENT_EMAIL,
                },
              }
            : undefined,
      },
      { status: 500 }
    );
  } finally {
    if (client) {
      try {
        await client.close();
        console.log("MongoDB connection closed");
      } catch (closeError) {
        console.error("Error closing MongoDB connection:", closeError);
      }
    }
  }
}

// Other HTTP methods
export async function GET() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405 }
  );
}
