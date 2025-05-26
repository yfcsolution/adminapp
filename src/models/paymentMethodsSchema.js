import mongoose from "mongoose";

const paymentMethodsSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// Export the model, ensuring it's only created once
export default mongoose.models.PaymentMethods ||
  mongoose.model("PaymentMethods", paymentMethodsSchema);
