// Unified WhatsApp Message Sender
// Only WACRM (WhatsApp Cloud API) is supported

import axios from "axios";
import { getWhatsAppProvider, getProviderUrl } from "@/config/whatsappProviders";
import Student from "@/models/Student";
import LeadsForm from "@/models/LeadsForm";
import connectDB from "@/config/db";

// Cache provider configuration for better performance
const WACRM_PROVIDER = getWhatsAppProvider("wacrm");
const WACRM_URL = getProviderUrl("wacrm", "sendTemplate");

/**
 * Format phone number to E.164 format
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number with + prefix
 */
function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return null;
  return phoneNumber.startsWith("+") ? phoneNumber : `+${phoneNumber}`;
}

/**
 * Send WhatsApp template message via WACRM (WhatsApp Cloud API)
 * @param {Object} params - Message parameters
 * @param {string} params.to - Recipient phone number (E.164 format)
 * @param {string} params.templateName - Template name (required, must be pre-approved by Meta)
 * @param {Array} params.exampleArr - Template variables (for WACRM)
 * @param {string} params.token - API token (JWT, required for WACRM)
 * @param {string} params.mediaUri - Media URI (optional, for media templates)
 * @returns {Promise<Object>} Response from WhatsApp API
 */
export async function sendWhatsAppMessage(params) {
  const { to, templateName, exampleArr, token, mediaUri } = params;

  // Validate required fields early
  if (!token) {
    throw new Error("WACRM API token (JWT) is required for WhatsApp Cloud API");
  }

  if (!templateName) {
    throw new Error("Template name is required. Templates must be pre-approved by Meta.");
  }

  if (!to) {
    throw new Error("Recipient phone number is required");
  }

  try {
    // WhatsApp Cloud API template payload
    const payload = {
      sendTo: formatPhoneNumber(to), // Phone number in E.164 format
      templetName: templateName, // Pre-approved template name
      exampleArr: exampleArr || [], // Template variable values
      token: token, // JWT token for authentication
    };

    // Optional media URI for media templates
    if (mediaUri) {
      payload.mediaUri = mediaUri;
    }

    // Send to WACRM endpoint which forwards to WhatsApp Cloud API
    const response = await axios.post(WACRM_URL, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WACRM_PROVIDER.apiKey || ""}`,
      },
      timeout: 30000, // 30 second timeout
    });

    return {
      success: true,
      provider: WACRM_PROVIDER.name,
      response: response.data,
      status: response.status,
    };
  } catch (error) {
    throw {
      success: false,
      provider: WACRM_PROVIDER.name,
      error: error.message,
      details: error.response?.data,
      status: error.response?.status,
    };
  }
}

/**
 * Get phone number from Student or Lead based on userid/family_id/lead_id
 * Optimized with field selection for better performance
 * 
 * @param {Object} params
 * @param {string} params.userid - Student userid (same as family_id)
 * @param {string} params.family_id - Family ID (same as userid, looks up Student table)
 * @param {string} params.lead_id - Lead ID (looks up LeadsForm table)
 * @returns {Promise<string|null>} Phone number or null if not found
 */
export async function getPhoneNumberFromDatabase({ userid, family_id, lead_id }) {
  await connectDB();

  // Priority 1: Check family_id or userid (both refer to Student table)
  const familyId = family_id || userid;
  if (familyId) {
    const student = await Student.findOne({ userid: familyId }).select("phonenumber").lean();
    if (student?.phonenumber) {
      return student.phonenumber;
    }
  }

  // Priority 2: Check lead_id (LeadsForm table)
  if (lead_id) {
    const lead = await LeadsForm.findOne({ LEAD_ID: lead_id }).select("PHONE_NO").lean();
    if (lead?.PHONE_NO) {
      return lead.PHONE_NO;
    }
  }

  return null;
}
