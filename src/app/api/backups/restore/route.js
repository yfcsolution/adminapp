import { exec } from "child-process-promise";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { google } from "googleapis";
import { NextResponse } from "next/server";

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

  let tempFile = "";
  try {
    // Setup temp directory
    const tempDir = path.join(os.tmpdir(), "mongodb-restores");
    await fs.ensureDir(tempDir);
    tempFile = path.join(tempDir, `restore-${Date.now()}.gz`);

    // Download from Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });
    const dest = fs.createWriteStream(tempFile);

    await drive.files
      .get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "stream" }
      )
      .then(
        (res) =>
          new Promise((resolve, reject) => {
            res.data.on("end", resolve).on("error", reject).pipe(dest);
          })
      );

    // Restore to MongoDB
    await exec(
      `mongorestore --uri="${process.env.MONGO_URI}" --archive=${tempFile} --gzip --drop`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (tempFile) await fs.remove(tempFile).catch(console.error);
  }
}
