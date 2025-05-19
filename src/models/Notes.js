import mongoose from "mongoose";
import axios from "axios";

const NotesSchema = new mongoose.Schema(
  {
    P_REL_ID: {
      type: Number,
      required: true,
    },
    P_REL_TYPE: {
      type: String,
    },
    Notes: [
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

// Method to send data to external API after adding a note
NotesSchema.methods.syncToExternalAPI = async function (
  newNote,
  P_REL_ID,
  P_REL_TYPE
) {
  try {
    // Convert date format from "10 APR 2025 9:43 PM" to "04/07/2025"
    const formatDateForOracle = (dateString) => {
      if (!dateString) return "";

      const months = {
        JAN: "01",
        FEB: "02",
        MAR: "03",
        APR: "04",
        MAY: "05",
        JUN: "06",
        JUL: "07",
        AUG: "08",
        SEP: "09",
        OCT: "10",
        NOV: "11",
        DEC: "12",
      };

      const parts = dateString.split(" ");
      if (parts.length < 3) return dateString; // Return original if format unexpected

      const day = parts[0].padStart(2, "0");
      const month = months[parts[1]] || "01";
      const year = parts[2];

      return `${month}/${day}/${year}`;
    };

    const payload = {
      P_SYNC_ID: newNote._id.toString(), // Using _id of the new note
      P_REL_ID: P_REL_ID,
      P_REL_TYPE: P_REL_TYPE,
      P_DESCRIPTION: newNote.P_DESCRIPTION,
      P_DATE_CONTACTED: newNote.P_DATE_CONTACTED,
      P_ADDEDFROM: newNote.P_ADDEDFROM,
      P_DATEADDED: formatDateForOracle(newNote.P_DATEADDED), // Format the date here
    };

    const response = await axios.post(
      "https://sss.yourfuturecampus.com:8443/apeks/apps/erp/notes/postdata",
      payload
    );

    if (response.status === 200) {
      // Update only the SYNCED field for the specific notice
      await mongoose
        .model("Notes")
        .updateOne(
          { "Notes._id": newNote._id },
          { $set: { "Notes.$.SYNCED": true } }
        );
    }
  } catch (error) {
    console.error("Error syncing data:", error);
  }
};

export default mongoose.models.Notes || mongoose.model("Notes", NotesSchema);
