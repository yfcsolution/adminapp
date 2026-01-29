import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import LeadsForm from "@/models/LeadsForm";
import EmailTemplate from "@/models/EmailTemplate";
import EmailLog from "@/models/EmailLog";
import EmailConfig from "@/models/EmailConfig";
import ERP_BASE_URL from "@/config/erpUrl";
import axios from "axios";
import connectDB from "@/config/db";

// Get email transporter from database config (same as custom email sending)
async function getEmailTransporter() {
  await connectDB();
  const config = await EmailConfig.findOne({ isActive: true }).lean();

  if (!config) {
    throw new Error("No email configuration found. Please configure SMTP settings in Email Configuration page first.");
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
    tls: {
      rejectUnauthorized: config.tlsRejectUnauthorized !== false,
    },
  });
}

// Mail options function with dynamic template data
const MailOptions = async (lead, template) => {
  const emailConfig = await EmailConfig.findOne({ isActive: true }).lean();
  const senderEmail = emailConfig?.smtpUser || "admin@ilmulquran.com";
  
  return {
    from: senderEmail,
    to: lead.EMAIL,
    subject: template.subject, // Set dynamic subject from template
    html: template.html, // Set dynamic HTML content from template
  };
};

const sendEmail = async (mailOptions) => {
  try {
    const transporter = await getEmailTransporter();
    
    const result = await transporter.sendMail(mailOptions); // Sends email
    console.log("Email sent successfully!", result.messageId);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    
    // Provide more helpful error messages
    if (error.message.includes("Invalid login") || error.message.includes("535") || error.message.includes("authentication")) {
      throw new Error("SMTP authentication failed. Please check your email configuration in the Email Configuration page (/admin/email/config) and ensure credentials are correct.");
    }
    
    if (error.message.includes("No email configuration")) {
      throw new Error("No email configuration found. Please configure SMTP settings in Email Configuration page (/admin/email/config) first.");
    }
    
    throw new Error("Failed to send email: " + error.message);
  }
};

// Sync email to ERP API
const syncEmailToERP = async (leadId, emailData) => {
  try {
    const erpEndpoint = `${ERP_BASE_URL}/yfcerp/emails/insert`;
    await axios.post(erpEndpoint, {
      LEAD_ID: leadId,
      EMAIL: emailData.to,
      SUBJECT: emailData.subject,
      BODY: emailData.html,
      SENT_AT: new Date().toISOString(),
      STATUS: "sent",
    });
    console.log(`Email synced to ERP for lead ${leadId}`);
  } catch (error) {
    console.error(`Failed to sync email to ERP for lead ${leadId}:`, error.message);
    // Don't throw - ERP sync failure shouldn't block email sending
  }
};

export const handleLeadEmails = async (req) => {
  try {
    await connectDB();
    
    // Extract LEAD_ID from the request body
    const { LEAD_ID, TEMPLATE_ID } = await req.json();

    // Check if LEAD_ID is provided
    if (!LEAD_ID) {
      return NextResponse.json(
        { message: "Lead Id is required", success: false },
        { status: 400 }
      );
    }

    // Fetch the lead details from the database using LEAD_ID
    const lead = await LeadsForm.findOne({ LEAD_ID }).lean();

    // If no lead found for the given LEAD_ID
    if (!lead) {
      return NextResponse.json(
        { message: "No lead found with the provided LEAD_ID", success: false },
        { status: 404 }
      );
    }

    // Check if TEMPLATE_ID is provided
    if (!TEMPLATE_ID) {
      return NextResponse.json(
        { message: "Template ID is required", success: false },
        { status: 400 }
      );
    }

    // Fetch the email template from the database
    const template = await EmailTemplate.findOne({ template_id: parseInt(TEMPLATE_ID) }).lean();

    // If no template found
    if (!template) {
      return NextResponse.json(
        { message: "No email template found with the provided TEMPLATE_ID", success: false },
        { status: 404 }
      );
    }

    // Prepare the mail options using the lead and template data
    const mailOptions = await MailOptions(lead, template);

    // Send the email with the constructed mail options
    let mailResult;
    let emailLog;
    
    try {
      mailResult = await sendEmail(mailOptions);
      
      // Log successful email
      emailLog = await EmailLog.create({
        leadId: LEAD_ID,
        email: lead.EMAIL,
        subject: template.subject,
        body: template.html,
        type: "manual",
        status: "success",
        messageId: mailResult.messageId,
        response: {
          accepted: mailResult.accepted,
          rejected: mailResult.rejected,
        },
        sentAt: new Date(),
      });

      // Sync to ERP in background (non-blocking)
      syncEmailToERP(LEAD_ID, {
        to: lead.EMAIL,
        subject: template.subject,
        html: template.html,
      }).catch(err => console.error("ERP sync error:", err));

      // Return success response
      return NextResponse.json(
        { 
          message: "Email sent successfully",
          success: true,
          messageId: mailResult.messageId,
        },
        { status: 200 }
      );
    } catch (emailError) {
      // Log failed email
      await EmailLog.create({
        leadId: LEAD_ID,
        email: lead.EMAIL,
        subject: template.subject,
        body: template.html,
        type: "manual",
        status: "failed",
        error: emailError.message,
        sentAt: new Date(),
      });

      return NextResponse.json(
        { 
          message: "Failed to send email: " + emailError.message,
          success: false,
          error: emailError.message,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in handleLeadEmails:", error);
    return NextResponse.json(
      { 
        message: "Internal server error",
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// Controller function to create a new email template
export const createEmailTemplate = async (req) => {
  try {
    // Extract data from the request body
    const { name, subject, html, placeholders } = await req.json();
    console.log("data received is ", name, subject, html);

    // Validate the data
    if (!name || !subject || !html) {
      return NextResponse.json(
        { message: "Template name, subject, and content are required." },
        { status: 400 }
      );
    }

    // Create a new email template in the database
    const newTemplate = new EmailTemplate({
      name,
      subject,
      html,
      placeholders,
    });

    // Save the new template to MongoDB
    await newTemplate.save();

    // Return a success response
    return NextResponse.json(
      {
        message: "Email template created successfully",
        template: newTemplate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving email template:", error);
    return NextResponse.json(
      { message: "An error occurred while creating the template." },
      { status: 500 }
    );
  }
};

// Get template
export const getTemplate = async (req) => {
  try {
    const template = await EmailTemplate.find();
    return NextResponse.json(
      { message: "Fetched successfully", template },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { message: "Failed to fetch template", error: error.message },
      { status: 500 }
    );
  }
};

// Update template
export const updateTemplate = async (req) => {
  try {
    const { _id, name, subject, html } = await req.json(); // Assuming the body contains the ID and the new data

    // Find the template by ID and update it
    const template = await EmailTemplate.findById(_id);
    if (!template) {
      return NextResponse.json(
        { message: "Template not found" },
        { status: 404 }
      );
    }

    // Update the template fields
    template.name = name || template.name;
    template.subject = subject || template.subject;
    template.html = html || template.html;

    // Save the updated template
    await template.save();

    return NextResponse.json(
      { message: "Template updated successfully", template },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { message: "Failed to update template" },
      { status: 500 }
    );
  }
};
