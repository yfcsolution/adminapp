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

    // Mail Options
    const mailOptions = {
      from: "admin@ilmulquran.com",
      to: "dafiyahilmulquran@gmail.com",
      replyTo: "ijazwakeel.dev@gmail.com",
      subject: "Test Form Submission",
      html: `
        <h1>Test Form Submission</h1>
        <p><strong>Full Name:</strong> ${FULL_NAME}</p>
        <p><strong>Email:</strong> ${EMAIL}</p>
        <p><strong>Phone Number:</strong> ${PHONE_NO}</p>
        <p><strong>Country:</strong> ${COUNTRY}</p>
        <p><strong>State:</strong> ${STATE}</p>
        <p><strong>Time Zone:</strong> ${TIME_ZONE}</p>
        <p><strong>Currency:</strong> ${CURRENCY}</p>
        <p><strong>Remarks:</strong> ${REMARKS}</p>
        <p><strong>IP Address:</strong> ${LEAD_IP}</p>
        <p><strong>Request Form:</strong> ${REQUEST_FORM}</p>
      `,
    };

    // Send email
    const response = await transporter.sendMail(mailOptions);
    console.log("response is", response);

    return Response.json(
      { message: "Test email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending failed:", error);
    return Response.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
