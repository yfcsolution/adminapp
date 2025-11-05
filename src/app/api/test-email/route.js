import { NextResponse } from 'next/server';
import { verifyTransporters } from '@/config/email-config';
import { ilmEmailService, yfcEmailService, quranEmailService } from '@/lib/email-service';
import nodemailer from "nodemailer";

export async function GET() {
  try {
    // Test all SMTP connections (NEW FUNCTIONALITY)
    await verifyTransporters();
    
    return NextResponse.json({
      message: 'Email services tested successfully',
      services: ['ilmulquran.com', 'yfcampus.com', 'quranonlinetutoring.com'],
      status: 'operational',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Email service test failed', 
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { 
      provider = 'ilm', 
      to, 
      subject = 'Test Email', 
      content = 'This is a test email',
      // Your existing test parameters
      leadId, 
      familyId,
      // New parameters for your existing test form
      testForm = false, // Flag to use your original test form
      fullName = "Test User",
      email = "testuser@example.com", 
      phoneNo = "+123456789",
      country = "Testland",
      state = "Test State", 
      timeZone = "UTC+5",
      currency = "USD",
      remarks = "This is a test submission",
      leadIp = "192.168.1.1",
      requestForm = "Test Form"
    } = body;

    // If testForm flag is true, use your original test form logic
    if (testForm) {
      return await sendOriginalTestForm({
        fullName, email, phoneNo, country, state, timeZone, 
        currency, remarks, leadIp, requestForm
      });
    }

    // NEW: Multi-provider email sending
    let service;
    switch (provider) {
      case 'yfc':
        service = yfcEmailService;
        break;
      case 'quran':
        service = quranEmailService;
        break;
      case 'gmail': // Keep your original Gmail option
        return await sendGmailTest({ to, subject, content });
      default:
        service = ilmEmailService;
    }

    const result = await service.sendEmail({
      to: to || email, // Use provided 'to' or fallback to test email
      subject,
      mail: content,
      leadId,
      familyId
    });

    return NextResponse.json({
      message: 'Test email sent successfully',
      provider: service.provider,
      result,
      success: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test email failed:', error);
    return NextResponse.json(
      { 
        error: 'Test email failed', 
        details: error.message,
        provider: body.provider || 'unknown'
      },
      { status: 500 }
    );
  }
}

// Your original test form function (preserved)
async function sendOriginalTestForm(formData) {
  const {
    fullName, email, phoneNo, country, state, timeZone,
    currency, remarks, leadIp, requestForm
  } = formData;

  // Your original Gmail transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dafiyahilmulquran@gmail.com",
      pass: "vash ribg ihua wyqo",
    },
  });

  const trackingId = Math.random().toString(36).substring(7);
  const mailOptions = {
    from: "admin@ilmulquran.com",
    to: "dafiyahilmulquran@gmail.com",
    replyTo: "ijazwakeel.dev@gmail.com",
    subject: "Test Form Submission",
    html: `
      <h1>Test Form Submission</h1>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone Number:</strong> ${phoneNo}</p>
      <p><strong>Country:</strong> ${country}</p>
      <p><strong>State:</strong> ${state}</p>
      <p><strong>Time Zone:</strong> ${timeZone}</p>
      <p><strong>Currency:</strong> ${currency}</p>
      <p><strong>Remarks:</strong> ${remarks}</p>
      <p><strong>IP Address:</strong> ${leadIp}</p>
      <p><strong>Request Form:</strong> ${requestForm}</p>
      <p><strong>Tracking ID:</strong> ${trackingId}</p>
    `,
  };

  const response = await transporter.sendMail(mailOptions);
  console.log("response is", response);

  return NextResponse.json(
    { 
      message: "Test form email sent successfully!",
      trackingId,
      method: "original-gmail"
    },
    { status: 200 }
  );
}

// Your original Gmail test function (preserved)
async function sendGmailTest({ to, subject, content }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dafiyahilmulquran@gmail.com",
      pass: "vash ribg ihua wyqo",
    },
  });

  const mailOptions = {
    from: "admin@ilmulquran.com",
    to: to || "dafiyahilmulquran@gmail.com",
    replyTo: "ijazwakeel.dev@gmail.com",
    subject: subject || "Test Email",
    html: content || "<p>This is a test email</p>",
  };

  const response = await transporter.sendMail(mailOptions);

  return NextResponse.json({
    message: "Gmail test email sent successfully!",
    response: {
      messageId: response.messageId,
      accepted: response.accepted
    },
    provider: "gmail",
    success: true
  });
}
