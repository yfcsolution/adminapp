import mongoose from "mongoose";

const { Schema } = mongoose;
// Define schema for email template
const EmailTemplateSchema = new Schema(
  {
    // Auto-incrementing template_id
    template_id: {
      type: Number,
      unique: true, // Ensure template_id is unique
    },

    // Name of the template (e.g., "Course Registration Confirmation")
    name: {
      type: String,
    },

    // Subject of the email (e.g., "Thank You for Registering for [Course Name]")
    subject: {
      type: String,
    },

    // HTML content of the email with placeholders for dynamic data
    html: {
      type: String,
    },
  },
  { timestamps: true }
);

// Pre-save hook to increment template_id
EmailTemplateSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Query the last inserted template_id from the collection
      const lastTemplate = await mongoose
        .model("EmailTemplate")
        .findOne()
        .sort({ template_id: -1 }) // Sort in descending order to get the last template
        .select("template_id"); // Only select the template_id field

      // If there's a last template, increment its template_id by 1
      if (lastTemplate) {
        this.template_id = lastTemplate.template_id + 1;
      } else {
        // If there is no template, set the first template_id as 1
        this.template_id = 1;
      }

      next(); // Proceed with saving the document
    } catch (err) {
      next(err); // If there's an error, pass it to the next middleware
    }
  } else {
    next(); // If it's not a new document, proceed as usual
  }
});

// Create the model based on the schema
const EmailTemplate =
  mongoose.models.EmailTemplate ||
  mongoose.model("EmailTemplate", EmailTemplateSchema);

export default EmailTemplate;
