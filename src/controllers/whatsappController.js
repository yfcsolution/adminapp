import Student from "@/models/Student";
import LeadsForm from "@/models/LeadsForm";
import { NextResponse } from "next/server";
import Webhook from "@/models/whatsappWebhookSchema";
import { sendWhatsAppMessage } from "@/utils/whatsappSender";

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;
  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
}

export const handleWhatsappMessage = async (req) => {
  try {
    // Extract templateName, exampleArr, token, and userid/family_id from request body
    const { templateName, exampleArr, token, userid, family_id, mediaUri } = await req.json();

    // Validate required fields for WACRM
    if (!templateName) {
      return NextResponse.json(
        { error: "templateName is required for WACRM (WhatsApp Cloud API)" },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "token (JWT) is required for WACRM (WhatsApp Cloud API)" },
        { status: 400 }
      );
    }

    // Get userid from family_id if provided
    const userId = userid || family_id;
    if (!userId) {
      return NextResponse.json(
        { error: "userid or family_id is required" },
        { status: 400 }
      );
    }

    // Retrieve only phonenumber field for better performance
    const user = await Student.findOne({ userid: userId }).select("phonenumber").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    const number = formatPhoneNumber(user.phonenumber);
    if (!number) {
      return NextResponse.json(
        { error: "Phone number not found for user" },
        { status: 404 }
      );
    }

    // Send WhatsApp template message using WACRM
    const sendResult = await sendWhatsAppMessage({
      to: number,
      templateName,
      exampleArr: exampleArr || [],
      token,
      mediaUri,
    });

    const response = {
      status: sendResult.status || 200,
      data: sendResult.response,
    };

    const data = {
      userid: userId,
      family_id: userId,
      templateName: templateName,
    };

    // Successful response from WhatsApp API
    return NextResponse.json(
      {
        message: "WhatsApp template message sent successfully via WACRM",
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
    // Extract templateName, exampleArr, token, and lead_id from request body
    const { templateName, exampleArr, token, lead_id, mediaUri } = await req.json();

    // Validate required fields for WACRM
    if (!templateName) {
      return NextResponse.json(
        { error: "templateName is required for WACRM (WhatsApp Cloud API)" },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "token (JWT) is required for WACRM (WhatsApp Cloud API)" },
        { status: 400 }
      );
    }

    if (!lead_id) {
      return NextResponse.json(
        { error: "lead_id is required" },
        { status: 400 }
      );
    }

    // Retrieve only PHONE_NO field for better performance
    const lead = await LeadsForm.findOne({ LEAD_ID: lead_id }).select("PHONE_NO").lean();
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const number = formatPhoneNumber(lead.PHONE_NO);
    if (!number) {
      return NextResponse.json(
        { error: "Phone number not found for lead" },
        { status: 404 }
      );
    }

    // Send WhatsApp template message using WACRM
    const sendResult = await sendWhatsAppMessage({
      to: number,
      templateName,
      exampleArr: exampleArr || [],
      token,
      mediaUri,
    });

    const response = {
      status: sendResult.status || 200,
      data: sendResult.response,
    };

    const data = {
      lead_id: lead_id,
      templateName: templateName,
    };

    // Successful response from WhatsApp API
    return NextResponse.json(
      {
        message: "WhatsApp template message sent successfully via WACRM",
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
    const { 
      lead_id, 
      receiver, 
      family_id, 
      conversationId,
      templateName,
      exampleArr,
      token,
      mediaUri
    } = await req.json();

    // Validate required fields for WACRM
    if (!templateName) {
      return NextResponse.json(
        { error: "templateName is required for WACRM (WhatsApp Cloud API)" },
        { status: 400 }
      );
    }

    if (!token) {
      return NextResponse.json(
        { error: "token (JWT) is required for WACRM (WhatsApp Cloud API)" },
        { status: 400 }
      );
    }

    let number;
    let familyId = null;

    // Resolve number from family_id, lead_id, or receiver
    if (receiver) {
      number = formatPhoneNumber(receiver);
      familyId = family_id;
    } else if (family_id) {
      familyId = family_id;
      const family = await Student.findOne({ userid: family_id }).select("phonenumber").lean();
      if (!family) {
        return NextResponse.json(
          { error: "family not found" },
          { status: 404 }
        );
      }
      number = formatPhoneNumber(family.phonenumber);
    } else if (lead_id) {
      const lead = await LeadsForm.findOne({ LEAD_ID: lead_id }).select("PHONE_NO").lean();
      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 404 });
      }
      number = formatPhoneNumber(lead.PHONE_NO);

      // Try to find familyId from phone number
      if (number) {
        const student = await Student.findOne({ phonenumber: number.replace("+", "") }).select("userid").lean();
        if (student) {
          familyId = student.userid;
        }
      }
    } else {
      return NextResponse.json(
        { error: "receiver, family_id, or lead_id is required" },
        { status: 400 }
      );
    }

    if (!number) {
      return NextResponse.json(
        { error: "Phone number not found" },
        { status: 404 }
      );
    }

    // Send the template message using WACRM
    const sendResult = await sendWhatsAppMessage({
      to: number,
      templateName,
      exampleArr: exampleArr || [],
      token,
      mediaUri,
    });

    const response = { 
      status: sendResult.status || 200,
      data: sendResult.response 
    };

    // ✅ Common webhook + DB save + Oracle logic
    let webhookEntry;
    const newMessage = {
      text: `Template: ${templateName}`,
      isReply: true,
      sender: "WACRM",
      receiver: number,
      createdAt: new Date(),
    };

    if (familyId) {
      webhookEntry = await Webhook.findOneAndUpdate(
        { familyId },
        { $push: { conversation: newMessage } },
        { upsert: true, new: true }
      );
      console.log("Webhook saved (familyId):", webhookEntry);
    } else if (lead_id) {
      webhookEntry = await Webhook.findOneAndUpdate(
        { leadId: lead_id },
        { $push: { conversation: newMessage } },
        { upsert: true, new: true }
      );
      console.log("Webhook saved (leadId):", webhookEntry);
    } else if (conversationId) {
      webhookEntry = await Webhook.findOneAndUpdate(
        { conversationId },
        { $push: { conversation: newMessage } },
        { upsert: true, new: true }
      );
      console.log("Webhook saved (conversationId):", webhookEntry);
    } else {
      webhookEntry = new Webhook({
        leadId: lead_id,
        receiver: number,
        conversation: [newMessage],
        appkey: "WACRM",
      });
      await webhookEntry.save();
    }

    if (webhookEntry) {
      const oracleResponse = await webhookEntry.sendToOracle();
      console.log("Oracle Response:", oracleResponse);
    }

    return NextResponse.json(
      {
        message: "WhatsApp template message sent successfully via WACRM",
        data: {
          leadId: lead_id,
          familyId: familyId,
          templateName: templateName,
          isReply: true,
          provider: "WACRM",
        },
        status: response.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);

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
