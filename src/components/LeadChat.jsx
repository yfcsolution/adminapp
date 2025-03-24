"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

const LeadChat = ({ leadId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [appKey, setAppKey] = useState("044d31bc-1666-4f72-8cc2-32be88c8a6d7"); // Default appkey
  const messagesEndRef = useRef(null); // Ref to scroll to the last message

  // Fetch messages from API on component mount or when leadId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (leadId) {
        try {
          const response = await axios.post("/api/messages/whatsapp/chat", {
            leadId,
          });
          console.log("reponse i acheievd is", response);

          const conversationMessages =
            response.data.data?.flatMap((msg) => msg.conversation) || [];
          setMessages(conversationMessages); // Extract messages from conversation array
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };

    fetchMessages();
  }, [leadId]); // Now depending on leadId instead of selectedConversation

  // Set appKey dynamically based on the last message's sender
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage.isReply && lastMessage.receiver) {
        // Determine appKey based on receiver number
        switch (lastMessage.receiver) {
          case "19142791693":
            setAppKey("044d31bc-1666-4f72-8cc2-32be88c8a6d7"); // US WhatsApp
            break;
          case "61480050048":
            setAppKey("3fa548ce-ec9b-4906-8c5a-f48b0ef69cc8"); // AU WhatsApp
            break;
          case "447862067920":
            setAppKey("be4f69af-d825-4e7f-a029-2a68c5f732c9"); // UK WhatsApp
            break;
          case "923045199176":
            setAppKey("1fea0f8e-72f0-4ce4-8d3d-406b91b92e55"); // PK WhatsApp
            break;
          default:
            setAppKey("044d31bc-1666-4f72-8cc2-32be88c8a6d7"); // Default to US WhatsApp
        }
      } else if (lastMessage.isReply && lastMessage.sender) {
        setAppKey(lastMessage.sender);
      }
    }
  }, [messages]); // Re-run this effect when messages change

  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const receiver = messages.length
      ? messages[messages.length - 1]?.isReply
        ? messages[messages.length - 1]?.receiver
        : messages[messages.length - 1]?.sender
      : null; // Determine receiver based on isReply status

    const payload = {
      lead_id: leadId, // Use leadId directly
      receiver: receiver,
      appkey: appKey,
      message: newMessage,
    };
    console.log("The payload is", payload);

    try {
      // Post the message to the custom API
      await axios.post("/api/messages/whatsapp/custom-message", payload);

      // Update the local messages state
      const newMessageData = {
        ...payload,
        isReply: true, // Simulate a reply
        createdAt: new Date().toISOString(),
        text: newMessage, // Ensure message text is included
      };
      setMessages((prev) => [...prev, newMessageData]);

      // Clear the input field after sending the message
      setNewMessage("");

      // Optionally fetch the updated messages list after sending the message
      const response = await axios.post("/api/messages/whatsapp/chat", {
        leadId,
      });
      const updatedMessages =
        response.data.data?.flatMap((msg) => msg.conversation) || [];
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Send a welcome message
  const sendWelcomeMessage = async () => {
    const welcomeMessage = ` Assalam o Alaikum!  
  🌟 Welcome to IlmulQuran.com!  

  Excited to begin your Qur'an learning journey? Enroll in a free trial class and explore our courses:  

  📚 Courses Offered:  
  - Quran Classes with Tajweed  
  - Translation and Memorization  
  - Taleem ul Islam (Islamic Education)  

  👩‍🏫 Qualified Instructors:  
  - Male & female teachers available 24/7 via Zoom/Teams.  
  🌐 Multilingual Learning:  
  - Courses are available in multiple languages.  

  To schedule your free trial class, simply reply with:  
  - Your Full Name  
  - Preferred Date & Time (please mention your timezone)  

  📧 Contact us at admin@ilmulquran.com  
  If you’d like to provide further details to confirm your class, click the link below:  
  👉 https://ap.ilmulquran.com/thank-you?id=${leadId}  

  IlmulQuran Team`;
    const receiver = messages.length
      ? messages[messages.length - 1]?.isReply
        ? messages[messages.length - 1]?.receiver
        : messages[messages.length - 1]?.sender
      : null; // Determine receiver based on isReply status

    const payload = {
      lead_id: leadId, // Use leadId directly
      receiver: receiver,
      appkey: appKey,
      message: welcomeMessage,
    };

    try {
      // Post the welcome message to the custom API
      await axios.post("/api/messages/whatsapp/custom-message", payload);

      // Update the local messages state
      const newMessageData = {
        ...payload,
        isReply: true, // Simulate a reply
        createdAt: new Date().toISOString(),
        text: welcomeMessage, // Ensure message text is included
      };
      setMessages((prev) => [...prev, newMessageData]);

      // Optionally fetch the updated messages list after sending the message
      const response = await axios.post("/api/messages/whatsapp/chat", {
        leadId,
      });
      const updatedMessages =
        response.data.data?.flatMap((msg) => msg.conversation) || [];
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error sending welcome message:", error);
    }
  };

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex w-full justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white flex flex-col">
        {/* Chat Header */}
        <div className=" text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-2xl font-semibold text-black">Chat</h2>
          <p className="text-sm opacity-90 text-green-500">User - Online</p>
          <button
            className="mt-2 px-4 py-2 bg-white text-teal-600 font-semibold text-sm border rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-teal-600"
            onClick={sendWelcomeMessage}
          >
            Send Welcome Message
          </button>
        </div>

        {/* Chat Messages */}
        <div className="h-[60vh] sm:h-[70vh] md:h-[80vh] max-h-screen overflow-y-auto p-4 bg-gray-50 flex-1 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id || msg.createdAt} // Use unique key
              className={`flex ${
                msg.isReply ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                  msg.isReply
                    ? "bg-teal-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <p className="font-medium">
                  {!msg.isReply && `To: +${msg.receiver || "Unknown Receiver"}`}
                  {msg.isReply && (
                    <>
                      From&nbsp;
                      {msg.sender === "be4f69af-d825-4e7f-a029-2a68c5f732c9"
                        ? "UK WHATSAPP"
                        : msg.sender === "3fa548ce-ec9b-4906-8c5a-f48b0ef69cc8"
                        ? "AU WHATSAPP"
                        : msg.sender === "1fea0f8e-72f0-4ce4-8d3d-406b91b92e55"
                        ? "PK WHATSAPP"
                        : msg.sender === "044d31bc-1666-4f72-8cc2-32be88c8a6d7"
                        ? "US WHATSAPP"
                        : msg.sender}
                    </>
                  )}
                </p>
                <p className="font-medium">{msg.text || "No message text"}</p>
                <p
                  className={`mt-2 text-xs ${
                    msg.isReply ? "text-gray-200" : "text-gray-500"
                  }`}
                >
                  {msg.createdAt
                    ? `${new Date(
                        msg.createdAt
                      ).toLocaleDateString()} ${new Date(
                        msg.createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Unknown Time"}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* To scroll to the last message */}
        </div>

        {/* Chat Input */}
        <div className="flex flex-col sm:flex-row items-center bg-white px-4 py-4 border-t rounded-b-lg gap-2">
          <select
            value={appKey}
            onChange={(e) => setAppKey(e.target.value)}
            className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm w-full sm:w-1/4"
          >
            <option value="044d31bc-1666-4f72-8cc2-32be88c8a6d7">
              US AppKey
            </option>
            <option value="1fea0f8e-72f0-4ce4-8d3d-406b91b92e55">
              PK AppKey
            </option>
            <option value="3fa548ce-ec9b-4906-8c5a-f48b0ef69cc8">
              AU AppKey
            </option>
            <option value="be4f69af-d825-4e7f-a029-2a68c5f732c9">
              UK AppKey
            </option>
          </select>
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm w-full"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            className="w-full sm:w-auto px-6 py-3 bg-teal-600 text-white font-semibold text-sm rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-600"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadChat;