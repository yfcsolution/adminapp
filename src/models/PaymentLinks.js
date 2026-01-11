import mongoose from "mongoose";
import axios from "axios";

const PaymentLinksSchema = new mongoose.Schema(
  {
    FAMILY_ID: {
      type: Number,
      required: true,
    },
    URL_LINK: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// POST hook to send data to external URL after saving
PaymentLinksSchema.post("save", async function (doc) {
  try {
    await axios.post(
      "${ERP_BASE_URL}/yfc_erp/family_paymentlink/postdata",
      {
        FAMILY_ID: doc.FAMILY_ID,
        URL_LINK: doc.URL_LINK,
      }
    );
    console.log("Payment link sent successfully to external service.");
  } catch (error) {
    console.error(
      "Error sending payment link to external service:",
      error.message
    );
  }
});

export default mongoose.models.PaymentLinks ||
  mongoose.model("PaymentLinks", PaymentLinksSchema);
