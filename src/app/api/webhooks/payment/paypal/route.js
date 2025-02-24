import { NextResponse } from "next/server";
import crypto from "crypto";
import crc32 from "buffer-crc32";
import fetch from "node-fetch";
import Payment from "@/models/PaymentSchema";

// PayPal Webhook ID (replace with your actual webhook ID)
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

// Webhook verification function
async function verifySignature(event, headers) {
  const transmissionId =
    headers["paypal-transmission-id"] || headers.get("paypal-transmission-id");
  const timeStamp =
    headers["paypal-transmission-time"] ||
    headers.get("paypal-transmission-time");

  // Generate the CRC32 checksum of the raw event data
  const crc = parseInt("0x" + crc32(event).toString("hex")); // CRC32 checksum of raw event data, parsed to decimal

  // Construct the message PayPal used for signature verification
  const message = `${transmissionId}|${timeStamp}|${WEBHOOK_ID}|${crc}`;
  console.log(`Original signed message: ${message}`);

  // Fetch the certificate from PayPal using the URL in the header
  const certPem = await fetch(
    headers["paypal-cert-url"] || headers.get("paypal-cert-url")
  ).then((res) => res.text());

  // Create a buffer from the base64-encoded signature
  const signatureBuffer = Buffer.from(
    headers["paypal-transmission-sig"] ||
      headers.get("paypal-transmission-sig"),
    "base64"
  );

  // Create a verification object with SHA256
  const verifier = crypto.createVerify("SHA256");

  // Add the original message to the verifier
  verifier.update(message);

  // Verify the signature
  return verifier.verify(certPem, signatureBuffer);
}

// Next.js API route handler
export async function POST(req) {
  try {
    const headers = req.headers;
    const event = await req.text(); // Get raw event body
    const data = JSON.parse(event); // Parse the JSON data

    console.log(`headers`, headers);
    console.log(`parsed json`, JSON.stringify(data, null, 2));
    console.log(`raw event: ${event}`);

    const isSignatureValid = await verifySignature(event, headers);

    if (isSignatureValid) {
      console.log("Signature is valid.");

      const eventData = data;
      console.log("Event resource is:", eventData);

      // Extract transaction details
      const transactionDetails = {
        familyId:
          parseInt(eventData?.resource?.transactions?.[0]?.custom, 10) || null,
        transactionId: eventData?.resource?.id || null,
        amount: parseFloat(
          eventData?.resource?.transactions?.[0]?.amount?.total || 0
        ),
        currency:
          eventData?.resource?.transactions?.[0]?.amount?.currency || "USD",
        status: eventData?.resource?.state || "unknown",
        transactionFee:
          eventData?.resource?.transactions?.[0]?.related_resources?.[0]?.sale
            ?.transaction_fee?.value || null,
        transactionMethod:
          eventData?.resource?.payer?.payment_method || "unknown",
        timestamp: eventData?.resource?.create_time
          ? new Date(eventData.resource.create_time)
          : new Date(),
        payerId: eventData?.resource?.payer?.payer_info?.payer_id || "unknown",
        payerEmail:
          eventData?.resource?.payer?.payer_info?.email ||
          "unknown@example.com",
      };

      console.log("Received event:", transactionDetails);

      // Save the payment details to the database
      try {
        const payment = new Payment(transactionDetails);
        await payment.save();
        console.log("Payment details saved successfully.");
      } catch (error) {
        console.error("Error saving payment details:", error);
      }
    } else {
      console.log(
        `Signature is not valid for ${data?.id} ${headers?.["correlation-id"]}`
      );
      // Reject processing the webhook event
    }

    // Return a 200 response to mark successful webhook delivery
    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
