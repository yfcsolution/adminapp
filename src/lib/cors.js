export const runCors = async (req) => {
  const allowedOrigins = ["https://erp.yourfuturecampus.com"];
 // Replace "*" with your allowed origins for better security
const allowedMethods = ["GET", "POST", "OPTIONS"];
 const allowedHeaders = "Content-Type, Authorization";

//   // Check the origin of the request
 const origin = req.headers.get("origin");

//   // If the origin is not allowed, reject the request
  if (origin && !allowedOrigins.includes(origin) && allowedOrigins[0] !== "*") {     return new Response("CORS origin not allowed", { status: 403 });
  }

  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
    status: 204,
     headers: {
        "Access-Control-Allow-Origin": allowedOrigins[0],
        "Access-Control-Allow-Methods": allowedMethods.join(","),
        "Access-Control-Allow-Headers": allowedHeaders,
     },
    });
  }

//   // Add CORS headers for other requests
   return {
    headers: {
     "Access-Control-Allow-Origin": allowedOrigins[0],
       "Access-Control-Allow-Methods": allowedMethods.join(","),
     "Access-Control-Allow-Headers": allowedHeaders,
  },
   };
};
