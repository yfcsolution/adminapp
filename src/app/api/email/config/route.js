// Email Configuration API
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import EmailConfig from "@/models/EmailConfig";

// GET - Get email configuration
export async function GET(req) {
  try {
    await connectDB();

    const config = await EmailConfig.findOne({ isActive: true }).lean();

    if (!config) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No email configuration found",
      });
    }

    // Don't send password in response
    const { smtpPassword, ...safeConfig } = config;

    return NextResponse.json({
      success: true,
      data: config, // Include password for editing (admin only)
    });
  } catch (error) {
    console.error("Error fetching email config:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create or update email configuration
export async function POST(req) {
  try {
    await connectDB();

    const {
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPassword,
      tlsRejectUnauthorized,
      isActive,
    } = await req.json();

    // Validate required fields
    if (!smtpHost || !smtpUser || !smtpPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "SMTP Host, User, and Password are required",
        },
        { status: 400 }
      );
    }

    // Deactivate all existing configs if this one is active
    if (isActive) {
      await EmailConfig.updateMany(
        { isActive: true },
        { isActive: false }
      );
    }

    // Find existing active config or create new
    let config = await EmailConfig.findOne({ isActive: true });

    if (config) {
      // Update existing
      config.smtpHost = smtpHost;
      config.smtpPort = smtpPort || 587;
      config.smtpSecure = smtpSecure || false;
      config.smtpUser = smtpUser;
      config.smtpPassword = smtpPassword;
      config.tlsRejectUnauthorized = tlsRejectUnauthorized !== false;
      config.isActive = isActive !== false;

      await config.save();
    } else {
      // Create new
      config = await EmailConfig.create({
        smtpHost,
        smtpPort: smtpPort || 587,
        smtpSecure: smtpSecure || false,
        smtpUser,
        smtpPassword,
        tlsRejectUnauthorized: tlsRejectUnauthorized !== false,
        isActive: isActive !== false,
      });
    }

    // Don't send password in response
    const { smtpPassword: _, ...safeConfig } = config.toObject();

    return NextResponse.json({
      success: true,
      message: "Email configuration saved successfully",
      data: safeConfig,
    });
  } catch (error) {
    console.error("Error saving email config:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
