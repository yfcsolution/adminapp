// WACRM WhatsApp Template Service
// Only WACRM provider is supported

import axios from "axios";
import { getWhatsAppProvider, getProviderUrl } from "@/config/whatsappProviders";
import WhatsAppLog from "@/models/WhatsAppLog";
import connectDB from "@/config/db";

const WACRM_PROVIDER = getWhatsAppProvider("wacrm");
const WACRM_URL = getProviderUrl("wacrm", "sendTemplate");

/**
 * Format phone number to E.164 format
 */
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;
  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
}

/**
 * Send WhatsApp template via WACRM API
 * @param {Object} params
 * @param {string} params.sendTo - Phone number
 * @param {string} params.templateName - Template name
 * @param {Array} params.exampleArr - Template variables
 * @param {string} params.token - API token
 * @param {string} params.mediaUri - Optional media URI
 * @returns {Promise<Object>}
 */
export async function sendWACRMTemplate({
  sendTo,
  templateName,
  exampleArr = [],
  token,
  mediaUri = null,
}) {
  if (!token) {
    throw new Error("WACRM API token is required");
  }

  if (!templateName) {
    throw new Error("Template name is required");
  }

  if (!sendTo) {
    throw new Error("Recipient phone number is required");
  }

  const payload = {
    sendTo: formatPhoneNumber(sendTo),
    templetName: templateName,
    exampleArr: exampleArr,
    token: token,
  };

  if (mediaUri) {
    payload.mediaUri = mediaUri;
  }

  try {
    const response = await axios.post(WACRM_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WACRM_PROVIDER.apiKey || ""}`,
      },
      timeout: 30000,
    });

    return {
      success: true,
      response: response.data,
      messageId: response.data?.metaResponse?.message_id || null,
      status: response.data?.metaResponse?.status || "sent",
    };
  } catch (error) {
    throw {
      success: false,
      error: error.message,
      details: error.response?.data,
      status: error.response?.status || 500,
    };
  }
}

/**
 * Send WhatsApp template and log the result
 * @param {Object} params
 * @param {string} params.sendTo - Phone number
 * @param {string} params.templateName - Template name
 * @param {string} params.templateId - Template ID
 * @param {Array} params.exampleArr - Template variables
 * @param {string} params.token - API token
 * @param {string} params.mediaUri - Optional media URI
 * @param {number} params.leadId - Lead ID (optional)
 * @param {number} params.userId - User ID (optional)
 * @param {string} params.type - "auto" or "manual"
 * @returns {Promise<Object>}
 */
export async function sendAndLogWhatsApp({
  sendTo,
  templateName,
  templateId = null,
  exampleArr = [],
  token,
  mediaUri = null,
  leadId = null,
  userId = null,
  type = "manual",
}) {
  await connectDB();

  let logData = {
    leadId,
    userId,
    phoneNumber: sendTo,
    templateName,
    templateId,
    exampleArr,
    mediaUri,
    type,
    status: "failed",
    sentAt: new Date(),
  };

  try {
    const result = await sendWACRMTemplate({
      sendTo,
      templateName,
      exampleArr,
      token,
      mediaUri,
    });

    // Log success
    logData.status = "success";
    logData.messageId = result.messageId;
    logData.response = result.response;

    const log = new WhatsAppLog(logData);
    await log.save();

    return {
      success: true,
      message: "WhatsApp template sent successfully",
      logId: log._id,
      ...result,
    };
  } catch (error) {
    // Log failure
    logData.error = error.error || error.message;
    logData.response = error.details || null;

    const log = new WhatsAppLog(logData);
    await log.save();

    return {
      success: false,
      error: error.error || error.message,
      logId: log._id,
      details: error.details,
    };
  }
}
