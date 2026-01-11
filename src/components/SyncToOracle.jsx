import React from "react";

import axios from "axios";

export const syncDataToOracle = async (lead) => {
  try {
    const {
      LEAD_ID,
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
      WHATSAPP_STATUS,
    } = lead;

    // Construct the request body
    const requestBody = {
      LEAD_ID,
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
      WHATSAPP_STATUS,
    };

    // Make the POST request using Axios
    const response = await axios.post(
      "${ERP_BASE_URL}/yfc_erp/YfcLeads/insertleads",
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("the response is: ", response);

    // Handle the response
    if (response.status === 200) {
      console.log("Data successfully synced with Oracle:", response.data);
      return { success: true, message: response.data.message };
    } else {
      console.error("Failed to sync data with Oracle:", response.data.message);
      return { success: false, message: response.data.message };
    }
  } catch (error) {
    console.error("Error syncing data with Oracle:", error.message);
    return { success: false, message: error.message };
  }
};
