// app/api/invoice-footer/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import InvoiceFooter from "@/models/InvoiceFooter";
export async function GET() {
  await connectDB();
  try {
    const footer = await InvoiceFooter.findOne();
    console.log("footer data is :", footer);
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

export async function POST(req) {
  await connectDB();
  try {
    const data = await req.json();

    // Validate required fields if needed
    if (!data.bank || !data.contact) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

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

    // Create new footer with the complete data structure
    const footer = new InvoiceFooter({
      bank: {
        accountName: data.bank.accountName || "",
        bankName: data.bank.bankName || "",
        sortCode: data.bank.sortCode || "",
        accountNumber: data.bank.accountNumber || "",
      },
      terms: data.terms || [],
      contact: {
        email: data.contact.email || "",
        phone: {
          uk: data.contact.phone?.uk || "",
          au: data.contact.phone?.au || "",
          us: data.contact.phone?.us || "",
        },
        website: data.contact.website || "",
      },
      footerText: {
        thankYouMessage: data.footerText?.thankYouMessage || "",
        signatureMessage: data.footerText?.signatureMessage || "",
      },
    });

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

export async function PUT(req) {
  await connectDB();
  try {
    const data = await req.json();
    let footer = await InvoiceFooter.findOne();

    if (!footer) {
      // If no footer exists, create a new one (similar to POST)
      footer = new InvoiceFooter({
        bank: {
          accountName: data.bank?.accountName || "",
          bankName: data.bank?.bankName || "",
          sortCode: data.bank?.sortCode || "",
          accountNumber: data.bank?.accountNumber || "",
        },
        terms: data.terms || [],
        contact: {
          email: data.contact?.email || "",
          phone: {
            uk: data.contact?.phone?.uk || "",
            au: data.contact?.phone?.au || "",
            us: data.contact?.phone?.us || "",
          },
          website: data.contact?.website || "",
        },
        footerText: {
          thankYouMessage: data.footerText?.thankYouMessage || "",
          signatureMessage: data.footerText?.signatureMessage || "",
        },
      });
    } else {
      // Update existing footer
      footer.bank = {
        accountName: data.bank?.accountName || footer.bank.accountName,
        bankName: data.bank?.bankName || footer.bank.bankName,
        sortCode: data.bank?.sortCode || footer.bank.sortCode,
        accountNumber: data.bank?.accountNumber || footer.bank.accountNumber,
      };

      footer.terms = data.terms || footer.terms;

      footer.contact = {
        email: data.contact?.email || footer.contact.email,
        phone: {
          uk: data.contact?.phone?.uk || footer.contact.phone?.uk || "",
          au: data.contact?.phone?.au || footer.contact.phone?.au || "",
          us: data.contact?.phone?.us || footer.contact.phone?.us || "",
        },
        website: data.contact?.website || footer.contact.website,
      };

      footer.footerText = {
        thankYouMessage:
          data.footerText?.thankYouMessage || footer.footerText.thankYouMessage,
        signatureMessage:
          data.footerText?.signatureMessage ||
          footer.footerText.signatureMessage,
      };
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
