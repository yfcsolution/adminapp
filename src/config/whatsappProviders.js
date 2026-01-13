// WhatsApp Providers Configuration
// Only WACRM (WhatsApp Cloud API) is supported

export const WHATSAPP_PROVIDERS = {
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
  return WHATSAPP_PROVIDERS[providerName] || WHATSAPP_PROVIDERS.wacrm;
}

// Get provider base URL
export function getProviderUrl(providerName, endpoint) {
  const provider = getWhatsAppProvider(providerName);
  const endpointPath = provider.endpoints[endpoint] || "";
  return `${provider.baseUrl}${endpointPath}`;
}
