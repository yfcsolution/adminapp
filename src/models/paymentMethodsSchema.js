import mongoose from "mongoose";

// Define the schema for the payment methods
const paymentMethodsSchema = new mongoose.Schema(
  {
    MethodId: {
      type: Number,
      unique: true,
      default: 1, // Default is 1
    },
    MethodName: {
      type: String,
      required: true, // Make MethodName required
      unique: true,
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

// Pre-save hook to handle auto-increment logic for 'MethodId'
paymentMethodsSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Fetch the last document based on MethodId, sorted in descending order
      const lastMethod = await mongoose
        .model("PaymentMethods")
        .findOne()
        .sort({ MethodId: -1 });

      // Increment MethodId, or start from 1 if no document exists
      this.MethodId = lastMethod ? lastMethod.MethodId + 1 : 1;
    } catch (error) {
      console.error("Error in auto-increment logic: ", error);
      return next(error); // Pass the error to the next middleware
    }
  }
  next(); // Continue with the save operation
});

// Export the model, ensuring it's only created once
export default mongoose.models.PaymentMethods ||
  mongoose.model("PaymentMethods", paymentMethodsSchema);
