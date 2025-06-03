import { MongoClient } from "mongodb";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import stream from "stream";
import { promisify } from "util";
import zlib from "zlib";

const pipeline = promisify(stream.pipeline);

export async function POST(request) {
  const { fileId } = await request.json();

  // Authentication check
  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.BACKUP_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // 1. Authenticate with Google Drive
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

    // 2. Download the backup file
    const response = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "stream" }
    );

    // 3. Connect to MongoDB
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db();

    // 4. Process the backup file
    let backupData = "";
    const chunks = [];

    // Handle both gzipped and non-gzipped files
    await new Promise((resolve, reject) => {
      response.data
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => {
          try {
            const buffer = Buffer.concat(chunks);

            // First try to parse as JSON directly (non-gzipped)
            try {
              backupData = buffer.toString();
              JSON.parse(backupData); // Test if valid JSON
              resolve();
            } catch (jsonError) {
              // If not valid JSON, try to decompress as gzip
              zlib.gunzip(buffer, (err, decompressed) => {
                if (err) {
                  console.error(
                    "Both JSON parse and gzip decompression failed"
                  );
                  reject(err);
                } else {
                  backupData = decompressed.toString();
                  resolve();
                }
              });
            }
          } catch (error) {
            reject(error);
          }
        })
        .on("error", reject);
    });

    const data = JSON.parse(backupData);

    // 5. Restore collections
    const restoredCollections = [];
    let totalDocuments = 0;

    for (const [collectionName, documents] of Object.entries(data)) {
      try {
        await db.collection(collectionName).deleteMany({}); // Clear existing data
        if (documents.length > 0) {
          const result = await db
            .collection(collectionName)
            .insertMany(documents);
          restoredCollections.push(collectionName);
          totalDocuments += result.insertedCount;
        }
        console.log(
          `Restored ${documents.length} documents to ${collectionName}`
        );
      } catch (err) {
        console.error(`Error restoring ${collectionName}:`, err);
        throw err;
      }
    }

    return NextResponse.json({
      success: true,
      restoredCollections,
      totalDocuments,
    });
  } catch (error) {
    console.error("Restore failed:", error);
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
