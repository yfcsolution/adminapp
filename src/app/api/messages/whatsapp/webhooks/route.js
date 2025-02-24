import Webhook from "@/models/whatsappWebhookSchema"; // Import the Webhook model
import connectDB from "@/config/db";
import LeadsForm from "@/models/LeadsForm"; // Import the LeadsForm model
import Student from "@/models/Student"; // Import the Student model

export async function POST(req) {
  try {
    // Retrieve the raw body of the request
    const rawBody = await req.text();
    const parsedBody = JSON.parse(rawBody);

    // Extract necessary data from the parsed webhook payload
    const { payload, sender, receiver } = parsedBody;
    const text = payload?.extendedTextMessage?.text || payload?.conversation;
    const senderTimestamp =
      payload?.messageContextInfo?.deviceListMetadata?.senderTimestamp;
    const recipientTimestamp =
      payload?.messageContextInfo?.deviceListMetadata?.recipientTimestamp;
    const senderKeyHash =
      payload?.messageContextInfo?.deviceListMetadata?.senderKeyHash;
    const recipientKeyHash =
      payload?.messageContextInfo?.deviceListMetadata?.recipientKeyHash;
    const messageSecret = payload?.messageContextInfo?.messageSecret;

    // Ensure the sender phone number starts with a '+'
    let formattedSender = sender;
    if (formattedSender && !formattedSender.startsWith("+")) {
      formattedSender = `+${formattedSender}`;
    }

    // Connect to MongoDB using Mongoose
    await connectDB();

    // Search for the sender in the Student model first using phoneNumber
    let leadId = null;
    let familyId = null;
    const student = await Student.findOne({
      phonenumber: formattedSender,
    });

    if (student) {
      // If found, get the family ID
      familyId = student.userid;
    } else {
      // If no student found, search for the sender in the LeadsForm model
      const leadForm = await LeadsForm.findOne({ PHONE_NO: formattedSender });

      if (leadForm) {
        // If found, get LEAD_ID from LeadsForm
        leadId = leadForm.LEAD_ID;
      }
    }

    // Define the condition to check for duplicates
    const updateCondition = familyId
      ? { familyId }
      : leadId
      ? { leadId }
      : { "conversation.sender": formattedSender };

    // Check for duplicate entry within the conversation array
    const existingWebhook = await Webhook.findOne({
      ...updateCondition,
      "conversation.senderKeyHash": senderKeyHash,
      "conversation.messageSecret": messageSecret,
      "conversation.text": text,
    });

    if (existingWebhook) {
      console.log("Duplicate webhook detected, ignoring...");
      return new Response(
        JSON.stringify({ message: "Duplicate webhook, ignoring." }),
        { status: 200 }
      );
    }

    let webhook;

    if (!leadId && !familyId) {
      // If neither leadId nor familyId is found, check for an existing webhook by conversation.sender
      webhook = await Webhook.findOne({
        "conversation.sender": formattedSender,
      });

      if (!webhook) {
        // If no webhook is found, create a new one
        webhook = new Webhook({
          conversation: [
            {
              text,
              isReply: false,
              sender: formattedSender,
              receiver,
              createdAt: new Date(),
              senderTimestamp,
              recipientTimestamp,
              senderKeyHash,
              recipientKeyHash,
              messageSecret,
            },
          ],
          isVerified: false, // Since no leadId or familyId is found, it may not be verified
        });

        // Save the new webhook to the database
        await webhook.save();

        console.log("New webhook created without leadId or familyId.");
      } else {
        // Update the existing webhook by adding the new message to the conversation array
        webhook.conversation.push({
          text,
          isReply: false,
          sender: formattedSender,
          receiver,
          createdAt: new Date(),
          senderTimestamp,
          recipientTimestamp,
          senderKeyHash,
          recipientKeyHash,
          messageSecret,
        });

        await webhook.save();
        console.log("Existing webhook updated with new conversation.");
      }
    } else {
      // If leadId or familyId is found, proceed with the usual logic
      webhook = await Webhook.findOneAndUpdate(
        familyId ? { familyId } : { leadId },
        {
          $push: {
            conversation: {
              text,
              isReply: false,
              sender: formattedSender,
              receiver,
              createdAt: new Date(),
              senderTimestamp,
              recipientTimestamp,
              senderKeyHash,
              recipientKeyHash,
              messageSecret,
            },
          },
          leadId,
          familyId,
          isVerified: true, // Update verification status
        },
        { upsert: true, new: true }
      );
    }

    // Call the sendToOracle method
    const synced = await webhook.sendToOracle();
    if (synced) {
      console.log("Data synced to Oracle successfully.");
    } else {
      console.error("Data syncing to Oracle failed.");
    }

    // Respond to the sender to acknowledge receipt
    return new Response(
      JSON.stringify({
        message: "Webhook received and data stored successfully!",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error handling webhook:", error);

    // Return error if something goes wrong
    return new Response(
      JSON.stringify({ message: "Error processing webhook" }),
      { status: 500 }
    );
  }
}
