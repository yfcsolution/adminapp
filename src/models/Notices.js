import mongoose from "mongoose";
import axios from "axios";

const NoticesSchema = new mongoose.Schema(
  {
    P_REL_ID: {
      type: Number,
      required: true,
    },
    P_REL_TYPE: {
      type: String,
    },
    Notices: [
      {
        P_DESCRIPTION: {
          type: String,
          required: true,
        },
        P_DATE_CONTACTED: {
          type: String,
        },
        P_ADDEDFROM: {
          type: Number,
        },
        P_DATEADDED: {
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

// Method to send data to external API after adding a notice
NoticesSchema.methods.syncToExternalAPI = async function (
  newNotice,
  P_REL_ID,
  P_REL_TYPE
) {
  try {
    const payload = {
      P_SYNC_ID: newNotice._id.toString(), // Using _id of the new notice
      P_REL_ID: P_REL_ID,
      P_REL_TYPE: P_REL_TYPE,
      P_DESCRIPTION: newNotice.P_DESCRIPTION,
      P_DATE_CONTACTED: newNotice.P_DATE_CONTACTED,
      P_ADDEDFROM: newNotice.P_ADDEDFROM,
      P_DATEADDED: newNotice.P_DATEADDED,
    };

    const response = await axios.post(
      "http://103.18.23.62:8080/apeks/apps/erp/notes/postdata",
      payload
    );

    if (response.status === 200) {
      // Update only the SYNCED field for the specific notice
      await mongoose
        .model("Notices")
        .updateOne(
          { "Notices._id": newNotice._id },
          { $set: { "Notices.$.SYNCED": true } }
        );
    }
  } catch (error) {
    console.error("Error syncing data:", error);
  }
};

export default mongoose.models.Notices ||
  mongoose.model("Notices", NoticesSchema);
