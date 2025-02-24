"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../../admin_dashboard_layout/layout";
import axios from "axios";

const EmailTable = ({ conversations, onClickConversation }) => {
  return (
    <div className="overflow-y-auto max-h-screen">
      <table className="min-w-full bg-white border border-teal-300 shadow-md rounded-md">
        <thead className="bg-teal-100">
          <tr>
            <th className="py-3 px-6 text-left">Lead ID</th>
            <th className="py-3 px-6 text-left">Family ID</th>
            <th className="py-3 px-6 text-left">Synced</th>
          </tr>
        </thead>
        <tbody>
          {conversations.map((conversation, index) => (
            <tr
              key={index}
              className="hover:bg-teal-50 cursor-pointer"
              onClick={() => onClickConversation(conversation._id)}
            >
              <td className="py-3 px-6 border-b">{conversation.leadId}</td>
              <td className="py-3 px-6 border-b">{conversation.familyId}</td>
              <td className="py-3 px-6 border-b">
                {conversation.syncedToOracle ? "yes" : "no"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ConversationView = ({ conversation }) => {
  if (!conversation || !conversation.emails) {
    return (
      <div className="p-4">No conversation selected or data is missing.</div>
    );
  }

  return (
    <div className="mt-4 bg-white shadow-lg rounded-md p-4 max-h-screen overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Conversation Details</h2>
      <div className="border-t-2 border-teal-300 pt-4">
        {conversation.emails.map((email, index) => (
          <div key={index} className="mb-6">
            <div className="font-semibold">{email.sender}:</div>
            <div className="text-teal-600">{email.text}</div>
            <div className="text-sm text-teal-500">
              {new Date(email.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}{" "}
              {new Date(email.createdAt).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
            <hr className="my-4 border-teal-200" />
          </div>
        ))}
      </div>
    </div>
  );
};

const Page = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  const handleClickConversation = (conversationId) => {
    const conversation = conversations.find(
      (conversation) => conversation._id === conversationId
    );
    setSelectedConversation(conversation || null);
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("/api/emails/custom/get");
      const data = await res.data.emails;
      setConversations(data);
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Email Conversations</h1>
      <div className="flex h-screen space-x-4">
        <div className="flex-none w-1/3 bg-teal-50 shadow-md rounded-md">
          <EmailTable
            conversations={conversations}
            onClickConversation={handleClickConversation}
          />
        </div>

        <div className="flex-1 bg-gray-50 p-4 rounded-md shadow-md">
          {selectedConversation ? (
            <ConversationView conversation={selectedConversation} />
          ) : (
            <div className="text-center text-teal-600 font-semibold">
              Select a conversation to view
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Page;
