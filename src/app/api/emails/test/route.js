import nodemailer from "nodemailer";

export async function POST() {
  try {
    // Test Data
    const FULL_NAME = "Test User";
    const EMAIL = "testuser@example.com";
    const PHONE_NO = "+123456789";
    const COUNTRY = "Testland";
    const STATE = "Test State";
    const TIME_ZONE = "UTC+5";
    const CURRENCY = "USD";
    const REMARKS = "This is a test submission";
    const LEAD_IP = "192.168.1.1";
    const REQUEST_FORM = "Test Form";

    // Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dafiyahilmulquran@gmail.com", // Your email
        pass: "vash ribg ihua wyqo", // App password
      },
    });
    const trackingId = Math.random().toString(36).substring(7); // Unique ID
    // Mail Options
    const mailOptions = {
      from: "dafiyahilmulquran@gmail.com",
      to: "ijazwakeel.dev@gmail.com",
      subject: "Test Form Submission",
      html: `
          <h1>Test Form Submission</h1>
          <!-- Hidden Tracking Pixel -->
<img src="https://imul-quaran-testing.vercel.app/api/emails/track?trackingId=${trackingId}" width="10" height="10" />
        `,
    };
    // Send email
    const response = await transporter.sendMail(mailOptions);

    console.log("Full response:", response);

    return Response.json(
      {
        message: "Test email sent successfully!",
        response, // Returning full response
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending failed:", error);
    return Response.json(
      { error: "Failed to send test email", details: error.message },
      { status: 500 }
    );
  }
}
