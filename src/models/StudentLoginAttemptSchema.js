import mongoose from "mongoose";

const studentLoginAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // References the Student collection
    required: false, // Will be null if login fails (e.g., student not found)
  },
  email: {
    type: String,
    required: true, // The attempted email
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true,
  },
  reason: {
    type: String,
    default: null, // Reason for failure (e.g., "Invalid password", "Student not found")
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
});

const StudentLoginAttempt =
  mongoose.models.StudentLoginAttempt ||
  mongoose.model("StudentLoginAttempt", studentLoginAttemptSchema);

export default StudentLoginAttempt;
