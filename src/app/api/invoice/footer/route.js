// app/api/invoice-footer/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import InvoiceFooter from "@/models/InvoiceFooter";

// GET request to fetch footer info
export async function GET() {
  await connectDB();
  try {
    const footer = await InvoiceFooter.findOne();
    return NextResponse.json(footer || {});
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch footer data",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST request to create new footer info
export async function POST(req) {
  await connectDB();
  const data = await req.json();

  try {
    // Check if footer already exists
    const existingFooter = await InvoiceFooter.findOne();
    if (existingFooter) {
      return NextResponse.json(
        {
          success: false,
          message: "Footer already exists. Use PUT to update instead.",
        },
        { status: 400 }
      );
    }

    const footer = new InvoiceFooter(data);
    await footer.save();
    return NextResponse.json({ success: true, footer }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create footer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// PUT request to update footer info
export async function PUT(req) {
  await connectDB();
  const data = await req.json();

  try {
    let footer = await InvoiceFooter.findOne();
    if (!footer) {
      footer = new InvoiceFooter(data);
    } else {
      Object.assign(footer, data);
    }

    await footer.save();
    return NextResponse.json({ success: true, footer });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update footer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE request to remove footer info
export async function DELETE() {
  await connectDB();
  try {
    const result = await InvoiceFooter.deleteOne();
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "No footer found to delete" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete footer",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
