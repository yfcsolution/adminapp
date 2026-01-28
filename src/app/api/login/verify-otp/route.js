import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";
import LoginOtp from "@/models/LoginOtp";

// Local helpers for token generation (mirrors authController logic)
const accessTokenOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 15 * 60, // 15 minutes
};

const refreshTokenOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

async function generateTokens(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found while generating tokens");
  }
  const accessToken = user.genrateAccessToken();
  const refreshToken = user.genrateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken, user };
}

export async function POST(req) {
  try {
    await connectDB();

    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { message: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "Unknown";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }

    // Find the most recent unused OTP for this user and code
    const otp = await LoginOtp.findOne({
      userId: user._id,
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!otp) {
      return NextResponse.json(
        { message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Optional: enforce same IP / User-Agent as when OTP was created
    if (otp.ipAddress && otp.userAgent) {
      if (otp.ipAddress !== ipAddress || otp.userAgent !== userAgent) {
        return NextResponse.json(
          {
            message:
              "Verification code does not match this browser or IP. Please login again.",
          },
          { status: 400 }
        );
      }
    }

    // Mark OTP as used
    await LoginOtp.updateOne({ _id: otp._id }, { $set: { used: true } });

    // Generate tokens and update user session metadata
    const { accessToken, refreshToken, user: loggedInUser } =
      await generateTokens(user._id);

    loggedInUser.lastIp = ipAddress;
    loggedInUser.lastUserAgent = userAgent;
    loggedInUser.lastLoginAt = new Date();
    await loggedInUser.save({ validateBeforeSave: false });

    const response = NextResponse.json(
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
        message: "User logged in successfully",
      },
      { status: 200 }
    );

    response.cookies.set("refreshToken", refreshToken, refreshTokenOptions);
    response.cookies.set("accessToken", accessToken, accessTokenOptions);

    return response;
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

