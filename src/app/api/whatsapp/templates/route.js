// API Routes for WhatsApp Templates Management
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import WhatsAppTemplate from "@/models/WhatsAppTemplate";

// GET - List all templates
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");

    let query = {};
    if (isActive !== null) {
      query.isActive = isActive === "true";
    }

    const templates = await WhatsAppTemplate.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST - Create new template
export async function POST(req) {
  try {
    await connectDB();

    const { templateName, templateId, description, exampleArr, mediaUri } =
      await req.json();

    if (!templateName || !templateId) {
      return NextResponse.json(
        {
          success: false,
          error: "Template name and template ID are required",
        },
        { status: 400 }
      );
    }

    // Check if template already exists
    const existing = await WhatsAppTemplate.findOne({
      $or: [{ templateName }, { templateId }],
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Template with this name or ID already exists",
        },
        { status: 400 }
      );
    }

    const template = await WhatsAppTemplate.create({
      templateName,
      templateId,
      description: description || "",
      exampleArr: exampleArr || [],
      mediaUri: mediaUri || null,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Template created successfully",
        data: template,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
