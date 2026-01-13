// utils/getCurrentServer.js
import ServerConfig from "@/models/WhatsappServerSwitch";
import connectDB from "./db";

export async function getCurrentServer() {
  await connectDB();
  const config = await ServerConfig.findOne();
  let server = config?.selectedServer || "baileys";
  
  // Backward compatibility: Migrate "other" to "waserver"
  if (server === "other") {
    server = "waserver";
    // Update database for future use
    await ServerConfig.findOneAndUpdate(
      {},
      { selectedServer: "waserver" },
      { upsert: true }
    );
  }
  
  return server;
}

// Get server display name
export async function getCurrentServerName() {
  const server = await getCurrentServer();
  const serverNames = {
    baileys: "Baileys",
    waserver: "Waserver.pro",
    wacrm: "WACRM"
  };
  return serverNames[server] || "Baileys";
}