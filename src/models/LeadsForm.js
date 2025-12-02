import mongoose from "mongoose";
import axios from "axios";
const leadsSchema = new mongoose.Schema(
  {
    LEAD_ID: {
      type: Number,
      unique: true,
      default: 1,
    },
    FULL_NAME: {
      type: String,
    },
    EMAIL: {
      type: String,
    },
    PHONE_NO: {
      type: String,
      required: true,
    },
    REMARKS: {
      type: String,
    },
    COUNTRY: {
      type: String,
    },
    TIME_ZONE: {
      type: String,
    },
    CURRENCY: {
      type: String,
    },
    STATE: {
      type: String,
    },
    LEAD_IP: {
      type: String,
    },
    REQUEST_FORM: {
      type: Number,
    },
    WHATSAPP_STATUS: {
      type: String,
      default: "No response",
    },
    New_Messages: {
      type: Number,
      default: 0,
    },
    Duplicate_Count: { type: Number, default: 1 },
    Duplicate_Lead_Ids: { type: [Number], default: [] },
    STUDENTS: [
      {
        CONTACT_TIME: {
          type: String,
        },
        CONTACT_METHOD: {
          type: String,
        },
        STUDENT_NAME: {
          type: String,
        },
        STUDENT_GENDER: {
          type: String,
        },
        STUDENT_AGE: {
          type: Number,
        },
        PREFERRED_COURSES: {
          type: [String],
        },
        CLASS_TIMING: {
          type: String,
        },
        SPECIAL_REQUIREMENTS: {
          type: String,
        },
        SYNCED: {
          type: Boolean,
          default: false,
        },
      },
    ],
    syncedToOracle: {
      type: Boolean,
      default: false, // Track whether the lead has been synced to Oracle
    },
    P_STATUS: {
      type: Number,
      default: 0, // Default value for status
    },
    P_LASTCONTACT: {
      type: String,
      default: "", // Default empty string
    },
    P_DATEASSIGNED: {
      type: String,
      default: "", // Default empty string
    },
    P_LAST_STATUS_CHANGE: {
      type: String,
      default: "", // Default empty string
    },
    P_DATE_CONVERTED: {
      type: String,
      default: "", // Default empty string
    },
    DEVICE: {
      type: Number,
      default: 4, // Default empty string
    },
    P_LAST_LEAD_STATUS: {
      type: Number,
      default: 0, // Default value for last lead status
    },
    P_ASSIGNED: {
      type: Number,
      default: 1,
    },
    LM_FOLLOW_UP: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// Pre-save hook to handle auto-increment logic for 'LEAD_ID'
leadsSchema.pre("save", async function (next) {
  if (this.isNew) {
    const lastLead = await mongoose
      .model("Leads")
      .findOne()
      .sort({ LEAD_ID: -1 });
    this.LEAD_ID = lastLead ? lastLead.LEAD_ID + 1 : 1; // Start from 1 if no document exists
  }
  next();
});

leadsSchema.methods.syncWithOracle = async function () {
  try {
    const oracleEndpoint =
      "https://sss.yourfuturecampus.com:8090/apeks/apps/erp/YfcLeads/insertleads"; // Update this with your actual Oracle API endpoint

    // Determine the device value based on the phone number prefix
    let deviceValue = 4; // Default device value
    if (this.PHONE_NO.startsWith("+1")) {
      deviceValue = 5; // For "+1", set device value to 5
    } else if (this.PHONE_NO.startsWith("+61")) {
      deviceValue = 2; // For "+61", set device value to 2
    } else if (this.PHONE_NO.startsWith("+92")) {
      deviceValue = 1; // For "+92", set device value to 1
    }

    // Send the lead data to Oracle
    const payload = {
      P_SYNC_ID: this._id.toString(),
      LEAD_ID: this.LEAD_ID,
      FULL_NAME: this.FULL_NAME,
      EMAIL: "********",
      PHONE_NO: "********",
      REMARKS: this.REMARKS,
      COUNTRY: this.COUNTRY,
      TIME_ZONE: this.TIME_ZONE,
      CURRENCY: this.CURRENCY,
      STATE: this.STATE,
      LEAD_IP: this.LEAD_IP,
      REQUEST_FORM: this.REQUEST_FORM,
      WHATSAPP_STATUS: this.WHATSAPP_STATUS,
      DEVICE: deviceValue, // Add device value
      P_STATUS: this.P_STATUS,
      P_LASTCONTACT: this.P_LASTCONTACT,
      P_DATEASSIGNED: this.P_DATEASSIGNED,
      P_LAST_STATUS_CHANGE: this.P_LAST_STATUS_CHANGE,
      P_DATE_CONVERTED: this.P_DATE_CONVERTED,
      P_LAST_LEAD_STATUS: this.P_LAST_LEAD_STATUS,
      P_ASSIGNED: this.P_ASSIGNED,
      LM_FOLLOW_UP: this.LM_FOLLOW_UP,
    };

    const response = await axios.post(oracleEndpoint, payload);

    // Mark as synced
    this.syncedToOracle = true;
    await this.save();

    return response.data; // Return the response data here
  } catch (error) {
    console.error("Failed to sync lead with Oracle:", error.message);
    // Optionally, handle error in the background if Oracle is down
    throw new Error("Failed to sync with Oracle"); // Throw error to be caught in the calling function
  }
};

export default mongoose.models.Leads || mongoose.model("Leads", leadsSchema);
