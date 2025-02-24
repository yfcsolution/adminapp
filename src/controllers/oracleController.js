import { NextResponse } from "next/server";
import LeadsForm from "@/models/LeadsForm";
import Student from "@/models/Student";
import bcrypt from "bcrypt";
import SecretCode from "@/models/secretCodeSchema";
export const fetchLeadsDataOracle = async (page = 1, pageSize = 10) => {
  try {
    // Calculate skip value based on current page
    const skip = (page - 1) * pageSize;
    console.log(
      "Fetching leads for Page:",
      page,
      "Skip:",
      skip,
      "Page Size:",
      pageSize
    );

    // Fetch leads with pagination
    const leads = await LeadsForm.find()
      .sort({
        updatedAt: -1,
        _id: -1,
      }) // Sort by updated_at first, then by _id
      .skip(skip)
      .limit(pageSize);

    if (!leads || leads.length === 0) {
      return { data: [], total: 0 }; // Return empty data and total leads count if no leads found
    }

    // Mask the EMAIL and PHONE_NO fields
    const maskedLeads = leads.map((lead) => ({
      ...lead.toObject(),
      EMAIL: "***********",
      PHONE_NO: "***********",
    }));

    // Get the total count of leads to calculate total pages
    const totalLeads = await LeadsForm.countDocuments();

    return { data: maskedLeads, total: totalLeads };
  } catch (error) {
    console.error("Error fetching lead:", error);
    throw error; // Let the handler catch and handle the error
  }
};

export const fetchLeadsContacts = async (req) => {
  try {
    const { LEAD_ID, EMAIL, PHONE_NO, CONTACT_SECRETE } = await req.json();

    // Ensure LEAD_ID and CONTACT_SECRETE are provided
    if (!LEAD_ID || !CONTACT_SECRETE) {
      return NextResponse.json(
        { message: "LEAD_ID and CONTACT_SECRETE are required" },
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

    // Query based on LEAD_ID
    const lead = await LeadsForm.findOne({ LEAD_ID });
    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    let data = {};

    // Check if EMAIL is requested and return only the EMAIL
    if (EMAIL) {
      data = { EMAIL: lead.EMAIL || "Not available" };
    }

    // Check if PHONE_NO is requested and return only the PHONE_NO
    else if (PHONE_NO) {
      data = { PHONE_NO: lead.PHONE_NO || "Not available" };
    } else {
      return NextResponse.json(
        { message: "Specify either EMAIL or PHONE_NO" },
        { status: 400 }
      );
    }

    // Return the fetched data
    return NextResponse.json(
      { message: "Data fetched successfully", data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching lead contact:", error);
    return NextResponse.json(
      { message: "Error fetching lead data. Please try again later." },
      { status: 500 }
    );
  }
};

export const addStdDetails = async (req) => {
  const { id, userid, firstname, lastname, email, phonenumber } =
    await req.json();

  // Create new user with auto-increment 'id' and 'userId'
  try {
    const student = await Student.create({
      id,
      userid,
      firstname,
      lastname,
      email: email.toLowerCase(),
      phonenumber,
      password: id,
    });

    // Check if user creation was successful
    if (!student) {
      return NextResponse.json(
        { message: "Something went wrong while adding student's details" },
        { status: 500 }
      );
    }

    // Respond with success message
    return NextResponse.json(
      { message: "Student's details added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong while adding details",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const addStdFromLead = async (req) => {
  // Create new user with auto-increment 'id' and 'userId'
  try {
    const { LEAD_ID, id, userid, firstname, lastname } = await req.json();
    const { PHONE_NO, EMAIL } = await LeadsForm.findOne({ LEAD_ID });

    console.log("phone number and email fetceh are", PHONE_NO, "and", EMAIL);

    const student = await Student.create({
      id,
      userid,
      firstname,
      lastname,
      email: EMAIL,
      phonenumber: PHONE_NO,
      password: 1,
    });

    // Check if user creation was successful
    if (!student) {
      return NextResponse.json(
        { message: "Something went wrong while adding student's details" },
        { status: 500 }
      );
    }

    // Respond with success message
    return NextResponse.json(
      { message: "Student's details added successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong while adding details",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
