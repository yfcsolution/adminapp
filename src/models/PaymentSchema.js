import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  familyId: { type: Number, required: true },
  transactionId: { type: String },
  amount: { type: Number },
  currency: { type: String },
  status: { type: String },
  transactionFee: { type: Number },
  transactionMethod: { type: String },
  timestamp: { type: Date, default: Date.now },
  payerId: { type: String },
  payerEmail: { type: String },
});
// Check if the model already exists to avoid OverwriteModelError
const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
