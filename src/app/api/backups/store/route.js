// app/api/backup/route.ts
import { exec } from 'child-process-promise';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // 1. Authentication
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${process.env.BACKUP_SECRET}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid or missing token' },
      { status: 401 }
    );
  }

  // 2. Validate environment variables
  if (!process.env.MONGO_URI || !process.env.GOOGLE_SERVICE_ACCOUNT || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server misconfigured: Missing required environment variables' 
      },
      { status: 500 }
    );
  }

  let backupFile = '';
  try {
    // 3. Create secure temp directory
    const tempDir = path.join(os.tmpdir(), 'mongodb-backups');
    await fs.ensureDir(tempDir);
    
    // 4. Generate timestamped backup filename
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_');
    backupFile = path.join(tempDir, `mongobackup-${timestamp}.gz`);

    // 5. Execute mongodump with error handling
    console.log(`Starting MongoDB backup to: ${backupFile}`);
    await exec(`mongodump --uri="${process.env.MONGO_URI}" --archive=${backupFile} --gzip`);
    console.log('MongoDB backup completed successfully');

    // 6. Authenticate with Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    // 7. Upload to Google Drive
    const drive = google.drive({ version: 'v3', auth });
    console.log('Starting Google Drive upload...');
    
    const response = await drive.files.create({
      requestBody: {
        name: `mongobackup-${timestamp}.gz`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
        description: `Automated MongoDB backup created on ${new Date().toISOString()}`
      },
      media: {
        mimeType: 'application/gzip',
        body: fs.createReadStream(backupFile),
      },
      fields: 'id,name,webViewLink'
    });

    console.log(`Upload successful. File ID: ${response.data.id}`);

    // 8. Return success response
    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      fileUrl: response.data.webViewLink,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Backup process failed:', error);

    // Detailed error response
    const errorResponse = {
      success: false,
      error: error.message || 'Unknown error occurred',
      details: {
        mongodbUri: process.env.MONGO_URI ? 'Configured' : 'Missing',
        backupFile: backupFile || 'Not created',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };

    return NextResponse.json(errorResponse, { status: 500 });
  } finally {
    // 9. Cleanup: Delete temporary backup file if it exists
    if (backupFile && fs.existsSync(backupFile)) {
      try {
        await fs.unlink(backupFile);
        console.log('Temporary backup file cleaned up');
      } catch (cleanupError) {
        console.error('Failed to clean up backup file:', cleanupError);
      }
    }
  }
}

// Explicitly handle unsupported methods
export const GET = () => NextResponse.json(
  { success: false, error: 'Method not allowed' },
  { status: 405 }
);

export const PUT = () => NextResponse.json(
  { success: false, error: 'Method not allowed' },
  { status: 405 }
);

export const DELETE = () => NextResponse.json(
  { success: false, error: 'Method not allowed' },
  { status: 405 }
);