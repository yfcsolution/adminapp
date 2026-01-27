// API Route for Auto-Send Configuration
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import AutoSendConfig from "@/models/AutoSendConfig";

// GET - Get auto-send configuration
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // whatsapp or email

    let query = {};
    if (type) {
      query.type = type;
    }

    const configs = await AutoSendConfig.find(query).lean();

    return NextResponse.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    console.error("Error fetching auto-send config:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create or update auto-send configuration
export async function POST(req) {
  try {
    await connectDB();

    const {
      type,
      enabled,
      templateName,
      templateId,
      exampleArr,
      mediaUri,
      subject,
      body,
      token,
    } = await req.json();

    if (!type || !["whatsapp", "email"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Type must be 'whatsapp' or 'email'",
        },
        { status: 400 }
      );
    }

    // Find existing config or create new
    let config = await AutoSendConfig.findOne({ type });

    if (config) {
      // Update existing
      if (enabled !== undefined) config.enabled = enabled;
      if (templateName !== undefined) config.templateName = templateName;
      if (templateId !== undefined) config.templateId = templateId;
      if (exampleArr !== undefined) config.exampleArr = exampleArr;
      if (mediaUri !== undefined) config.mediaUri = mediaUri;
      if (subject !== undefined) config.subject = subject;
      if (body !== undefined) config.body = body;
      if (token !== undefined) config.token = token;

      await config.save();
    } else {
      // Create new
      config = await AutoSendConfig.create({
        type,
        enabled: enabled || false,
        templateName: templateName || null,
        templateId: templateId || null,
        exampleArr: exampleArr || [],
        mediaUri: mediaUri || null,
        subject: subject || null,
        body: body || null,
        token: token || null,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Auto-send configuration updated",
      data: config,
    });
  } catch (error) {
    console.error("Error updating auto-send config:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
