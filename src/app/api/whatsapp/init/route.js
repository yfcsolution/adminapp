export async function GET(req) {
  try {
    // Parse and validate input
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country");

    if (!country) {
      return Response.json(
        {
          error: "Country parameter is required",
          validCountries: ["US", "UK", "PK", "SA", "IN", "AE", "CA"], // Add your actual supported countries
        },
        { status: 400 }
      );
    }

    // Prepare authentication
    const authString = `${process.env.SERVICE_ADMIN_USER}:${process.env.SERVICE_ADMIN_PASS}`;
    const auth = Buffer.from(authString).toString("base64"); // More reliable than btoa
    const endpoint = `${process.env.WHATSAPP_SERVICE_URL}/init/${country}`;

    console.log(`Initializing WhatsApp connection for ${country}...`);
    console.log(`Endpoint: ${endpoint}`);

    // Make request to WhatsApp service
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
      // Add timeout if needed
      // signal: AbortSignal.timeout(5000) // Node.js 17+ or use a polyfill
    });

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`WhatsApp service error: ${errorText}`);

      try {
        const errorData = JSON.parse(errorText);
        return Response.json(errorData, { status: response.status });
      } catch {
        return Response.json(
          { error: `WhatsApp service returned status ${response.status}` },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    console.log(`Successfully initialized connection for ${country}`);
    return Response.json(data);
  } catch (error) {
    console.error("Init error:", error);
    return Response.json(
      {
        error: error.message || "Failed to initialize WhatsApp connection",
        solution: "Check the WhatsApp service status and logs",
        // Only include stack trace in development
        ...(process.env.NODE_ENV === "development" && {
          stack: error.stack,
          details: error.cause,
        }),
      },
      { status: 500 }
    );
  }
}
