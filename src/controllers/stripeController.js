import Stripe from "stripe";
import { NextResponse } from "next/server";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY);

export const handleStripeOrders = async (req) => {
  try {
    // Parse the incoming JSON body for amount and currency
    const { email, amount, currency, userid, family } = await req.json();

    // Validate the required parameters
    if (!amount || !currency) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Amount and currency are required.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const productDetails = {
      name: `ID: ${userid} ${family}`,
      description: `Payment for student monthly fee`,
    };
    // Prepare the line item for the payment
    const line_items = [
      {
        price_data: {
          currency: currency, // Accept currency from request
          product_data: {
            name: productDetails.name, // Use the product name from the dynamic object
            description: productDetails.description, // Use the product description from the dynamic object
          },
          unit_amount: amount * 100, // Stripe requires the amount in cents
        },
        quantity: 1, // Since it's a fixed payment, we set the quantity to 1
      },
    ];

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Allow card payments
      line_items: line_items, // Set the line items created above
      mode: "payment", // Single payment mode
      customer_email: email,
      success_url: `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/student/payment/stripe/verify?session_id={CHECKOUT_SESSION_ID}&success=true&email=${encodeURIComponent(
        email
      )}`, // Success URL
      cancel_url: `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/student/payment/stripe/verify?session_id={CHECKOUT_SESSION_ID}&success=false&email=${encodeURIComponent(
        email
      )}`, // Cancel URL
    });

    // Return the session URL to the frontend for redirection
    return new Response(
      JSON.stringify({ success: true, session_url: session.url, session }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const getStripePaymentDetails = async (req) => {
  try {
    // Parse the JSON data from the request body
    const { sessionId } = await req.json();

    // Retrieve the Stripe Checkout session using the session ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Check if the session was found
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Return the session details back to the client
    return NextResponse.json({ success: true, data: session }, { status: 200 });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
};

export const handleStripeOrdersAdmin = async (req) => {
  try {
    // Parse the incoming JSON body for amount and currency
    const { email, amount, currency, userid, family } = await req.json();

    // Validate the required parameters
    if (!amount || !currency) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Amount and currency are required.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const productDetails = {
      name: `ID: ${userid} ${family}`,
      description: `Payment for student monthly fee`,
    };
    // Prepare the line item for the payment
    const line_items = [
      {
        price_data: {
          currency: currency, // Accept currency from request
          product_data: {
            name: productDetails.name, // Use the product name from the dynamic object
            description: productDetails.description, // Use the product description from the dynamic object
          },
          unit_amount: amount * 100, // Stripe requires the amount in cents
        },
        quantity: 1, // Since it's a fixed payment, we set the quantity to 1
      },
    ];

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Allow card payments
      line_items: line_items, // Set the line items created above
      mode: "payment", // Single payment mode
      customer_email: email,
      success_url: `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/admin/student-payment/stripe/verify?session_id={CHECKOUT_SESSION_ID}&success=true&email=${encodeURIComponent(
        email
      )}`, // Success URL
      cancel_url: `${
        process.env.NEXT_PUBLIC_SITE_URL
      }/admin/student-payment/stripe/verify?session_id={CHECKOUT_SESSION_ID}&success=false&email=${encodeURIComponent(
        email
      )}`, // Cancel URL
    });

    // Return the session URL to the frontend for redirection
    return new Response(
      JSON.stringify({ success: true, session_url: session.url, session }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
