import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Sub-schema for class history
const classHistorySchema = new mongoose.Schema(
  {
    family_id: { type: Number, required: true },
    timer_id: { type: Number },
    student_id: { type: Number },
    student_name: { type: String },
    lesson_date: { type: String },
    teacher_name: { type: String },
    current_assignee: { type: String },
    current_follower: { type: String },
    class_status: { type: String },
    teacher_feedback: { type: String, default: null },
    course_name: { type: String },
    course_contents: { type: String, default: null },
  },
  { _id: false } // Prevent creation of an extra `_id` field for each sub-document
);
// Sub-schema for class history
const classScheduleSchema = new mongoose.Schema(
  {
    student_id: {
      type: Number,
    },
    student_name: {
      type: String,
    },
    registration_date: {
      type: String,
    },
    course_name: {
      type: String,
    },
    relation_type: {
      type: String,
    },
    family_id: {
      type: Number,
    },
    family_name: {
      type: String,
    },
    teacher_name: {
      type: String,
    },
    supervisor_name: {
      type: String,
    },
    class_status: {
      type: String,
    },
  },
  { _id: false } // Prevent creation of an extra `_id` field for each sub-document
);
// Sub-schema for invoice info
const invoiceInfoSchema = new mongoose.Schema(
  {
    inv_no: { type: String },
    invoice_date: { type: String },
    due_date: { type: String },
    currency: { type: String },
    total: { type: Number },
    adjustment: { type: String },
    status: { type: String },
  },
  { _id: false } // Prevent creation of an extra `_id` field for each sub-document
);
// Sub-schema for invoice info
const paymentHistorySchema = new mongoose.Schema(
  {
    payment_id: { type: Number },
    invoice_no: { type: String },
    currency: { type: String },
    amount: { type: Number },
    paymentmode: { type: String },
    paymentmethod: { type: String },
    date_: { type: String },
    daterecorded: { type: String },
    note: { type: String },
    transactionid: { type: String },
  },
  { _id: false } // Prevent creation of an extra `_id` field for each sub-document
);
// Sub-schema for invoice info
const familyDataSchema = new mongoose.Schema(
  {
    family_name: { type: String },
    email: { type: String },
    currency: { type: String },
    total_due_amount: { type: Number },
  },
  { _id: false } // Prevent creation of an extra `_id` field for each sub-document
);

const studentSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      default: 1,
      unique: true,
    },
    userid: {
      type: Number,
    },
    is_primary: { type: Number, default: 0 }, // 0 for false, 1 for true
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phonenumber: { type: String },
    title: { type: String },
    class_history: [classHistorySchema],
    class_schedule: [classScheduleSchema],
    invoice_info: [invoiceInfoSchema],
    payment_history: [paymentHistorySchema],
    family_data: [familyDataSchema],
    datecreated: { type: Date, default: Date.now },
    password: {
      type: String,
    },
    new_pass_key: { type: String },
    new_pass_key_requested: { type: Date },
    email_verified_at: { type: Date },
    email_verification_key: { type: String },
    email_verification_sent_at: { type: Date },
    last_ip: { type: String },
    last_login: { type: Date },
    last_password_change: { type: Date },
    active: { type: Number, default: 1 }, // 0 for inactive, 1 for active
    profile_image: { type: String },
    direction: { type: String, enum: ["LTR", "RTL"], default: "LTR" },
    refreshToken: {
      type: String,
    },
    invoice_emails: { type: Number, default: 0 }, // 0 for false, 1 for true
    estimate_emails: { type: Number, default: 0 },
    credit_note_emails: { type: Number, default: 0 },
    contract_emails: { type: Number, default: 0 },
    task_emails: { type: Number, default: 0 },
    project_emails: { type: Number, default: 0 },
    ticket_emails: { type: Number, default: 0 },
    resetToken: {
      type: String, // To store the reset token
    },
    resetTokenExpiry: {
      type: Date, // To store the expiration time of the reset token
    },
  },
  { minimize: false }
);

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

studentSchema.methods.genrateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

studentSchema.methods.genrateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export default mongoose.models.Student ||
  mongoose.model("Student", studentSchema);
