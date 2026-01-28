import User from "../models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import Student from "@/models/Student";
import SecretCode from "@/models/secretCodeSchema";
import RolesSchema from "@/models/RolesSchema";
import AdminLoginAttempt from "@/models/AdminLoginAttemptSchema";
import LoginOtp from "@/models/LoginOtp";
import { transporter } from "@/config/nodemailer";

// Cookie options for access and refresh tokens
// Note: Next.js expects `maxAge` in seconds, not milliseconds.
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

// genrate access and refresh tokens
const genrateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.genrateAccessToken();
    const refreshToken = user.genrateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

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

export const registerUser = async (req) => {
  const {
    staffid,
    firstname,
    lastname,
    email,
    password,
    phonenumber,
    role_id,
    secreteCode,
    canViewSensitiveData,
  } = await req.json();

  // Check for empty required fields
  if (
    [firstname, email, password, role_id].some(
      (field) => field == null || field?.toString().trim() === ""
    )
  ) {
    return NextResponse.json(
      { message: "First name, email, password, and role ID are required" },
      { status: 400 }
    );
  }

  // Check if the user already exists
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    return NextResponse.json(
      { message: "User with this email already exists" },
      { status: 409 }
    );
  }

  // Validate if role_id exists in Role collection
  const role = await RolesSchema.findOne({ role_id });
  if (!role) {
    return NextResponse.json(
      { message: "Invalid role_id, role does not exist" },
      { status: 400 }
    );
  }

  // Hash the secreteCode using bcrypt
  const hashedSecreteCode = await bcrypt.hash(secreteCode, 10); // 10 is the salt rounds

  // Create new user
  const user = await User.create({
    staffid,
    firstname,
    lastname,
    email: email.toLowerCase(),
    password,
    phonenumber,
    role_id, // Store ObjectId reference to Role
    secreteCode: hashedSecreteCode, // Save the hashed secreteCode
    canViewSensitiveData,
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
    { message: "User registered successfully", user },
    { status: 201 }
  );
};
// update user import { NextResponse } from "next/server";

export const updateUser = async (req) => {
  try {
    const {
      user_id,
      staffid,
      firstname,
      lastname,
      email,
      phonenumber,
      role_id,
      secreteCode,
      canViewSensitiveData,
      newPassword,
    } = await req.json();

    // Check if the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Validate if role_id exists in Role collection
    const role = await RolesSchema.findOne({ role_id });
    if (!role) {
      return NextResponse.json(
        { message: "Invalid role_id, role does not exist" },
        { status: 400 }
      );
    }

    // Update user details
    user.staffid = staffid ?? user.staffid;
    user.firstname = firstname ?? user.firstname;
    user.lastname = lastname ?? user.lastname;
    user.email = email ? email.toLowerCase() : user.email;
    user.phonenumber = phonenumber ?? user.phonenumber;
    user.role_id = role_id ?? user.role_id;
    user.canViewSensitiveData =
      canViewSensitiveData ?? user.canViewSensitiveData;

    // Hash secreteCode if provided, otherwise keep the existing one
    if (secreteCode) {
      const salt = await bcrypt.genSalt(10);
      user.secreteCode = await bcrypt.hash(secreteCode, salt);
    }

    await user.save();

    // Respond with success message
    return NextResponse.json(
      { message: "User updated successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Something went wrong while updating the user" },
      { status: 500 }
    );
  }
};

// delete user

