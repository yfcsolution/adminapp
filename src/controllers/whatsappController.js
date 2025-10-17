import Student from "@/models/Student";
import LeadsForm from "@/models/LeadsForm";
import { NextResponse } from "next/server";
import axios from "axios";
import Webhook from "@/models/whatsappWebhookSchema";
import { getCurrentServer } from "@/config/getCurrentServer";

/* -------------------------------------------------------------------------- */
/*                 SEND MESSAGE TO STUDENT USING TEMPLATE ID                  */
/* -------------------------------------------------------------------------- */
export const handleWhatsappMessage = async (req) => {
  try {
    const { template_id, appkey, userid } = await req.json();

    const user = await Student.findOne({ userid });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const number = user.phonenumber;

    const messageData = {
      appkey,
      authkey: "nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG",
      to: number,
      template_id,
    };

    const response = await axios.post("https://waserver.pro/api/create-message", messageData);

    return NextResponse.json(
      {
        message: "WhatsApp message sent successfully",
        data: { appkey, userid },
        status: response.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in handleWhatsappMessage:", error);

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

    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
};

/* -------------------------------------------------------------------------- */
/*                 SEND MESSAGE TO LEADS USING TEMPLATE ID                    */
/* -------------------------------------------------------------------------- */
export const handleWhatsappMessageLeads = async (req) => {
  try {
    const { template_id, appkey, lead_id } = await req.json();

    const user = await LeadsForm.findOne({ LEAD_ID: lead_id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const number = user.PHONE_NO;

    const messageData = {
      appkey,
      authkey: "nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG",
      to: number,
      template_id,
    };

    const response = await axios.post("https://waserver.pro/api/create-message", messageData);

    return NextResponse.json(
      {
        message: "WhatsApp message sent successfully",
        data: { appkey, lead_id },
        status: response.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in handleWhatsappMessageLeads:", error);

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

    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
};

/* -------------------------------------------------------------------------- */
/*                   HANDLE CUSTOM WHATSAPP MESSAGES (MANUAL)                 */
/* -------------------------------------------------------------------------- */
export const handleLeadsCustomMessages = async (req) => {
  const server = await getCurrentServer();
  console.log("Current Server Selected:", server);

  try {
    const { message, appkey, lead_id, receiver, family_id, conversationId } = await req.json();

    let number;
    let familyId = null;

    if (receiver) {
      number = receiver;
      familyId = family_id;
      console.log("Receiver provided directly:", number);
    } else if (family_id) {
      familyId = family_id;
      const family = await Student.findOne({ userid: family_id });
      if (!family) {
        return NextResponse.json({ error: "family not found" }, { status: 404 });
      }
      number = family.phonenumber;
    } else {
      const user = await LeadsForm.findOne({ LEAD_ID: lead_id });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      number = user.PHONE_NO;

      const student = await Student.findOne({ phonenumber: number });
      if (student) {
        familyId = student.userid;
      }
    }

    let response;
    if (server === "baileys") {
      const baileysPayload = {
        account: appkey,
        number,
        message,
      };
      response = await axios.post("https://wa.yourfuturecampus.com/send-message", baileysPayload);
      console.log("Sent via Baileys:", response.data);
    } else {
      const messageData = {
        appkey,
        authkey: "nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG",
        to: number,
        message,
      };
      response = await axios.post("https://waserver.pro/api/create-message", messageData);
      console.log("Sent via Default Server:", response.data);
    }

    const newMessage = {
      text: message,
      isReply: true,
      sender: appkey,
      receiver: number,
      createdAt: new Date(),
    };

    let webhookEntry;
    if (familyId) {
      webhookEntry = await Webhook.findOneAndUpdate(
        { familyId },
        { $push: { conversation: newMessage } },
        { upsert: true, new: true }
      );
    } else if (lead_id) {
      webhookEntry = await Webhook.findOneAndUpdate(
        { leadId: lead_id },
        { $push: { conversation: newMessage } },
        { upsert: true, new: true }
      );
    } else if (conversationId) {
      webhookEntry = await Webhook.findOneAndUpdate(
        { conversationId },
        { $push: { conversation: newMessage } },
        { upsert: true, new: true }
      );
    } else {
      webhookEntry = new Webhook({
        leadId: lead_id,
        receiver: number,
        conversation: [newMessage],
        appkey,
      });
      await webhookEntry.save();
    }

    if (webhookEntry) {
      const oracleResponse = await webhookEntry.sendToOracle();
      console.log("Oracle Response:", oracleResponse);
    }

    return NextResponse.json(
      {
        message: "WhatsApp custom message sent successfully",
        data: {
          leadId: lead_id,
          familyId,
          conversation: message,
          isReply: true,
          appKey: appkey,
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

    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
};

/* -------------------------------------------------------------------------- */
/*            NEW HELPER: AUTO SEND MESSAGE AFTER LEAD CREATION               */
/* -------------------------------------------------------------------------- */
export async function sendLeadAutoMessage({ appkey, lead_id, template_id = "lead-welcome", text }) {
  const lead = await LeadsForm.findOne({ LEAD_ID: lead_id });
  if (!lead) throw new Error(`Lead not found for LEAD_ID=${lead_id}`);

  const number = lead.PHONE_NO;
  const server = await getCurrentServer();

  if (server === "baileys") {
    // Send via your own Baileys server
    const payload = {
      account: appkey,
      number,
      message: text || `Thank you for submitting your details. Our team will contact you soon.`,
    };
    await axios.post("https://wa.yourfuturecampus.com/send-message", payload);
  } else {
    // Send via Waserver.pro (template)
    const payload = {
      appkey,
      authkey: "nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG",
      to: number,
      template_id,
    };
    await axios.post("https://waserver.pro/api/create-message", payload);
  }
}
