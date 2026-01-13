// WhatsApp Providers Configuration
// Move sensitive keys to environment variables

export const WHATSAPP_PROVIDERS = {
  baileys: {
    name: "Baileys",
    type: "self-hosted",
    baseUrl: "https://wa.yourfuturecampus.com",
    backendUrl: "http://45.76.132.90:3001",
    endpoints: {
      accounts: "/accounts",
      connect: "/connect",
      disconnect: "/disconnect",
      sendMessage: "/send-message",
      events: "/events"
    }
  },
  waserver: {
    name: "Waserver.pro",
    type: "third-party",
    baseUrl: "https://waserver.pro/api",
    authKey: process.env.WHATSAPP_WASERVER_AUTH_KEY || "nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG",
    endpoints: {
      createMessage: "/create-message",
      webhook: "/cron/execute-webhook"
    }
  },
  wacrm: {
    name: "WACRM (WhatsApp Cloud API)",
    type: "whatsapp-cloud-api", // Meta's official WhatsApp Business API
    baseUrl: "https://wacrm.yfcampus.com/api/v1",
    apiKey: process.env.WHATSAPP_WACRM_API_KEY || "",
    endpoints: {
      sendTemplate: "/send_templet" // WhatsApp Cloud API template endpoint
    }
  }
};

// Get provider configuration
export function getWhatsAppProvider(providerName) {
  return WHATSAPP_PROVIDERS[providerName] || WHATSAPP_PROVIDERS.baileys;
}

// Get provider base URL
export function getProviderUrl(providerName, endpoint) {
  const provider = getWhatsAppProvider(providerName);
  const endpointPath = provider.endpoints[endpoint] || "";
  return `${provider.baseUrl}${endpointPath}`;
}
