// Unified WhatsApp Message Sender
// Supports: Baileys, Waserver.pro, and WACRM

import axios from "axios";
import { getCurrentServer } from "@/config/getCurrentServer";
import { getWhatsAppProvider, getProviderUrl } from "@/config/whatsappProviders";

/**
 * Send WhatsApp message via selected provider
 * @param {Object} params - Message parameters
 * @param {string} params.to - Recipient phone number
 * @param {string} params.message - Message text
 * @param {string} params.appkey - App key (for Baileys/Waserver)
 * @param {string} params.templateName - Template name (for WACRM)
 * @param {Array} params.exampleArr - Template variables (for WACRM)
 * @param {string} params.token - API token (for WACRM)
 * @param {string} params.mediaUri - Media URI (optional)
 * @param {string} params.template_id - Template ID (for Waserver)
 * @returns {Promise<Object>} Response from WhatsApp API
 */
export async function sendWhatsAppMessage(params) {
  const {
    to,
    message,
    appkey,
    templateName,
    exampleArr,
    token,
    mediaUri,
    template_id,
  } = params;

  const server = await getCurrentServer();
  const provider = getWhatsAppProvider(server);

  console.log(`Sending WhatsApp message via ${provider.name}...`);

  try {
    let response;

    switch (server) {
      case "baileys":
        response = await sendViaBaileys({ to, message, appkey, mediaUri });
        break;

      case "waserver":
      case "other": // Backward compatibility
        response = await sendViaWaserver({
          to,
          message,
          appkey,
          template_id,
        });
        break;

      case "wacrm":
        response = await sendViaWACRM({
          to,
          templateName,
          exampleArr,
          token,
          mediaUri,
          message, // Include message in case templateName is not provided
        });
        break;

      default:
        // Fallback to Baileys for unknown servers
        console.warn(`Unknown server "${server}", falling back to Baileys`);
        response = await sendViaBaileys({ to, message, appkey, mediaUri });
    }

    console.log(`Message sent successfully via ${provider.name}:`, response.data);
    return {
      success: true,
      provider: provider.name,
      response: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error(`Error sending message via ${provider.name}:`, error);
    throw {
      success: false,
      provider: provider.name,
      error: error.message,
      details: error.response?.data,
      status: error.response?.status,
    };
  }
}

/**
 * Send message via Baileys (Self-hosted)
 */
async function sendViaBaileys({ to, message, appkey, mediaUri }) {
  const provider = getWhatsAppProvider("baileys");
  const url = getProviderUrl("baileys", "sendMessage");

  const payload = {
    account: appkey,
    number: to,
    message: message,
  };

  if (mediaUri) {
    payload.media = {
      uri: mediaUri,
    };
  }

  return await axios.post(url, payload);
}

/**
 * Send message via Waserver.pro
 */
async function sendViaWaserver({ to, message, appkey, template_id }) {
  const provider = getWhatsAppProvider("waserver");
  const url = getProviderUrl("waserver", "createMessage");

  const payload = {
    appkey: appkey,
    authkey: provider.authKey,
    to: to,
  };

  if (template_id) {
    payload.template_id = template_id;
  } else {
    payload.message = message;
  }

  return await axios.post(url, payload);
}

/**
 * Send template message via WACRM
 */
async function sendViaWACRM({ to, templateName, exampleArr, token, mediaUri }) {
  const provider = getWhatsAppProvider("wacrm");
  const url = getProviderUrl("wacrm", "sendTemplate");

  if (!token) {
    throw new Error("WACRM API token is required");
  }

  // WACRM requires templateName, but if only message is provided, use a default template
  // In production, you should always provide templateName
  const finalTemplateName = templateName || "custom_message";
  const finalExampleArr = exampleArr || (message ? [message] : []);

  const payload = {
    sendTo: to,
    templetName: finalTemplateName,
    exampleArr: finalExampleArr,
    token: token,
  };

  if (mediaUri) {
    payload.mediaUri = mediaUri;
  }

  return await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey || ""}`,
    },
  });
}

/**
 * Get phone number from Student or Lead based on userid/lead_id
 */
export async function getPhoneNumberFromDatabase({ userid, lead_id }) {
  const Student = (await import("@/models/Student")).default;
  const LeadsForm = (await import("@/models/LeadsForm")).default;
  const connectDB = (await import("@/config/db")).default;

  await connectDB();

  if (userid) {
    const student = await Student.findOne({ userid });
    if (student && student.phonenumber) {
      return student.phonenumber;
    }
  }

  if (lead_id) {
    const lead = await LeadsForm.findOne({ LEAD_ID: lead_id });
    if (lead && lead.PHONE_NO) {
      return lead.PHONE_NO;
    }
  }

  return null;
}
