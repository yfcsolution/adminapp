import { NextResponse } from "next/server";
import {
  ApiError,
  OrdersController,
  Client,
  Environment,
  LogLevel,
} from "@paypal/paypal-server-sdk";

// PayPal credentials from environment variables
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
  throw new Error(
    "PayPal client credentials are missing from environment variables"
  );
}

// Initialize PayPal Client
const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: Environment.Live,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

const ordersController = new OrdersController(client);

// Create PayPal order
export const createOrder = async (amount, currency) => {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    throw new Error("Invalid amount provided. It must be a number.");
  }

  const collect = {
    body: {
      intent: "CAPTURE",
      purchaseUnits: [
        {
          amount: {
            currencyCode: currency,
            value: numericAmount.toFixed(2),
          },
        },
      ],
    },
    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } = await ordersController.ordersCreate(
      collect
    );

    return {
      jsonResponse: JSON.parse(body),
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("API Error:", error.message);
      throw new Error(error.message);
    }
    throw new Error("Failed to create order");
  }
};

// Handle POST request to create PayPal order
export const handlePaypalOrders = async (req) => {
  try {
    const { amount, currency } = await req.json();

    if (!amount || !currency) {
      return NextResponse.json(
        { error: "Amount and currency are required." },
        { status: 400 }
      );
    }

    const { jsonResponse, httpStatusCode } = await createOrder(
      amount,
      currency
    );
    return NextResponse.json(jsonResponse, { status: httpStatusCode });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 }
    );
  }
};

// Capture PayPal order
const captureOrder = async (orderID) => {
  const collect = {
    id: orderID,
    prefer: "return=minimal",
  };

  try {
    const { body, ...httpResponse } = await ordersController.ordersCapture(
      collect
    );
    const parsedBody = JSON.parse(body);
    return {
      jsonResponse: parsedBody,
      httpStatusCode: httpResponse.statusCode,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error("API Error:", error.message);
      throw new Error(error.message);
    }

    console.error("Error capturing PayPal order:", error);
    throw new Error("Failed to capture PayPal order");
  }
};

// Capture PayPal order route handler
export const CapturePypalOrders = async (req) => {
  try {
    const { orderID } = await req.params; // Use req.query for dynamic route parameters

    if (!orderID) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
    return NextResponse.json(jsonResponse, { status: httpStatusCode });
  } catch (error) {
    console.error("Failed to capture order:", error);
    return NextResponse.json(
      { error: "Failed to capture order." },
      { status: 500 }
    );
  }
};
