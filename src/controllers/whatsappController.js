import Student from "@/models/Student";
import LeadsForm from "@/models/LeadsForm";
import { NextResponse } from "next/server";
import axios from "axios";
import Webhook from "@/models/whatsappWebhookSchema";

export const handleWhatsappMessage = async (req) => {
  try {
    // Extract template_id and userid from request body
    const { template_id, appkey, userid } = await req.json();

    // Retrieve user details based on userid
    const user = await Student.findOne({ userid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract mobile number from user data
    const number = user.phonenumber;

    // WhatsApp message payload
    const messageData = {
      appkey: appkey,
      authkey: "nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG",
      to: number,
      template_id,
    };
    const data = {
      appkey: appkey,
      userid: userid,
    };
    // Send WhatsApp message request
    const response = await axios.post(
      "https://waserver.pro/api/create-message",
      messageData
    );

    // Successful response from WhatsApp API
    return NextResponse.json(
      {
        message: "WhatsApp message sent successfully",
        data,
        status: response.status,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle and log any error that occurs during execution
    console.error("Error in handleWhatsappMessage:", error);

    // Check if the error is from the WhatsApp API request
    if (error.response) {
      return NextResponse.json(
        {
          error: "Failed to send WhatsApp message",
          details: error.response.data,
          status: error.response.status,
        },
        { status: error.response.status }
      );
    }

    // Handle unexpected server errors
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
};

// handle whatsapp message leads
export const handleWhatsappMessageLeads = async (req) => {
  try {
    // Extract template_id and userid from request body
    const { template_id, appkey, lead_id } = await req.json();

    // Retrieve user details based on userid
    const user = await LeadsForm.findOne({ LEAD_ID: lead_id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract mobile number from user data
    const number = user.PHONE_NO;

    // WhatsApp message payload
    const messageData = {
      appkey: appkey,
      authkey: "nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG",
      to: number,
      template_id,
    };
    const data = {
      appkey: appkey,
      lead_id: lead_id,
    };
    // Send WhatsApp message request
    const response = await axios.post(
      "https://waserver.pro/api/create-message",
      messageData
    );

    // Successful response from WhatsApp API
    return NextResponse.json(
      {
        message: "WhatsApp message sent successfully",
        data,
        status: response.status,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle and log any error that occurs during execution
    console.error("Error in handleWhatsappMessage:", error);

    // Check if the error is from the WhatsApp API request
    if (error.response) {
      return NextResponse.json(
        {
          error: "Failed to send WhatsApp message",
          details: error.response.data,
          status: error.response.status,
        },
        { status: error.response.status }
      );
    }

    // Handle unexpected server errors
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
};



/********************************  handle lead cutom whatsapp messages  *****************************/

export const handleLeadsCustomMessages = async (req) => {
  try {
    // Extract data from the request body
    const { message, appkey, lead_id, receiver, family_id, conversationId } =
      await req.json();

    let number;
    let familyId = null;

    // Check if receiver is provided
    if (receiver) {
      number = receiver; // Use the receiver directly
      familyId = family_id;
      console.log("Receiver provided directly:", number);
    } else if (family_id) {
      familyId = family_id;
      const family = await Student.findOne({ userid: family_id });
      if (!family) {
        return NextResponse.json(
          { error: "family not found" },
          { status: 404 }
        );
      }

      // Extract mobile number and familyId from user data
      number = family.phonenumber;
      console.log("Number fetched from student table:", number);
    } else {
      // Retrieve user details based on lead_id
      const user = await LeadsForm.findOne({ LEAD_ID: lead_id });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Extract mobile number and familyId from user data
      number = user.PHONE_NO;
      console.log("Number fetched from LeadsForm:", number);

      // Check for familyId in the Student model
      const student = await Student.findOne({ phonenumber: number });
      if (student) {
        familyId = student.userid;
        console.log("Family ID fetched from Student:", familyId);
      }
    }

    // WhatsApp message payload
    const messageData = {
      appkey: appkey,
      authkey: "nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG",
      to: number,
      message: message,
    };

    // Send WhatsApp message request
    const response = await axios.post(
      "https://waserver.pro/api/create-message",
      messageData
    );

    let webhookEntry;

    // If the WhatsApp message is sent successfully, store/update data in the Webhook table
    if (response.status === 200) {
      const newMessage = {
        text: message,
        isReply: true,
        sender: appkey,
        receiver: number,
        createdAt: new Date(),
      };

      if (familyId) {
        // Update or create webhook using familyId and push new message to conversation
        webhookEntry = await Webhook.findOneAndUpdate(
          { familyId: familyId },
          { $push: { conversation: newMessage } },
          { upsert: true, new: true }
        );
        console.log("Webhook updated/created with familyId:", webhookEntry);
      } else if (lead_id) {
        // Update or create webhook using leadId and push new message to conversation
        webhookEntry = await Webhook.findOneAndUpdate(
          { leadId: lead_id },
          { $push: { conversation: newMessage } },
          { upsert: true, new: true }
        );
        console.log("Webhook updated/created with leadId:", webhookEntry);
      } else if (conversationId) {
        // Update or create webhook using conversationId and push new message to conversation
        webhookEntry = await Webhook.findOneAndUpdate(
          { conversationId },
          { $push: { conversation: newMessage } },
          { upsert: true, new: true }
        );
        console.log(
          "Webhook updated/created with conversationId:",
          webhookEntry
        );
      } else {
        // Create a new webhook entry with the new message
        webhookEntry = new Webhook({
          leadId: lead_id,
          receiver: number,
          conversation: [newMessage],
          appkey: appkey,
        });
        await webhookEntry.save();
      }

      // Call the sendToOracle method
      if (webhookEntry) {
        const oracleResponse = await webhookEntry.sendToOracle();
        console.log("Oracle Response:", oracleResponse);
      }
    }

    // Successful response from WhatsApp API
    return NextResponse.json(
      {
        message: "WhatsApp custom message sent successfully",
        data: {
          leadId: lead_id,
          familyId: familyId,
          conversation: message,
          isReply: true,
          appKey: appkey,
        },
        status: response.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in sending custom messages:", error);

    if (error.response) {
      return NextResponse.json(
        {
          error: "Failed to send WhatsApp custom message",
          details: error.response.data,
          status: error.response.status,
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
};
