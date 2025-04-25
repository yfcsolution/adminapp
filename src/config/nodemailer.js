import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST || "mail.ilmulquran.com", // Your SMTP host
  port: 587, // Typically 587 for TLS or 465 for SSL
  secure: false, // true for 465 (SSL), false for other ports
  auth: {
    user: process.env.EMAIL_USER || "test@ilmulquran.com", // Your domain email
    pass: process.env.EMAIL_PASSWORD || "2025@Ijaz", // Your email password
  },
  tls: {
    // You might need to adjust these based on your server's configuration
    rejectUnauthorized: false, // Set to true in production with valid certificates
  },
});
