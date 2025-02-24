// pages/api/forgot-password.js

import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import User from "@/models/User";
import { NextResponse } from "next/server"; // Import NextResponse
import { transporter } from "@/config/nodemailer";

// Named export for POST method
export async function POST(req) {
  const { email } = await req.json(); // Get email from request body using .json() method

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }
    // Generate a reset token
    const resetToken = uuidv4();

    // Set the token expiration time (1 hour from now)
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiration

    // Save the token and expiry to the user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password?token=${resetToken}`;
console.log("reset link is", resetLink);

    const mailOptions = {
      from: "admin@ilmulquran.com",
      to: email,
      subject: "Password Reset Request",
      text: `Click on this link to reset your password: ${resetLink}`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Password reset email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
