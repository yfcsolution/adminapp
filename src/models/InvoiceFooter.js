import mongoose from "mongoose";

const footerInfoSchema = new mongoose.Schema(
  {
    bank: {
      accountName: String,
      bankName: String,
      sortCode: String,
      accountNumber: String,
    },
    terms: [String],
    contact: {
      email: String,
      phone: {
        uk: String,
        au: String,
        us: String,
      },
      website: String,
    },
    footerText: {
      thankYouMessage: String,
      signatureMessage: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.FooterInfo ||
  mongoose.model("FooterInfo", footerInfoSchema);
