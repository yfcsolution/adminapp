import { NextResponse } from "next/server";
import Student from "@/models/Student";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import StudentLoginAttempt from "@/models/StudentLoginAttemptSchema";
const accessTokenOptions = {
  httpOnly: true,
  secure: true, // Only send cookie over HTTPS
  sameSite: "Strict", // Prevent cross-site request forgery
  maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
};
const refreshTokenOptions = {
  httpOnly: true,
  secure: true, // Only send cookie over HTTPS
  sameSite: "Strict", // Prevent cross-site request forgery
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

const genrateAccessAndRefreshTokens = async (userId) => {
  try {
    const student = await Student.findById(userId);
    const accessToken = student.genrateAccessToken();
    const refreshToken = student.genrateRefreshToken();
    student.refreshToken = refreshToken;
    await student.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Something went wrong while genrating refresh and acces tokens",
      },
      { status: 500 }
    );
  }
};

export const registerStudent = async (req) => {
  const {
    is_primary,
    firstname,
    lastname,
    email,
    phonenumber,
    title,
    datecreated,
    password,
    new_pass_key,
    new_pass_key_requested,
    email_verified_at,
    email_verification_key,
    email_verification_sent_at,
    last_ip,
    last_login,
    last_password_change,
    active,
    profile_image,
    direction,
    refreshToken,
    invoice_emails,
    estimate_emails,
    credit_note_emails,
    contract_emails,
    task_emails,
    project_emails,
    ticket_emails,
  } = await req.json();

  // Check for empty fields
  if ([email, password].some((field) => field?.trim() === "")) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  // Check if user already exists
  const existedUser = await Student.findOne({ email });
  if (existedUser) {
    return NextResponse.json(
      { message: "User with this email already exists" },
      { status: 409 }
    );
  }

  // Create new user with auto-increment 'id' and 'userId'
  try {
    const user = await Student.create({
      is_primary,
      firstname,
      lastname,
      email: email.toLowerCase(),
      phonenumber,
      title,
      datecreated,
      password,
      new_pass_key,
      new_pass_key_requested,
      email_verified_at,
      email_verification_key,
      email_verification_sent_at,
      last_ip,
      last_login,
      last_password_change,
      active,
      profile_image,
      direction,
      refreshToken,
      invoice_emails,
      estimate_emails,
      credit_note_emails,
      contract_emails,
      task_emails,
      project_emails,
      ticket_emails,
    });

    // Check if user creation was successful
    if (!user) {
      return NextResponse.json(
        { message: "Something went wrong while registering the user" },
        { status: 500 }
      );
    }

    // Respond with success message
    return NextResponse.json(
      { message: "Student registered successfully", userId: user.userId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong while registering the user",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const loginStudent = async (req) => {
  try {
    const { email, password } = await req.json();

    // Extract IP address and User-Agent from headers (adjust as needed)
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("cf-connecting-ip") ||
      req.socket?.remoteAddress ||
      "Unknown";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    if (!email) {
      await StudentLoginAttempt.create({
        email,
        ipAddress,
        userAgent,
        status: "failed",
        reason: "Email required",
      });
      return NextResponse.json({ message: "Email required" }, { status: 400 });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      await StudentLoginAttempt.create({
        email,
        ipAddress,
        userAgent,
        status: "failed",
        reason: "Student does not exist",
      });
      return NextResponse.json(
        { message: "Student does not exist" },
        { status: 404 }
      );
    }

    const isPasswordValid = await student.isPasswordCorrect(password);
    if (!isPasswordValid) {
      await StudentLoginAttempt.create({
        studentId: student._id,
        email,
        ipAddress,
        userAgent,
        status: "failed",
        reason: "Invalid student credentials",
      });
      return NextResponse.json(
        { message: "Invalid student credentials" },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
      student._id
    );
    const loggedInStudent = await Student.findById(student._id);

    // Log successful login
    await StudentLoginAttempt.create({
      studentId: student._id,
      email,
      ipAddress,
      userAgent,
      status: "success",
    });

    const response = NextResponse.json(
      {
        student: loggedInStudent,
        stdAccessToken: accessToken,
        stdAccessRefresh: refreshToken,
        message: "Student logged In Successfully",
      },
      { status: 200 }
    );

    // Set cookies in the response
    response.cookies.set("stdRefreshToken", refreshToken, refreshTokenOptions);
    response.cookies.set("stdAccessToken", accessToken, accessTokenOptions);

    return response;
  } catch (error) {
    console.error("Error during student login:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

// get student access token from cookies
// get access token
export const getStdAccessToken = async (req) => {
  const stdAccessToken = req.cookies.get("stdAccessToken")?.value;

  if (stdAccessToken) {
    return NextResponse.json(
      { stdAccessToken: stdAccessToken },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { message: "You don't have an access token; please login first" },
      { status: 404 }
    );
  }
};

// REFRESH ACCESS TOKEN
export const refreshStdAccessToken = async (req) => {
  const cookieStore = cookies();

  const { stdRefreshToken: incomingRefreshToken } = await req; // Parse JSON body
  const cookieRefreshToken = await cookieStore.get("stdRefreshToken")?.value;

  const incomingToken = incomingRefreshToken || cookieRefreshToken;

  if (!incomingToken) {
    return NextResponse.json(
      { message: "Unauthorized request" },
      { status: 401 }
    );
  }

  try {
    const decodedRefreshToken = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const student = await Student.findById(decodedRefreshToken._id);
    if (!student) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    if (incomingToken !== student.refreshToken) {
      return NextResponse.json(
        { message: "Refresh token expired or used" },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
      student._id
    );

    const response = NextResponse.json(
      {
        stdAccessToken: accessToken,
        stdRefreshToken: refreshToken,
        message: "Access token refreshed",
      },
      { status: 201 }
    );

    // Set cookies in the response
    response.cookies.set("stdRefreshToken", refreshToken, refreshTokenOptions);
    response.cookies.set("stdAccessToken", accessToken, accessTokenOptions);

    return response;
  } catch (error) {
    console.error("Error refreshing access token:", error); // Log error for debugging
    return NextResponse.json(
      { message: "Invalid access token" },
      { status: 401 }
    );
  }
};

// LOGOUT USER
export const logoutStudent = async (req) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Clear the refreshToken in the database
    await Student.findByIdAndUpdate(req.user._id, { refreshToken: null });

    // Create the response
    const response = NextResponse.json(
      { message: "User logged out" },
      { status: 200 }
    );

    // Define cookie options to clear the cookies

    // Clear cookies in the response
    response.headers.set("Set-Cookie", [
      `stdAccessToken=; Path=/; Max-Age=0; HttpOnly; Secure`,
      `stdRefreshToken=; Path=/; Max-Age=0; HttpOnly; Secure`,
    ]);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
};

export const getStdInfo = async (req) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Clear the refreshToken in the database
    const studentInfo = await Student.findById(req.user._id).select(
      "-password -refreshToken"
    );

    // Create the response
    const response = NextResponse.json(
      { message: "data fetched", studentInfo },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
};

/******************************************* Student APP************************************************************/

// fetch student dashboard in app

export const getStdInfoForApp = async (req) => {
  try {
    // Check if user is authenticated
    const { stdId } = await req.json();

    // Clear the refreshToken in the database
    const studentInfo = await Student.findById(stdId).select(
      "-password -refreshToken"
    );

    // Create the response
    const response = NextResponse.json(
      { message: "data fetched", studentInfo },
      { status: 200 }
    );

    return response;
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
};
