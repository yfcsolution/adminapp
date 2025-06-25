// models/ServerConfig.js
import mongoose from "mongoose";

const ServerConfigSchema = new mongoose.Schema(
  {
    selectedServer: {
      type: String,
      enum: ["baileys", "other"],
      required: true,
      default: "baileys",
    },
  },
  { timestamps: true }
);

const ServerConfig =
  mongoose.models.ServerConfig ||
  mongoose.model("ServerConfig", ServerConfigSchema);
export default ServerConfig;
