import { NextResponse } from "next/server";
import LeadsForm from "@/models/LeadsForm";
import { transporter } from "../config/nodemailer";
import axios from "axios";
import Webhook from "@/models/whatsappWebhookSchema";
import DuplicateLeads from "@/models/DuplicateLeads";
export const handleLeadsSubmit = async (req) => {
  const {
    FULL_NAME,
    EMAIL,
    PHONE_NO,
    REMARKS,
    COUNTRY,
    TIME_ZONE,
    CURRENCY,
    STATE,
    LEAD_IP,
    REQUEST_FORM,
  } = await req.json();

  // Check for empty fields
  if ([EMAIL, PHONE_NO].some((field) => !field)) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    // Check for existing lead by EMAIL or PHONE_NO
    const existingLead = await LeadsForm.findOne({
      $or: [{ EMAIL }, { PHONE_NO }],
    });

    if (existingLead) {
      // If lead already exists, store in DuplicateLeadForm table
      const duplicateLeadData = {
        LEAD_ID: existingLead.LEAD_ID,
        FULL_NAME,
        EMAIL,
        PHONE_NO,
        REMARKS,
        COUNTRY,
        TIME_ZONE,
        CURRENCY,
        STATE,
        LEAD_IP,
        REQUEST_FORM,
        DATE_CREATED: new Date(),
      };

      // Store in DuplicateLeadForm collection
      const newDuplicateLead = await DuplicateLeads.create(duplicateLeadData);
      if (!newDuplicateLead._id) throw new Error("Form creation failed.");

      // Increment the 'New_Messages' field by 1 in the existing lead
      await LeadsForm.updateOne(
        { LEAD_ID: existingLead.LEAD_ID },
        { $inc: { New_Messages: 1 } }
      );

      // Attempt to sync with Oracle
      try {
        const response = await newDuplicateLead.syncWithOracle();
        console.log("Data successfully synced with Oracle.");
      } catch (oracleError) {
        console.error("Oracle sync failed:", oracleError.message);
        // The cron job will handle resyncing unsynced leads later
      }

      // Return duplicate lead response with the same format as new form submission
      return NextResponse.json(
        {
          message: "Your form has been successfully submitted.",
          success: true,
          data: {
            id: existingLead._id,
            LEAD_ID: existingLead.LEAD_ID,
            FULL_NAME,
            EMAIL,
            PHONE_NO,
            REMARKS,
            COUNTRY,
            TIME_ZONE,
            CURRENCY,
            STATE,
            LEAD_IP,
            REQUEST_FORM,
            STUDENTS: existingLead.STUDENTS,
          },
        },
        { status: 200 }
      );
    }

    // Create new LeadForm if no duplicate is found
    const newFormData = await LeadsForm.create({
      FULL_NAME,
      EMAIL,
      PHONE_NO,
      REMARKS,
      COUNTRY,
      TIME_ZONE,
      CURRENCY,
      STATE,
      LEAD_IP,
      REQUEST_FORM,
      WHATSAPP_STATUS: "no response",
    });

    if (!newFormData) throw new Error("Form creation failed.");

    // Attempt to sync with Oracle
    try {
      const response = await newFormData.syncWithOracle();
      console.log("Data successfully synced with Oracle.");
    } catch (oracleError) {
      console.error("Oracle sync failed:", oracleError.message);
      // The cron job will handle resyncing unsynced leads later
    }

    // Send success response for new form submission
    return NextResponse.json(
      {
        message: "Your form has been successfully submitted.",
        success: true,
        data: {
          id: newFormData._id,
          LEAD_ID: newFormData.LEAD_ID,
          FULL_NAME,
          EMAIL,
          PHONE_NO,
          REMARKS,
          COUNTRY,
          TIME_ZONE,
          CURRENCY,
          STATE,
          LEAD_IP,
          REQUEST_FORM,
          STUDENTS: existingLead.STUDENTS,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Something went wrong while submitting your form. Please try again later.",
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// handle message and email sending
const sendWhatsAppMessage = async (phone, appKey, message) => {
  return await axios
    .post("https://waserver.pro/api/create-message", {
      appkey: appKey,
      authkey: "nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG",
      to: phone,
      message,
    })
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(`WhatsApp message failed: ${error.message}`);
    });
};

const getAppKey = (phone) => {
  const countryCode = phone.slice(0, 2);
  if (countryCode === "+1") return "044d31bc-1666-4f72-8cc2-32be88c8a6d7";
  if (countryCode === "+6") return "3fa548ce-ec9b-4906-8c5a-f48b0ef69cc8";
  return "be4f69af-d825-4e7f-a029-2a68c5f732c9";
};

// Function to send email notifications
const sendEmail = async (mailOptions) => {
  try {
    const response = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email: " + error.message);
  }
};

export const handleMessageSending = async (req) => {
  const {
    id,
    LEAD_ID,
    FULL_NAME,
    EMAIL,
    PHONE_NO,
    REMARKS,
    COUNTRY,
    STATE,
    TIME_ZONE,
    CURRENCY,
    LEAD_IP,
    REQUEST_FORM,
  } = await req.json();

  const appKey = getAppKey(PHONE_NO);

  const errors = [];
  const message1 = `
  Assalam o Alaikum!  
  🌟 Welcome to IlmulQuran.com!  

  Excited to begin your Qur'an learning journey? Enroll in a free trial class and explore our courses:  

  📚 Courses Offered:  
  - Quran Classes with Tajweed  
  - Translation and Memorization  
  - Taleem ul Islam (Islamic Education)  

  👩‍🏫 Qualified Instructors:  
  - Male & female teachers available 24/7 via Zoom/Teams.  
  🌐 Multilingual Learning:  
  - Courses are available in multiple languages.  

  To schedule your free trial class, simply reply with:  
  - Your Full Name  
  - Preferred Date & Time (please mention your timezone)  

  📧 Contact us at admin@ilmulquran.com  
  If you’d like to provide further details to confirm your class, click the link below:  
  👉 https://ilmulquran.com/thank-you?id=${id}  

  IlmulQuran Team  
`;

  // Send WhatsApp message
  try {
    await sendWhatsAppMessage(PHONE_NO, appKey, message1);
    await LeadsForm.updateOne(
      { LEAD_ID: LEAD_ID },
      { WHATSAPP_STATUS: "Message sent successfully" }
    );
  } catch (error) {
    await LeadsForm.updateOne(
      { LEAD_ID: LEAD_ID },
      { WHATSAPP_STATUS: error.message }
    );
    errors.push(error.message);
  }

  // Set up email options for admin notification
  const MailOptions = {
    from: "admin@ilmulquran.com",
    to: "dafiyahilmulquran@gmail.com",
    replyTo: EMAIL,
    subject: "New Form Submission",
    html: `<h1>New Form Submission</h1>
          <p><strong>Full Name:</strong> ${FULL_NAME}</p>
          <p><strong>Email:</strong> ${EMAIL}</p>
          <p><strong>Phone Number:</strong> ${PHONE_NO}</p>
          <p><strong>Country:</strong> ${COUNTRY}</p>
          <p><strong>State:</strong> ${STATE}</p>
          <p><strong>Time Zone:</strong> ${TIME_ZONE}</p>
          <p><strong>Currency:</strong> ${CURRENCY}</p>
          <p><strong>Remarks:</strong> ${REMARKS}</p>
          <p><strong>IP Address:</strong> ${LEAD_IP}</p>
          <p><strong>Request Form:</strong> ${REQUEST_FORM}</p>`,
  };

  // Reply email options for user confirmation
  const ReplyMailOptions = {
    from: "admin@ilmulquran.com",
    to: EMAIL,
    subject: "Schedule for Online Quran Classes - ilmulQuran.com",
    html: `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>IlmulQuran - Free Trial Class</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Assalam o Alaikum, <strong>${FULL_NAME}</strong>,</p>
            <p>JazakAllah Khair for reaching out to us at <strong>IlmulQuran.com</strong>. We're thrilled to help you begin your Quran learning journey.</p>
            <p>To schedule your free trial class, kindly let us know when you're available for a call so we can set up your appointment. You can let us know your preferred time and whether you'd like us to contact you via phone or WhatsApp. Just reply to this email with the best time and date (and your timezone) for a call.</p>
            <p>Our highly qualified male and female teachers are available 24/7, offering courses such as:</p>
            <ul>
                <li><strong>Quran Classes with Tajweed</strong></li>
                <li><strong>Translation and Memorization</strong></li>
                <li><strong>Taleem ul Islam (Islamic Education)</strong></li>
            </ul>
            <p>Courses are available in multiple languages, and all classes are conducted via Zoom or Teams for your convenience.</p>
            
            <p><strong>To confirm your class, please provide further details by clicking the link below:</strong></p>
            <p><a href="https://ilmulquran.com/thank-you?id=${id}" style="font-weight: bold; color: #007bff;">Confirm Your Class</a></p>

            <p>Feel free to reply to this email or contact us directly through any of the following:</p>
            <p><strong>Contact Information:</strong></p>
            <ul>
                <li>UK: +44 7862 067920</li>
                <li>AU: +61 480 050048</li>
                <li>US: +1 914 2791693</li>
                <li><strong>Email:</strong> <a href="mailto:admin@ilmulquran.com">admin@ilmulquran.com</a></li>
            </ul>
            <p>We look forward to speaking with you and helping you on this blessed path of learning the Quran, InshaAllah.</p>
            <p>Best Regards,<br>
            Zulqarnain Basher<br>
            <strong>IlmulQuran.com Team</strong><br>
            <a href="mailto:admin@ilmulquran.com">admin@ilmulquran.com</a>
            </p>
        </body>
        </html>`,
  };

  // Send emails
  try {
    await sendEmail(MailOptions);
  } catch (error) {
    errors.push(`Email to admin failed: ${error.message}`);
  }

  try {
    await sendEmail(ReplyMailOptions);
  } catch (error) {
    errors.push(`Reply email failed: ${error.message}`);
  }

  // Construct the response message
  const responseMessage =
    errors.length > 0
      ? `Data saved, but there were some issues: ${errors.join(", ")}`
      : "Data saved successfully, and messages sent!";

  // Return the final response
  return NextResponse.json(
    { message: responseMessage },
    { status: errors.length > 0 ? 400 : 201 }
  );
};

export const handleLeadsAdditionalData = async (req) => {
  try {
    const {
      id,
      LEAD_ID,
      CONTACT_TIME, // Extract P_DAYS & P_TIME_SESSION from this
      CONTACT_METHOD,
      STUDENT_NAME,
      STUDENT_GENDER,
      STUDENT_AGE,
      PREFERRED_COURSES,
      CLASS_TIMING, // Sent as P_CLASS_DURATION
      SPECIAL_REQUIREMENTS, // Sent as P_DESCRIPTION
      EMAIL,
      PHONE_NO,
    } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    // Extract P_DAYS and P_TIME_SESSION from CONTACT_TIME
    const extractTimeDetails = (contactTime) => {
      if (!contactTime) return { P_DAYS: "", P_TIME_SESSION: "" };

      const dateObj = new Date(contactTime);
      return {
        P_DAYS: dateObj.toLocaleDateString("en-US", { weekday: "short" }), // Example: "Fri"
        P_TIME_SESSION: dateObj.toTimeString().split(" ")[0], // Example: "14:11:00"
      };
    };

    const { P_DAYS, P_TIME_SESSION } = extractTimeDetails(CONTACT_TIME);

    // Format P_CLASS_START_DATE to "DD-MMM-YYYY"
    const formatDate = (dateString) => {
      if (!dateString) return null;
      const dateObj = new Date(dateString);
      return `${String(dateObj.getDate()).padStart(2, "0")}-${dateObj
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase()}-${dateObj.getFullYear()}`;
    };

    const studentData = {
      CONTACT_TIME,
      CONTACT_METHOD,
      STUDENT_NAME,
      STUDENT_GENDER,
      STUDENT_AGE,
      PREFERRED_COURSES,
      CLASS_TIMING,
      SPECIAL_REQUIREMENTS,
    };

    const updateData = {
      $push: { STUDENTS: studentData },
    };

    if (EMAIL) {
      updateData.$set = { ...updateData.$set, EMAIL };
    }
    if (PHONE_NO) {
      updateData.$set = { ...updateData.$set, PHONE_NO };
    }

    let leadsTable = await LeadsForm.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!leadsTable) {
      return NextResponse.json(
        { message: "Lead not found or update failed" },
        { status: 404 }
      );
    }

    // Prepare the data for the external API
    const postData = {
      P_LEAD_ID: LEAD_ID,
      P_STUDENT_NAME: STUDENT_NAME,
      P_COURSE: Array.isArray(PREFERRED_COURSES)
        ? PREFERRED_COURSES.join(",")
        : PREFERRED_COURSES, // Ensure it's a string
      P_CLASS_START_DATE: formatDate(CONTACT_TIME), // Formatted date
      P_CLASS_DURATION: parseInt(CLASS_TIMING), // Taken from CLASS_TIMING
      P_DESCRIPTION: SPECIAL_REQUIREMENTS, // Taken from SPECIAL_REQUIREMENTS
      P_DAYS, // Extracted day
      P_TIME_SESSION, // Extracted time
    };

    // Send data to the external API
    const response = await fetch(
      "http://103.18.23.62:8080/apeks/apps/erp/addstudent/postdata",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to sync student data with external API");
    }

    // Fetch the latest lead document to get the last student
    leadsTable = await LeadsForm.findById(id);
    if (!leadsTable || !leadsTable.STUDENTS.length) {
      return NextResponse.json(
        { message: "Lead not found or no students available" },
        { status: 404 }
      );
    }

    // Get the last student in the array
    const lastStudent = leadsTable.STUDENTS[leadsTable.STUDENTS.length - 1];

    // Update SYNCED status for the last student
    leadsTable = await LeadsForm.findOneAndUpdate(
      { _id: id, "STUDENTS._id": lastStudent._id }, // Find the last student by its _id
      { $set: { "STUDENTS.$.SYNCED": true } }, // Update SYNCED status to true
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Student synced successfully",
        updatedData: leadsTable,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    return NextResponse.json(
      { message: "Error in processing your request" },
      { status: 500 }
    );
  }
};

export const handleSecondMessageSending = async (req) => {
  try {
    // Parse the request data

    const { PHONE_NO, STUDENTS } = await req.json();

    // Check if STUDENTS is an array and has elements
    if (!Array.isArray(STUDENTS) || STUDENTS.length === 0) {
      return NextResponse.json(
        { error: "STUDENTS array is empty or not defined." },
        { status: 400 }
      );
    }

    // Extract the last student from the STUDENTS array
    const lastStudent = STUDENTS[STUDENTS.length - 1];

    // Destructure the values from the last student object
    const {
      CONTACT_TIME,
      CONTACT_METHOD,
      STUDENT_NAME,
      STUDENT_GENDER,
      STUDENT_AGE,
      PREFERRED_COURSES,
      CLASS_TIMING,
      SPECIAL_REQUIREMENTS,
    } = lastStudent;

    // Check if PHONE_NO and STUDENT_NAME are provided
    if (!PHONE_NO || !STUDENT_NAME) {
      return NextResponse.json(
        { error: "PHONE_NO and STUDENT_NAME are required." },
        { status: 400 }
      );
    }

    // Get appKey using PHONE_NO
    const appKey = getAppKey(PHONE_NO);

    // Create the message content
    const message = `
    Assalam o Alaikum ${STUDENT_NAME},  
    
    Thank you for providing the additional information to Your Future Campus! We’re excited to support you on your educational journey.  
    
    Here are the details you shared:  
    
    📌 **Preferred Contact Time:** ${CONTACT_TIME}  
    📌 **Contact Method:** ${CONTACT_METHOD}  
    📌 **Student's Name:** ${STUDENT_NAME}  
    📌 **Gender:** ${STUDENT_GENDER}  
    📌 **Age:** ${STUDENT_AGE}  
    📌 **Preferred Course:** ${PREFERRED_COURSES}  
    📌 **Class Timing:** ${CLASS_TIMING}  
    📌 **Special Requirements:** ${SPECIAL_REQUIREMENTS || "None"}  
    
    Our highly qualified teachers are available 24/7 via Zoom or Teams to ensure a seamless learning experience.  
    
    We look forward to welcoming you to our classes, InshaAllah!  
    
    **Best Regards,**  
    IlmulQuran Team 
    `;

    // Send the WhatsApp message using the provided details
    const response = await sendWhatsAppMessage(PHONE_NO, appKey, message);

    // Return success response
    return NextResponse.json(
      { success: true, message: "WhatsApp message sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    // Handle errors and return error response
    return NextResponse.json(
      { error: "Failed to send message", details: error.message },
      { status: 500 }
    );
  }
};

// fetch leadsdata
export const fetchLeadsData = async (req) => {
  try {
    // Fetch all leads from the database
    const leads = await LeadsForm.find().sort({ _id: -1 });
    // No filters, just return all leads

    if (leads.length === 0) {
      return NextResponse.json({ message: "No leads found" }, { status: 404 });
    }

    // Return the fetched leads data
    return NextResponse.json(
      {
        message: "Leads fetched successfully",
        data: leads,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { message: "Error fetching leads. Please try again later." },
      { status: 500 }
    );
  }
};

// fetch single leadsdata
export const fetchSingleLeadData = async (req) => {
  try {
    const { id } = await req.json();
    console.log("im recieving data");

    // Fetch all leads from the database
    const lead = await LeadsForm.findById(id); // No filters, just return all leads

    if (!lead) {
      return NextResponse.json({ message: "No lead found" }, { status: 404 });
    }

    // Return the fetched leads data
    return NextResponse.json(
      {
        message: "Leads fetched successfully",
        data: lead,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { message: "Error fetching leads. Please try again later." },
      { status: 500 }
    );
  }
};

export const deleteLead = async (req) => {
  try {
    const { id } = await req.json(); // Parse the incoming request JSON

    if (!id) {
      return new Response(JSON.stringify({ message: "Lead ID is required" }), {
        status: 400,
      });
    }

    // Attempt to find and delete the lead by ID
    const lead = await LeadsForm.findByIdAndDelete(id);

    if (!lead) {
      return new Response(JSON.stringify({ message: "Lead not found" }), {
        status: 404,
      });
    }

    // If lead is deleted, return success message
    return new Response(
      JSON.stringify({ message: "Lead deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error deleting lead:", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
      {
        status: 500,
      }
    );
  }
};

// update leads

export const updateLead = async (req) => {
  try {
    // Parse the incoming JSON body
    const {
      id,
      FULL_NAME,
      EMAIL,
      PHONE_NO,
      REMARKS,
      COUNTRY,
      STATE,
      REQUEST_FORM,
      CONTACT_METHOD,
      STUDENT_NAME,
      STUDENT_GENDER,
      STUDENT_AGE,
      PREFERRED_COURSES,
      CLASS_TIMING,
      SPECIAL_REQUIREMENTS,
    } = await req.json();

    // Ensure all required fields are present
    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    // Perform the update operation and wait for the result
    const leadsTable = await LeadsForm.findByIdAndUpdate(
      id,
      {
        FULL_NAME,
        EMAIL,
        PHONE_NO,
        REMARKS,
        COUNTRY,
        STATE,
        REQUEST_FORM,
        CONTACT_METHOD,
        STUDENT_NAME,
        STUDENT_GENDER,
        STUDENT_AGE,
        PREFERRED_COURSES,
        CLASS_TIMING,
        SPECIAL_REQUIREMENTS,
      },
      { new: true }
    ); // Use `new: true` to return the updated document

    // If no lead is found or update failed, return a 404 response
    if (!leadsTable) {
      return NextResponse.json(
        { message: "Lead not found or update failed" },
        { status: 404 }
      );
    }

    // Return the updated data as part of the response
    return NextResponse.json(
      {
        message: "Your request was processed successfully",
        updatedData: leadsTable, // Send the updated data back to the frontend
      },
      { status: 200 }
    );
  } catch (error) {
    // Log the error and return a 500 response
    console.error("Error processing the request:", error);
    return NextResponse.json(
      { message: "Error in processing your request" },
      { status: 500 }
    );
  }
};

// oracle for submission
export const handleoracleleads = async (req) => {
  const {
    FULL_NAME,
    EMAIL,
    PHONE_NO,
    REMARKS,
    COUNTRY,
    STATE,
    TIME_ZONE,
    CURRENCY,
    LEAD_IP,
    REQUEST_FORM,
    CONTACT_TIME,
    CONTACT_METHOD,
    STUDENT_NAME,
    STUDENT_GENDER,
    STUDENT_AGE,
    PREFERRED_COURSES,
    CLASS_TIMING,
    SPECIAL_REQUIREMENTS,
  } = await req.json();

  console.log(
    FULL_NAME,
    EMAIL,
    PHONE_NO,
    REMARKS,
    COUNTRY,
    STATE,
    TIME_ZONE,
    CURRENCY,
    LEAD_IP,
    REQUEST_FORM,
    CONTACT_TIME,
    CONTACT_METHOD,
    STUDENT_NAME,
    STUDENT_GENDER,
    STUDENT_AGE,
    PREFERRED_COURSES,
    CLASS_TIMING,
    SPECIAL_REQUIREMENTS
  );

  // Check for empty fields
  if ([EMAIL, PHONE_NO].some((field) => !field)) {
    return NextResponse.json(
      { message: "All fields are required" },
      { status: 400 }
    );
  }

  // Create new form submission
  let newFormData;
  try {
    newFormData = await LeadsForm.create({
      FULL_NAME,
      EMAIL,
      PHONE_NO,
      REMARKS,
      COUNTRY,
      TIME_ZONE,
      CURRENCY,
      STATE,
      LEAD_IP,
      REQUEST_FORM,
      WHATSAPP_STATUS: "no response",
      CONTACT_TIME,
      CONTACT_METHOD,
      STUDENT_NAME,
      STUDENT_GENDER,
      STUDENT_AGE,
      PREFERRED_COURSES,
      CLASS_TIMING,
      SPECIAL_REQUIREMENTS,
    });

    if (!newFormData) throw new Error("Form creation failed.");

    try {
      const response = await newFormData.syncWithOracle();
    } catch (oracleError) {
      console.error("Oracle sync failed:", oracleError.message);
      // The cron job will handle resyncing unsynced leads later
    }
    // Send success response to frontend
    return NextResponse.json(
      {
        message: "Your form has been successfully submitted.",
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message:
          "Something went wrong while submitting your form. Please try again later.",
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// search leads

export const searchLeads = async function handler(req) {
  const { query, field } = req.query; // Extract 'query' and 'field' from query params

  if (!query || !field) {
    return res.status(400).json({ message: "Query and field are required" });
  }

  try {
    let searchQuery;

    // Determine the field to search based on the 'field' parameter
    if (field === "LEAD_ID") {
      searchQuery = { LEAD_ID: Number(query) }; // Convert query to a number for LEAD_ID
    } else if (field === "EMAIL" || field === "PHONE_NO") {
      // Use $text search for EMAIL or PHONE_NO
      searchQuery = { $text: { $search: query } };
    } else {
      return res.status(400).json({ message: "Invalid field" });
    }

    // Find the leads based on the search query
    const leads = await LeadsForm.find(searchQuery);

    if (leads.length === 0) {
      return res.status(404).json({ message: "No leads found" });
    }

    // Return the found leads
    res.status(200).json({ leads });
  } catch (error) {
    console.error("Error searching leads:", error);
    res.status(500).json({ message: "Error searching the database" });
  }
};

// handle webhook leads

export const handleWebhookLeads = async (req) => {
  try {
    const {
      FULL_NAME,
      EMAIL,
      PHONE_NO,
      REMARKS,
      COUNTRY,
      TIME_ZONE,
      CURRENCY,
      STATE,
      LEAD_IP,
      REQUEST_FORM,
      conversationId,
    } = await req.json();

    console.log("Received data:", {
      FULL_NAME,
      EMAIL,
      PHONE_NO,
      REMARKS,
      COUNTRY,
      TIME_ZONE,
      CURRENCY,
      STATE,
      LEAD_IP,
      REQUEST_FORM,
      conversationId,
    });

    // Create new form submission
    const newFormData = await LeadsForm.create({
      FULL_NAME,
      EMAIL,
      PHONE_NO,
      REMARKS,
      COUNTRY,
      TIME_ZONE,
      CURRENCY,
      STATE,
      LEAD_IP,
      REQUEST_FORM,
      WHATSAPP_STATUS: "no response",
    });

    if (!newFormData) throw new Error("Form creation failed.");

    // Update conversation if conversationId exists
    if (conversationId) {
      const conversation = await Webhook.findOne({ conversationId });

      if (conversation) {
        conversation.isVerified = true;
        conversation.leadId = newFormData.LEAD_ID;
        await conversation.save();

        console.log(`Conversation ID ${conversation._id} updated to verified.`);
      } else {
        console.log(`No conversations found for ID: ${conversationId}`);
      }
    }

    // Sync data with Oracle
    try {
      await newFormData.syncWithOracle();
      console.log("Data successfully synced with Oracle.");
    } catch (oracleError) {
      console.error("Oracle sync failed:", oracleError.message);
      // Optionally handle failed syncs here
    }

    // Send success response
    return NextResponse.json(
      {
        message: "Your form has been successfully submitted.",
        success: true,
        data: {
          id: newFormData._id,
          LEAD_ID: newFormData.LEAD_ID,
          FULL_NAME,
          EMAIL,
          PHONE_NO,
          REMARKS,
          COUNTRY,
          TIME_ZONE,
          CURRENCY,
          STATE,
          LEAD_IP,
          REQUEST_FORM,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error handling webhook leads:", error.message);

    return NextResponse.json(
      {
        message:
          "An error occurred while submitting your form. Please try again.",
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

export const groupLeads = async () => {
  try {
    // Fetch all leads
    const allLeads = await LeadsForm.find(
      {},
      { EMAIL: 1, PHONE_NO: 1, LEAD_ID: 1 }
    );

    // Create a map to group leads by EMAIL and PHONE_NO
    const leadGroups = new Map();

    for (const lead of allLeads) {
      const key = `${lead.EMAIL}_${lead.PHONE_NO}`;
      if (!leadGroups.has(key)) {
        leadGroups.set(key, { count: 0, leadIds: [] });
      }
      leadGroups.get(key).count += 1;
      leadGroups.get(key).leadIds.push(lead.LEAD_ID);
    }

    // Process each group and update duplicates
    for (const [key, value] of leadGroups) {
      if (value.count > 1) {
        const [email, phone] = key.split("_");

        await LeadsForm.updateMany(
          { EMAIL: email, PHONE_NO: phone },
          {
            $set: {
              duplicate_count: value.count,
              duplicate_lead_ids: value.leadIds,
            },
          }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Duplicate leads grouped and updated successfully.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error grouping duplicate leads.",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
