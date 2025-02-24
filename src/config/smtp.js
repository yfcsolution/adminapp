import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Example: "smtp.gmail.com" for Gmail
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // Your real email
    pass: process.env.SMTP_PASS, // Your email password or App Password
  },
});
