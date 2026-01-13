// models/ServerConfig.js
import mongoose from "mongoose";

const ServerConfigSchema = new mongoose.Schema(
  {
    selectedServer: {
      type: String,
      enum: ["baileys", "waserver", "wacrm", "other"], // "other" kept for backward compatibility
      required: true,
      default: "baileys",
    },
  },
  { timestamps: true }
);

// Pre-save hook to migrate "other" to "waserver"
ServerConfigSchema.pre("save", function (next) {
  if (this.selectedServer === "other") {
    this.selectedServer = "waserver";
  }
  next();
});

const ServerConfig =
  mongoose.models.ServerConfig ||
  mongoose.model("ServerConfig", ServerConfigSchema);
export default ServerConfig;
