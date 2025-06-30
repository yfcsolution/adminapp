import connectDB from "@/config/db";
import Webhook from "@/models/whatsappWebhookSchema";
import { NextResponse } from "next/server";
import axios from "axios";
import { getCurrentServer } from "@/config/getCurrentServer";
import mongoose from "mongoose";

export async function POST(req) {
  await connectDB();
  const server = await getCurrentServer();
  console.log("Current Server Selected:", server);

  try {
    const { Id, message } = await req.json();
    let appKey, receiver;

    // Check if conversationId is provided
    if (Id) {
      const existingConversation = await Webhook.findOne({
        _id: new mongoose.Types.ObjectId(Id),
      });

      if (existingConversation) {
        const lastMessage =
          existingConversation.conversation[
            existingConversation.conversation.length - 1
          ];

        const sender = lastMessage?.isReply
          ? lastMessage.sender
          : lastMessage.receiver;
        receiver = lastMessage?.isReply
          ? lastMessage.receiver
          : lastMessage.sender;

        if (
          sender === "447862067920" ||
          sender === "be4f69af-d825-4e7f-a029-2a68c5f732c9"
        ) {
          appKey = "be4f69af-d825-4e7f-a029-2a68c5f732c9";
        } else if (
          sender === "61480050048" ||
          sender === "3fa548ce-ec9b-4906-8c5a-f48b0ef69cc8"
        ) {
          appKey = "3fa548ce-ec9b-4906-8c5a-f48b0ef69cc8";
        } else if (
          sender === "923045199176" ||
          sender === "1fea0f8e-72f0-4ce4-8d3d-406b91b92e55"
        ) {
          appKey = "1fea0f8e-72f0-4ce4-8d3d-406b91b92e55";
        } else if (
          sender === "19142791693" ||
          sender === "044d31bc-1666-4f72-8cc2-32be88c8a6d7"
        ) {
          appKey = "044d31bc-1666-4f72-8cc2-32be88c8a6d7";
        } else {
          appKey = "044d31bc-1666-4f72-8cc2-32be88c8a6d7"; // Default appKey
        }
      } else {
        return NextResponse.json(
          { error: "No conversation found for the provided ID" },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    // ✅ Select message payload and API endpoint
    let response;
    if (server === "baileys") {
      const baileysPayload = {
        account: appKey,
        number: receiver,
        message,
      };
      console.log("Baileys Payload:", baileysPayload);

      response = await axios.post(
        "https://baileys-r2cr.onrender.com/send-message",
        baileysPayload
      );

      console.log("Message sent via Baileys:", response.data);
    } else {
      const messageData = {
        appkey: appKey,
        authkey: "nFMsTFQPQedVPNOtCrjjGvk5xREsJq2ClbU79vFNk8NlgEb9oG",
        to: receiver,
        message,
      };

      response = await axios.post(
        "https://waserver.pro/api/create-message",
        messageData
      );

      console.log("Message sent via Default Server:", response.data);
    }

    // ✅ Save to DB if message sent successfully
    if (response.status === 200) {
      const newMessage = {
        text: message,
        isReply: true,
        sender: appKey,
        receiver,
        createdAt: new Date(),
      };

      const webhookEntry = await Webhook.findOneAndUpdate(
        { _id: Id },
        { $push: { conversation: newMessage } },
        { new: true }
      );

      // ✅ Send to Oracle
      const synced = await webhookEntry.sendToOracle();
      if (synced) {
        console.log("Data synced to Oracle successfully.");
      } else {
        console.error("Data syncing to Oracle failed.");
      }

      return NextResponse.json(
        {
          message: "WhatsApp reply message sent successfully",
          status: response.status,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in sending custom messages:", error);

    if (error.response) {
      return NextResponse.json(
        {
          error: "Failed to send WhatsApp custom message",
          details: error.response.data,
          status: error.response.status,
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
