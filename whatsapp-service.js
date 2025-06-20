import {
  makeWASocket,
  useMultiFileAuthState,
  delay,
  DisconnectReason,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import express from "express";
import pino from "pino";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

// Get root directory
const __dirname = path.resolve();

// Load number registry
const numberRegistryPath = path.join(__dirname, "number-registry.json");
const numberRegistry = JSON.parse(fs.readFileSync(numberRegistryPath));
const logger = pino({ level: "error" });

// Store connections per country
const connections = new Map();

async function connectToWhatsApp(countryCode) {
  // Get number from registry
  const number = numberRegistry[countryCode];
  if (!number) throw new Error(`No number registered for ${countryCode}`);

  // Create country-specific auth directory (absolute path)
  const authDir = path.join(__dirname, `auth_info_${countryCode}`);

  // Create directory if it doesn't exist with error handling
  if (!fs.existsSync(authDir)) {
    try {
      fs.mkdirSync(authDir, { recursive: true });
      console.log(`✅ Created auth directory: ${authDir}`);
    } catch (err) {
      console.error(`❌ Failed to create auth directory: ${err}`);
      throw new Error("Auth directory creation failed");
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  const sock = makeWASocket({
    auth: state,
    logger: logger,
    printQRInTerminal: false,
    shouldIgnoreJid: () => false,
    connectTimeoutMs: 30_000,
  });

  // Store connection
  connections.set(countryCode, {
    sock,
    qr: null,
    isConnected: false,
    number: number,
    authDir: authDir,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const connection = connections.get(countryCode);
    if (!connection) return;

    const { qr: qrData, lastDisconnect, connection: connStatus } = update;

    if (qrData) {
      try {
        // Generate QR code as SVG string
        const qrSvg = await qrcode.toString(qrData, {
          type: "svg",
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });

        connection.qr = qrSvg;
        console.log(`📢 QR code generated for ${countryCode}`);
      } catch (error) {
        console.error(`❌ Failed to generate QR for ${countryCode}:`, error);
      }
    }

    if (connStatus === "open") {
      connection.isConnected = true;
      connection.qr = null;
      console.log(`✅ ${countryCode} CONNECTED as: ${number}`);
    }

    if (connStatus === "close") {
      connection.isConnected = false;

      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log(`🔄 Reconnecting ${countryCode} in 5 seconds...`);
        await delay(5000);
        connectToWhatsApp(countryCode).catch(console.error);
      } else {
        console.log(`❌ Connection closed permanently for ${countryCode}`);
        // Clean up connection
        connections.delete(countryCode);
      }
    }
  });

  return sock;
}

// API Endpoints
app.get("/init/:country", (req, res) => {
  const country = req.params.country;

  if (!numberRegistry[country]) {
    return res.status(400).json({
      error: "Invalid country code",
      validCountries: Object.keys(numberRegistry),
    });
  }

  // Connect if not already connected
  if (!connections.has(country)) {
    console.log(`🚀 Initializing connection for ${country}...`);
    connectToWhatsApp(country).catch((err) => {
      console.error(`❌ Failed to connect ${country}:`, err);
    });
  }

  const connection = connections.get(country) || {};
  res.json({
    qr: connection.qr,
    status: connection.isConnected
      ? "CONNECTED"
      : connection.qr
      ? "QR_READY"
      : "CONNECTING",
    number: numberRegistry[country],
  });
});

app.post("/send", async (req, res) => {
  const { country, number, message } = req.body;

  // Validate country
  if (!numberRegistry[country]) {
    return res.status(400).json({
      error: "Invalid country code",
      validCountries: Object.keys(numberRegistry),
    });
  }

  // Get connection
  const connection = connections.get(country);
  if (!connection || !connection.sock) {
    return res.status(400).json({
      error: "Connection not initialized",
      solution: `Visit /init/${country} first`,
    });
  }

  if (!connection.isConnected) {
    return res.status(400).json({
      error: "Not connected",
      solution: "Scan QR code first",
    });
  }

  // Validate number
  const cleanNumber = number.toString().replace(/\D/g, "");
  if (!cleanNumber.match(/^\d{10,15}$/)) {
    return res.status(400).json({
      error: "Invalid number format",
      example: numberRegistry[country],
    });
  }

  try {
    const jid = `${cleanNumber}@s.whatsapp.net`;
    await connection.sock.sendMessage(jid, { text: message });

    console.log(`✉️ Message sent to ${cleanNumber} via ${country}`);
    res.json({
      success: true,
      from: numberRegistry[country],
      to: cleanNumber,
    });
  } catch (error) {
    console.error(`❌ Message send error (${country}):`, error);
    res.status(500).json({
      error: error.message,
      solution: "Check connection status",
    });
  }
});

app.get("/health", (req, res) => {
  const status = {};

  for (const [country, connection] of connections.entries()) {
    status[country] = {
      status: connection.isConnected
        ? "CONNECTED"
        : connection.qr
        ? "QR_READY"
        : "CONNECTING",
      number: connection.number,
      lastActive: new Date().toISOString(),
    };
  }

  res.json({
    status: "active",
    timestamp: new Date().toISOString(),
    countries: Object.keys(numberRegistry),
    connections: status,
  });
});

app.get("/connections", (req, res) => {
  const connectionsList = [];

  for (const [country, connection] of connections.entries()) {
    connectionsList.push({
      country,
      number: connection.number,
      status: connection.isConnected
        ? "CONNECTED"
        : connection.qr
        ? "QR_READY"
        : "CONNECTING",
      authDir: connection.authDir,
    });
  }

  res.json(connectionsList);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("🟢 WhatsApp Multi-Number Service Ready");
  console.log(`🔊 Listening on port ${PORT}`);
  console.log(
    "🌍 Available countries:",
    Object.keys(numberRegistry).join(", ")
  );

  // Auto-connect all numbers on startup
  if (process.env.AUTO_CONNECT === "true") {
    console.log("🔄 Auto-connecting all countries...");
    Object.keys(numberRegistry).forEach((country) => {
      console.log(`⚡ Auto-connecting ${country}...`);
      connectToWhatsApp(country).catch(console.error);
    });
  }
});