export const deleteUser = async (req) => {
  try {
    const { user_id } = await req.json();

    // Check if user_id is provided
    if (!user_id || user_id.trim() === "") {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the user
    const user = await User.findByIdAndDelete(user_id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Respond with success message
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Something went wrong while deleting the user" },
      { status: 500 }
    );
  }
};

// Step 1: Validate credentials and send OTP email
export const loginUser = async (req) => {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    // Get IP address and User-Agent from request headers
    const ipAddress =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "Unknown";
    const userAgent = req.headers.get("user-agent") || "Unknown";

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      await AdminLoginAttempt.create({
        email,
        ipAddress,
        userAgent,
        status: "failed",
        reason: "User does not exist",
      });

      return NextResponse.json(
        { message: "User does not exist" },
        { status: 404 }
      );
    }

    // Check password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      await AdminLoginAttempt.create({
        adminId: user._id,
        email,
        ipAddress,
        userAgent,
        status: "failed",
        reason: "Invalid password",
      });

      return NextResponse.json(
        { message: "Invalid user credentials" },
        { status: 401 }
      );
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await LoginOtp.create({
      userId: user._id,
      code: otpCode,
      ipAddress,
      userAgent,
      expiresAt,
    });

    // Send OTP email to the main admin email for verification
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "dafiyahilmulquran@gmail.com",
        subject: "Admin Login Verification Code",
        html: `
          <p>Assalam o Alaikum,</p>
          <p>A login request was made for admin user: <strong>${email}</strong>.</p>
          <p><strong>Verification Code:</strong> ${otpCode}</p>
          <p><strong>IP Address:</strong> ${ipAddress}</p>
          <p><strong>Browser:</strong> ${userAgent}</p>
          <p>This code will expire in 10 minutes. If you did not initiate this login, please secure your account immediately.</p>
        `,
      });
    } catch (mailError) {
      console.error("Failed to send OTP email:", mailError);
      return NextResponse.json(
        {
          message:
            "Unable to send verification code email. Please try again later.",
        },
        { status: 500 }
      );
    }

    // Log successful credential verification (but not full login yet)
    await AdminLoginAttempt.create({
      adminId: user._id,
      email,
      ipAddress,
      userAgent,
      status: "pending-otp",
    });

    return NextResponse.json(
      {
        message:
          "Verification code sent to the main admin email. Please enter the code to complete login.",
        otpRequired: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

// LOGOUT USER
export const logoutUser = async (req) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Clear the refreshToken in the database
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    // Create the response
    const response = NextResponse.json(
      { message: "User logged out" },
      { status: 200 }
    );

    // Define cookie options to clear the cookies
    const cookieOptions = {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: true,
    };

    // Clear cookies in the response
    response.headers.set("Set-Cookie", [
      `accessToken=; Path=/; Max-Age=0; HttpOnly; Secure`,
      `refreshToken=; Path=/; Max-Age=0; HttpOnly; Secure`,
    ]);

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
};
export const getAdminData = async (req) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Clear the refreshToken in the database
    const data = await User.findById(req.user._id).select(
      "-password -createdAt -updatedAt -refreshToken "
    );

    // Create the response
    const response = NextResponse.json(
      { success: true, data },
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

// chnage admin password

export const changeAdminPassword = async (req) => {
  try {
    // Get current password and new password from the request body
    const { currentPassword, newPassword } = await req.json();

    // Check if the user is authenticated
    if (!req.user) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Find the user in the database
    const user = await User.findById(req.user._id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if the current password matches the stored password
    const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Validate new password length and strength
    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { message: "New password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Hash the new password using bcrypt

    // Update the user's password in the database
    user.password = newPassword;
    await user.save();

    // Create a response indicating success
    const response = NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
    // Define cookie options to clear the cookies
    const cookieOptions = {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: true,
    };

    // Clear cookies in the response
    response.headers.set("Set-Cookie", [
      `accessToken=; Path=/; Max-Age=0; HttpOnly; Secure`,
      `refreshToken=; Path=/; Max-Age=0; HttpOnly; Secure`,
    ]);

    return response;
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { message: "An error occurred while changing the password" },
      { status: 500 }
    );
  }
};

// REFRESH ACCESS TOKEN
// Uses httpOnly `refreshToken` cookie; no body is required.
export const refreshAccessToken = async () => {
  const cookieStore = cookies();
  const incomingToken = cookieStore.get("refreshToken")?.value;

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

    const user = await User.findById(decodedRefreshToken._id);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    if (incomingToken !== user.refreshToken) {
      return NextResponse.json(
        { message: "Refresh token expired or used" },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
      user._id
    );

    const response = NextResponse.json(
      {
        data: {
          accessToken,
          refreshToken,
        },
        message: "Access token refreshed",
      },
      { status: 201 }
    );

    // Set cookies in the response
    response.cookies.set("refreshToken", refreshToken, refreshTokenOptions);
    response.cookies.set("accessToken", accessToken, accessTokenOptions);

    return response;
  } catch (error) {
    console.error("Error refreshing access token:", error); // Log error for debugging
    return NextResponse.json(
      { message: "Invalid access token" },
      { status: 401 }
    );
  }
};

// get access token from httpOnly cookie
export const getAccessToken = async () => {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (accessToken) {
    return NextResponse.json({ accessToken }, { status: 200 });
  }

  return NextResponse.json(
    { message: "You don't have an access token; please login first" },
    { status: 404 }
  );
};

// fetching students data
export const getStudentsData = async (page, pageSize) => {
  try {
    // Calculate skip and limit for pagination
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // Fetch students data with pagination
    const studentInfo = await Student.find()
      .skip(skip)
      .limit(limit)
      .sort({ _id: -1 });

    // Mask sensitive fields
    const maskedStdInfo = studentInfo.map((student) => ({
      ...student.toObject(),
      email: "***********",
      phonenumber: "***********",
      realEmail: student.email,
    }));

    // Get the total count of students for pagination metadata
    const totalStudents = await Student.countDocuments();
    const totalPages = Math.ceil(totalStudents / pageSize);

    // Create the response
    const response = NextResponse.json(
      {
        message: "Data fetched successfully",
        studentInfo: maskedStdInfo,
        pagination: {
          currentPage: page,
          pageSize,
          totalPages,
          totalStudents,
        },
      },
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

export const fetchStudentsContacts = async (req) => {
  try {
    const { id, email, phonenumber, CONTACT_SECRETE } = await req.json();

    // Ensure id and CONTACT_SECRETE are provided, otherwise return an error
    if (!id || !CONTACT_SECRETE) {
      return NextResponse.json(
        { message: "id and CONTACT_SECRETE are required" },
        { status: 400 }
      );
    }

    // Fetch the secret code stored in the database
    const storedCode = await SecretCode.findOne();
    if (!storedCode) {
      return NextResponse.json(
        { error: "No secret code found in the database" },
        { status: 404 }
      );
    }

    // Compare the provided CONTACT_SECRETE with the stored secret code
    const isMatch = await bcrypt.compare(CONTACT_SECRETE, storedCode.code);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid secret code" },
        { status: 403 }
      );
    }

    // Query based on id
    const student = await Student.findOne({ id });
    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    let data = {};

    // Check if email is requested and return only the email
    if (email) {
      data = { email: student.email || "Not available" };
    }

    // Check if phonenumber is requested and return only the phonenumber
    else if (phonenumber) {
      data = { phonenumber: student.phonenumber || "Not available" };
    } else {
      return NextResponse.json(
        { message: "Specify either email or phonenumber" },
        { status: 400 }
      );
    }

    // Return the fetched data
    return NextResponse.json(
      { message: "Data fetched successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching student contact:", error);
    return NextResponse.json(
      { message: "Error fetching student data. Please try again later." },
      { status: 500 }
    );
  }
};
