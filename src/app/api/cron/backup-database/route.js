// Cron job endpoint for hourly MongoDB backup to Google Drive
// This should be called every hour by Vercel Cron or external cron service
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { google } from "googleapis";

async function performBackup() {
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
    throw new Error(`Missing environment variables: ${missingVars.join(", ")}`);
  }

  let client;
  try {
    // MongoDB connection
    console.log("[Cron Backup] Connecting to MongoDB...");
    client = new MongoClient(process.env.MONGO_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });
    await client.connect();

    // Export data
    console.log("[Cron Backup] Exporting collections...");
    const db = client.db();
    const collections = await db.listCollections().toArray();
    const backupData = {};

    for (const collection of collections) {
      console.log(`[Cron Backup] Exporting ${collection.name}...`);
      backupData[collection.name] = await db
        .collection(collection.name)
        .find()
        .toArray();
    }

    // Google Drive authentication
    console.log("[Cron Backup] Authenticating with Google Drive...");
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
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID.split("?")[0];
    const fileName = "mongodb-backup.json";

    // Check if file already exists
    console.log(`[Cron Backup] Checking for existing backup file: ${fileName}...`);
    const existingFiles = await drive.files.list({
      q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
      fields: "files(id, name)",
    });

    let fileId;
    let response;

    if (existingFiles.data.files && existingFiles.data.files.length > 0) {
      // File exists, update it
      fileId = existingFiles.data.files[0].id;
      console.log(`[Cron Backup] Updating existing file ${fileName} (ID: ${fileId})...`);
      
      response = await drive.files.update({
        fileId: fileId,
        requestBody: {
          description: `MongoDB backup updated on ${new Date().toISOString()} (Hourly Auto-Backup)`,
        },
        media: {
          mimeType: "application/json",
          body: JSON.stringify(backupData),
        },
        fields: "id,name,webViewLink,modifiedTime",
      });
    } else {
      // File doesn't exist, create it
      console.log(`[Cron Backup] Creating new backup file: ${fileName}...`);
      response = await drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId],
          description: `MongoDB backup created on ${new Date().toISOString()} (Hourly Auto-Backup)`,
        },
        media: {
          mimeType: "application/json",
          body: JSON.stringify(backupData),
        },
        fields: "id,name,webViewLink,modifiedTime",
      });
      fileId = response.data.id;
    }

    console.log("[Cron Backup] Backup completed successfully");
    return {
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      fileUrl: response.data.webViewLink,
      timestamp: new Date().toISOString(),
      modifiedTime: response.data.modifiedTime,
      collections: collections.map((c) => c.name),
      message: existingFiles.data.files && existingFiles.data.files.length > 0 
        ? "Backup file updated successfully" 
        : "Backup file created successfully",
    };
  } catch (error) {
    console.error("[Cron Backup] Backup failed:", error);
    throw error;
  } finally {
    if (client) {
      try {
        await client.close();
        console.log("[Cron Backup] MongoDB connection closed");
      } catch (closeError) {
        console.error("[Cron Backup] Error closing MongoDB connection:", closeError);
      }
    }
  }
}

export async function GET(req) {
  try {
    // Verify cron secret if needed
    const authHeader = req.headers.get("authorization");
    const cronSecret = req.headers.get("x-cron-secret") || req.headers.get("x-vercel-cron");
    
    // Allow Vercel Cron or CRON_SECRET
    if (process.env.CRON_SECRET && !cronSecret) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const result = await performBackup();

    return NextResponse.json({
      success: true,
      message: "Hourly backup completed successfully",
      ...result,
    });
  } catch (error) {
    console.error("[Cron Backup] Error in hourly backup cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
