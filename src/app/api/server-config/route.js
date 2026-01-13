// app/api/server-config/route.js
import ServerConfig from "@/models/WhatsappServerSwitch";
import connectDB from "@/config/db";

export async function GET() {
  await connectDB();
  const config =
    (await ServerConfig.findOne()) || (await ServerConfig.create({}));
  return Response.json(config);
}

export async function POST(req) {
  await connectDB();
  let { selectedServer } = await req.json();

  // Backward compatibility: Migrate "other" to "waserver"
  if (selectedServer === "other") {
    selectedServer = "waserver";
  }

  // Validate server value
  const validServers = ["baileys", "waserver", "wacrm"];
  if (!validServers.includes(selectedServer)) {
    return Response.json(
      { error: `Invalid server. Must be one of: ${validServers.join(", ")}` },
      { status: 400 }
    );
  }

  const config = await ServerConfig.findOneAndUpdate(
    {},
    { selectedServer },
    { new: true, upsert: true }
  );

  return Response.json(config);
}
