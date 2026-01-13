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
  // Only WACRM is supported - always set to wacrm
  const selectedServer = "wacrm";

  const config = await ServerConfig.findOneAndUpdate(
    {},
    { selectedServer },
    { new: true, upsert: true }
  );

  return Response.json(config);
}
