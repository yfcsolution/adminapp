// src/middleware/auth_middleware.js
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Student from "@/models/Student";

export const verifyJWT = async (req) => {
  try {
    // Await the cookies method to ensure it resolves properly
    const cookieStore = await cookies(); // Ensure to await
    const token = cookieStore.get("accessToken")?.value; // No need to await get()

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized request" },
        { status: 401 }
      );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid access token" },
        { status: 401 }
      );
    }

    // Enforce IP + User-Agent binding for the session
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "Unknown";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    if (
      user.lastIp &&
      user.lastUserAgent &&
      (user.lastIp !== ipAddress || user.lastUserAgent !== userAgent)
    ) {
      return NextResponse.json(
        {
          message:
            "Your session has expired due to a change in browser or IP. Please login again.",
        },
        { status: 401 }
      );
    }

    // Attach user info to the request object for further use in the handler
    req.user = user;
    return null; // If authenticated, return null to allow the request to proceed
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid access token" },
      { status: 401 }
    );
  }
};

// student authentication moiddlewRE
export const stdVerifyJWT = async (req) => {
  try {
    // Await the cookies method to ensure it resolves properly
    const cookieStore = await cookies(); // Ensure to await
    const token = cookieStore.get("stdAccessToken")?.value; // No need to await get()

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized request" },
        { status: 401 }
      );
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const student = await Student.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!student) {
      return NextResponse.json(
        { message: "Invalid access token" },
        { status: 401 }
      );
    }

    // Attach user info to the request object for further use in the handler
    req.user = student;
    return null; // If authenticated, return null to allow the request to proceed
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid access token" },
      { status: 401 }
    );
  }
};
