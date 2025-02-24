import { fetchLeadsDataOracle } from "@/controllers/oracleController";
import connectDB from "@/config/db";
import { runCors } from "@/lib/cors";

export async function GET(req) {
  try {
    // Apply CORS headers
    const corsResponse = await runCors(req);

    // Handle OPTIONS preflight response
    if (req.method === "OPTIONS") {
      return corsResponse;
    }

    // Connect to the database
    await connectDB();

    // Extract query parameters from the request URL
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10); // Default to page 1 if not provided
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10); // Default to 10 leads per page

    // Fetch leads data with pagination
    const data = await fetchLeadsDataOracle(page, pageSize);

    // Return a success response with CORS headers
    return new Response(
      JSON.stringify({
        status: 200,
        message: "Leads fetched successfully",
        data,
      }),
      {
        status: 200,
        headers: corsResponse.headers,
      }
    );
  } catch (error) {
    console.error("Error in GET handler:", error);

    // Return an error response
    return new Response(
      JSON.stringify({
        status: error.status || 500,
        message: error.message || "Internal Server Error",
      }),
      {
        status: error.status || 500,
        headers: { "Access-Control-Allow-Origin": "*" }, // Ensure errors include CORS headers
      }
    );
  }
}
