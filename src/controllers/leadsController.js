import { NextResponse } from "next/server";
import LeadsForm from "@/models/LeadsForm";
import User from "@/models/User";
import { transporter } from "../config/nodemailer";
import axios from "axios";
import Webhook from "@/models/whatsappWebhookSchema";
import DuplicateLeads from "@/models/DuplicateLeads";
import LeadsStatus from "@/models/LeadsStatus";
import { sendLeadAutoMessage } from "@/controllers/whatsappController";

/* -------------------------------------------------------------------------- */
/*              Helper: Map country to WhatsApp appKey / device ID            */
/* -------------------------------------------------------------------------- */
function determineAppKey(country) {
  const map = {
    UK: "haji",
    USA: "iqau",
    AUS: "test1",
    CAN: "laila",
    default: "iqau",
  };
  if (!country || typeof country !== "string") return map.default;
  return map[country.toUpperCase()] || map.default;
}

export const handleLeadsSubmit = async (req) => {
  const {
    LEAD_IP,
    FULL_NAME,
    PHONE_NO,
    EMAIL,
    REMARKS,
    COUNTRY,
    TIME_ZONE,
    CURRENCY,
    STATE,
    REQUEST_FORM,
    P_ASSIGNED,
    P_STATUS,
  } = await req.json();

  let DEVICE = 4;
  if (PHONE_NO) {
    if (PHONE_NO.startsWith("+1")) DEVICE = 5;
    else if (PHONE_NO.startsWith("+61")) DEVICE = 2;
    else if (PHONE_NO.startsWith("+92")) DEVICE = 1;
  }

  try {
    if (!EMAIL || !PHONE_NO) {
      return NextResponse.json(
        { message: "Email and Phone Number are required fields.", success: false },
        { status: 400 }
      );
    }

    const existingLead = await LeadsForm.findOne({
      $or: [{ EMAIL }, { PHONE_NO }],
    });

    /* -------------------------------------------------------------------------- */
    /*                    CASE 1: DUPLICATE LEAD FOUND                            */
    /* -------------------------------------------------------------------------- */
    if (existingLead) {
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
        DEVICE,
        REQUEST_FORM,
        DATE_CREATED: new Date(),
        P_ASSIGNED,
        P_STATUS,
      };

      const newDuplicateLead = await DuplicateLeads.create(duplicateLeadData);
      if (!newDuplicateLead._id) throw new Error("Form creation failed.");

      await LeadsForm.updateOne(
        { LEAD_ID: existingLead.LEAD_ID },
        { $inc: { New_Messages: 1 } }
      );

      try {
        await newDuplicateLead.syncWithOracle();
        console.log("Data successfully synced with Oracle.");
      } catch (oracleError) {
        console.error("Oracle sync failed:", oracleError.message);
      }

      /* ✅ AUTO WHATSAPP MESSAGE FOR DUPLICATE LEAD */
      try {
        await sendLeadAutoMessage({
          appkey: determineAppKey(COUNTRY),
          lead_id: existingLead.LEAD_ID,
          template_id: "lead-welcome",
          text: `Assalam o Alaikum ${FULL_NAME}! 🌙 
We’ve received your request again — JazakAllah Khair for staying in touch! 
Our team will follow up shortly, InshaAllah.`,
        });
        console.log(`✅ WhatsApp sent for duplicate lead ${existingLead.LEAD_ID}`);
      } catch (waError) {
        console.error("❌ WhatsApp auto-send failed for duplicate:", waError.message);
      }

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
            DEVICE,
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
    }

    /* -------------------------------------------------------------------------- */
    /*                    CASE 2: NEW LEAD CREATION                               */
    /* -------------------------------------------------------------------------- */
    const newFormData = await LeadsForm.create({
      FULL_NAME,
      EMAIL,
      PHONE_NO,
      REMARKS,
      COUNTRY,
      TIME_ZONE,
      CURRENCY,
      DEVICE,
      STATE,
      LEAD_IP,
      REQUEST_FORM,
      WHATSAPP_STATUS: "no response",
      DATE_CREATED: new Date(),
      P_ASSIGNED,
      P_STATUS,
    });

    if (!newFormData) throw new Error("Form creation failed.");

    const responseData = {
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
        DEVICE,
        TIME_ZONE,
        CURRENCY,
        STATE,
        LEAD_IP,
        REQUEST_FORM,
        STUDENTS: [],
      },
    };

    // Oracle sync in background
    newFormData
      .syncWithOracle()
      .then(() => console.log("Data successfully synced with Oracle."))
      .catch((oracleError) =>
        console.error("Oracle sync failed:", oracleError.message)
      );

    /* ✅ AUTO WHATSAPP MESSAGE FOR NEW LEAD */
    try {
      await sendLeadAutoMessage({
        appkey: determineAppKey(COUNTRY),
        lead_id: newFormData.LEAD_ID,
        template_id: "lead-welcome",
        text: `Assalam o Alaikum ${FULL_NAME}! 👋 
Welcome to IlmulQuran.com 🌙 
We’ve received your request and will contact you soon for your free trial class, InshaAllah.`,
      });
      console.log(`✅ WhatsApp sent for new lead ${newFormData.LEAD_ID}`);
    } catch (waError) {
      console.error("❌ WhatsApp auto-send failed for new lead:", waError.message);
    }

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Something went wrong while submitting your form.",
        status: "error",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

/* -------------------------------------------------------------------------- */
/*     The rest of your file (message/email sending, fetch, update, etc.)     */
/* -------------------------------------------------------------------------- */
/* Leave all your remaining exports (handleMessageSending, updateLead, etc.) as is */
