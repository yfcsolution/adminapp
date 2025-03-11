import mongoose from "mongoose";
import axios from "axios";

const RemindersSchema = new mongoose.Schema(
  {
    P_REL_ID: {
      type: Number,
      required: true,
    },
    P_REL_TYPE: {
      type: String,
    },
    Reminders: [
      {
        P_DESCRIPTION: {
          type: String,
          required: true,
        },
        P_DATE: {
          type: String,
        },
        P_ISNOTIFIED: {
          type: Number,
          default: 0,
        },
        P_STAFF: {
          type: Number,
        },
        P_NOTIFY_BY_EMAIL: {
          type: Number,
          default: 0,
        },
        P_CREATOR: {
          type: Number,
        },
        P_CUSTOMER: {
          type: Number,
        },
        P_CONTACT: {
          type: Number,
        },
        P_ASSIGNED_TO: {
          type: Number,
        },
        P_NOTIFY_BY_SMS_CLIENT: {
          type: Number,
          default: 0,
        },
        P_STARTDATE: {
          type: String,
        },
        SYNCED: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to send data to external API after adding a reminder
RemindersSchema.methods.syncToExternalAPI = async function (
  newReminder,
  P_REL_ID,
  P_REL_TYPE
) {
  try {
    const payload = {
      P_SYNC_ID: newReminder._id.toString(),
      P_DESCRIPTION: newReminder.P_DESCRIPTION,
      P_DATE: newReminder.P_DATE,
      P_ISNOTIFIED: newReminder.P_ISNOTIFIED,
      P_REL_ID: P_REL_ID,
      P_STAFF: newReminder.P_STAFF,
      P_REL_TYPE: P_REL_TYPE,
      P_NOTIFY_BY_EMAIL: newReminder.P_NOTIFY_BY_EMAIL,
      P_CREATOR: newReminder.P_CREATOR,
      P_NOTIFY_BY_SMS_CLIENT: newReminder.P_NOTIFY_BY_SMS_CLIENT,
      P_STARTDATE: newReminder.P_STARTDATE,
    };

    const response = await axios.post(
      "http://103.18.23.62:8080/apeks/apps/erp/reminders/postdata",
      payload // Removed JSON.stringify
    );

    if (response.data.status_code == 200) {
      await mongoose
        .model("Reminders")
        .updateOne(
          { "Reminders._id": newReminder._id },
          { $set: { "Reminders.$.SYNCED": true } }
        );
    }

    return { success: true, message: "Data successfully synced" };
  } catch (error) {
    console.error(
      "Error syncing reminder data:",
      error.response?.data || error.message
    );
    return { success: false, message: "Failed to sync data" };
  }
};

export default mongoose.models.Reminders ||
  mongoose.model("Reminders", RemindersSchema);
