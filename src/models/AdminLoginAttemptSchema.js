import mongoose from "mongoose";

const adminLoginAttemptSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  }, // Null if login failed due to wrong credentials
  email: { type: String, required: true }, // Store attempted email
  ipAddress: { type: String, required: true },
  userAgent: { type: String },
  status: { type: String, enum: ["success", "failed"], required: true },
  reason: { type: String, default: null }, // Example: "Invalid Password", "User Not Found"
  loginTime: { type: Date, default: Date.now },
});

const AdminLoginAttempt =
  mongoose.models.AdminLoginAttempt ||
  mongoose.model("AdminLoginAttempt", adminLoginAttemptSchema);
export default AdminLoginAttempt;
