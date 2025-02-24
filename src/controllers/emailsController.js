import { NextResponse } from "next/server";
import { transporter } from "../config/nodemailer";
import LeadsForm from "@/models/LeadsForm";
import EmailTemplate from "@/models/EmailTemplate";

// Mail options function with dynamic template data
const MailOptions = (lead, template) => ({
  from: "admin@ilmulquran.com",
  to: lead.EMAIL,
  subject: template.subject, // Set dynamic subject from template
  html: template.html, // Set dynamic HTML content from template
});

const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions); // Sends email
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email: " + error.message);
  }
};

export const handleLeadEmails = async (req) => {
  try {
    // Extract LEAD_ID from the request body
    const { LEAD_ID, TEMPLATE_ID } = await req.json();

    // Check if LEAD_ID is provided
    if (!LEAD_ID) {
      return NextResponse.json(
        { message: "Lead Id is required" },
        { status: 400 }
      );
    }

    // Fetch the lead details from the database using LEAD_ID
    const lead = await LeadsForm.findOne({ LEAD_ID });

    // If no lead found for the given LEAD_ID
    if (!lead) {
      return NextResponse.json(
        { message: "No lead found with the provided LEAD_ID" },
        { status: 404 }
      );
    }

    // Fetch the most recent email template from the database
    const template = await EmailTemplate.findOne({ template_id: TEMPLATE_ID }); // Assuming createdAt field exists for sorting

    // If no template found
    if (!template) {
      return NextResponse.json(
        { message: "No email template found" },
        { status: 404 }
      );
    }

    // Prepare the mail options using the lead and template data
    const mailOptions = MailOptions(lead, template);

    // Send the email with the constructed mail options
    await sendEmail(mailOptions);

    // Return success response
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in handleLeadEmails:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
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
