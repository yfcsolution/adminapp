import mongoose from "mongoose";

// Define the schema for the payment methods
const paymentMethodsSchema = new mongoose.Schema(
  {
    MethodId: {
      type: Number,
      default: 1, // Default is 1
    },
    MethodName: {
      type: String,
      required: true, // Make MethodName required
    },
    Available: {
      type: Boolean,
      default: true, // Default is true
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    minimize: false, // Prevent mongoose from removing empty objects
  }
);

// Export the model, ensuring it's only created once
export default mongoose.models.PaymentMethods ||
  mongoose.model("PaymentMethods", paymentMethodsSchema);
