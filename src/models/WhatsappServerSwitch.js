// models/ServerConfig.js
import mongoose from "mongoose";

const ServerConfigSchema = new mongoose.Schema(
  {
    selectedServer: {
      type: String,
      enum: ["wacrm"], // Only WACRM is supported
      required: true,
      default: "wacrm",
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure only wacrm is used
ServerConfigSchema.pre("save", function (next) {
  this.selectedServer = "wacrm";
  next();
});

const ServerConfig =
  mongoose.models.ServerConfig ||
  mongoose.model("ServerConfig", ServerConfigSchema);
export default ServerConfig;
