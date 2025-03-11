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
    const payload = {
      P_SYNC_ID: newNote._id.toString(), // Using _id of the new note
      P_REL_ID: P_REL_ID,
      P_REL_TYPE: P_REL_TYPE,
      P_DESCRIPTION: newNote.P_DESCRIPTION,
      P_DATE_CONTACTED: newNote.P_DATE_CONTACTED,
      P_ADDEDFROM: newNote.P_ADDEDFROM,
      P_DATEADDED: newNote.P_DATEADDED,
    };

    const response = await axios.post(
      "http://103.18.23.62:8080/apeks/apps/erp/notes/postdata",
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
