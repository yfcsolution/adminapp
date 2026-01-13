// utils/getCurrentServer.js
// Only WACRM is supported now - optimized to avoid unnecessary DB calls

export async function getCurrentServer() {
  // Always return wacrm - only WACRM is supported
  // No need to query database since it's always the same
  return "wacrm";
}

// Get server display name
export async function getCurrentServerName() {
  return "WACRM";
}