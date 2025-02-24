import mongoose from "mongoose";

const appKeySchema = new mongoose.Schema({
  appKeyId: {
    type: Number,
    default: 1,
    unique: true,
  },
  appKey: {
    type: String,
    required: true,
  },
});

// Pre-save hook to handle auto-increment logic for 'appKeyId'
appKeySchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const lastKey = await mongoose
        .model("AppKeys")
        .findOne()
        .sort({ appKeyId: -1 });
      this.appKeyId = lastKey ? lastKey.appKeyId + 1 : 1; // Start from 1 if no document exists
    } catch (error) {
      return next(error); // Pass the error to the next middleware
    }
  }
  next();
});

export default mongoose.models.AppKeys ||
  mongoose.model("AppKeys", appKeySchema);
