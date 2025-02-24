import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    COURSE_ID_PK: { type: Number, required: true, unique: true },
    COURSE_CATEGORY_ID_FK: { type: Number },
    COURSE_NAME: { type: String, required: true },
    COURSE_SHORT_NAME: { type: String },
    STATUS: { type: String },
    LANGUAGE_ID: { type: Number },
    COURSE_FEE: { type: Number },
    COURSE_DURATION: { type: String },
    USER_FILE_NAME: { type: String },
    INTERNAL_FILE_NAME: { type: String },
    CREATED_BY: { type: String },
    CREATED_DATE: { type: Date, default: Date.now },
    UPDATED_BY: { type: String },
    UPDATED_DATE: { type: Date },
    COURSE_GENDER: { type: String },
    SORTING: { type: Number, default: 0 },
    COURSE_ADDED: { type: Boolean },
    IMAGE_LINK: { type: String },
    COURSE_DESCRIPTION: { type: String },
    CLASS_START_DATE: { type: Date },
    COURSE_STATUS: { type: String },
  },
  { minimize: false }
);

const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

export default Course; 