import mongoose from "mongoose";

// Define the email schema
const emailSchema = new mongoose.Schema(
  {
    to: {
      type: String,
    },
    from: {
      type: String,
    },
    leadId: {
      type: Number,
      index: true,
    },
    familyId: {
      type: Number,
      index: true,
    },
    emails: [
      {
        subject: {
          type: String,
          required: [true, "Subject is required"],
          trim: true,
        },
        body: {
          type: String,
          required: [true, "Body is required"],
        },
        isReply: {
          type: Boolean,
          default: false,
        },
        sender: {
          type: String,
          required: [true, "Sender is required"],
          validate: {
            validator: function (v) {
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`,
          },
        },
        receiver: {
          type: String,
          required: [true, "Receiver is required"],
          validate: {
            validator: function (v) {
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`,
          },
        },
        createdAt: {
          type: Date,
          default: Date.now,
          immutable: true,
        },
        messageId: {
          type: String,
          required: [true, "Message ID is required"],
          index: true,
        },
        opened: {
          type: Boolean,
          default: false,
        },
        openedAt: {
          type: String,
          default: "",
        },
        sent: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// Add compound index for better query performance
emailSchema.index({ "emails.messageId": 1 });

// Add pre-save hook to ensure messageId uniqueness within a document
emailSchema.pre("save", async function (next) {
  const messageIds = new Set();
  for (const email of this.emails) {
    if (messageIds.has(email.messageId)) {
      throw new Error(`Duplicate messageId found: ${email.messageId}`);
    }
    messageIds.add(email.messageId);
  }
  next();
});

// Create the model
const Email = mongoose.models.Email || mongoose.model("Email", emailSchema);

// Export the model
export default Email;
