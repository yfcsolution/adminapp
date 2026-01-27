// API Routes for Single WhatsApp Template Operations
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import WhatsAppTemplate from "@/models/WhatsAppTemplate";

// GET - Get single template
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const template = await WhatsAppTemplate.findById(id).lean();

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Template not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT - Update template
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { templateName, templateId, description, exampleArr, mediaUri, isActive } =
      await req.json();

    const template = await WhatsAppTemplate.findById(id);

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Template not found",
        },
        { status: 404 }
      );
    }

    // Update fields
    if (templateName) template.templateName = templateName;
    if (templateId) template.templateId = templateId;
    if (description !== undefined) template.description = description;
    if (exampleArr !== undefined) template.exampleArr = exampleArr;
    if (mediaUri !== undefined) template.mediaUri = mediaUri;
    if (isActive !== undefined) template.isActive = isActive;

    await template.save();

    return NextResponse.json({
      success: true,
      message: "Template updated successfully",
      data: template,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const template = await WhatsAppTemplate.findByIdAndDelete(id);

    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Template not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Template deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
