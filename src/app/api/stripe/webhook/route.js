import Stripe from "stripe";
import { NextResponse } from "next/server";

// Lazy initialization of Stripe to avoid build-time errors
function getStripe() {
  if (!process.env.STRIPE_SECRETE_KEY) {
    throw new Error("Stripe key missing at runtime");
  }
  return new Stripe(process.env.STRIPE_SECRETE_KEY);
}

// Disable Next.js body parser so we can handle raw body
export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle raw body
  },
};

// This will be the POST handler for your Stripe webhook
export const POST = async (req) => {
  // Log the headers to ensure you get the correct signature

  // Access the stripe-signature from headers correctly
  const sig = req.headers.get("stripe-signature"); // Use .get() for headers

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Your Stripe webhook secret

  // Get the raw body of the request
  const reqBody = await req.text(); // Get raw body as text

  let event;

  try {
    // Verify the webhook signature to make sure it's from Stripe
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(reqBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook error:", err.message);
    return NextResponse.json(
      { success: false, message: "Webhook verification failed" },
      { status: 400 }
    );
  }

  // Handle the event based on its type
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object; // This contains the session details

      // You can update your database here with the payment info
      break;

    case "payment_intent.succeeded":
      const paymentIntent = event.data.object; // This contains payment intent info

      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Respond with a success message to Stripe
  return NextResponse.json({ success: true });
};
