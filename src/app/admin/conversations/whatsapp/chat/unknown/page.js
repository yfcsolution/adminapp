"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Chat from "@/components/ChatComponent";
import DashboardLayout from "../../../../../admin_dashboard_layout/layout";
import { FaEllipsisH } from "react-icons/fa"; // Importing the three dots icon
import Modal from "@/components/Modal";
import LeadForm from "@/components/LeadForm";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessages, setNewMessages] = useState({}); // Track new messages per conversation
  const [menuVisible, setMenuVisible] = useState(null); // For managing the menu visibility
  const [unknownConversation, setUnknownConversation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [isAuthorized, setIsAuthorized] = useState(false); // Authorization state
  const [secretCode, setSecretCode] = useState(""); // State for secret code
  const [error, setError] = useState("");
  const router = useRouter();
  // Fetch conversations from the API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get("/api/messages/whatsapp/data/unknown");
        const data = response.data.data || [];
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, []);

  // Mark the conversation as read when opened
  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    // Reset new message count for the selected conversation
    setNewMessages((prev) => ({
      ...prev,
      [conversation.leadId]: 0,
    }));
  };
  // add new conversation
  const handleNewConversation = () => {
    router.push("/admin/conversations/whatsapp/new");
  };

  const handleMenuClick = (index) => {
    setMenuVisible(menuVisible === index ? null : index); // Toggle menu visibility
  };

  const handleConvertToLead = (conversation) => {
    setUnknownConversation(conversation);
    setIsModalOpen(true); // Open the modal when Convert to Lead is clicked
    setMenuVisible(null); // Close the menu after action
  };

  const handleDeleteConversation = (conversation) => {
    console.log("Deleting conversation:", conversation);
    // Add logic to delete the conversation
    setMenuVisible(null); // Close the menu after action
  };

  const filteredConversations = conversations.filter((conversation) => {
    const familyId = conversation.familyId ? String(conversation.familyId) : "";
    const leadId = conversation.leadId ? String(conversation.leadId) : "";

    return (
      familyId.includes(searchTerm.toLowerCase()) ||
      leadId.includes(searchTerm.toLowerCase())
    );
  });

  const handleForgotCode = () => {
    router.push("/admin/settings/secret-code/forgot"); // Correctly use the router here
  };
  // Handle the secret code validation
  const handleSecretCodeSubmit = async (e) => {
    e.preventDefault();
    if (!secretCode) {
      setError("Please enter a secret code.");
      return;
    }

    try {
      const res = await fetch("/api/secret-code/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsAuthorized(true); // Unlock the data
      } else {
        setError(data.error || "Invalid secret code");
      }
    } catch (error) {
      setError("Error validating secret code.");
    }
  };
  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">
            Enter Secret Code
          </h2>
          <form onSubmit={handleSecretCodeSubmit} className="text-center">
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Please Enter Secret Code"
              className="px-4 py-2 border rounded-md border-gray-300 focus:ring-teal-500 focus:ring-2 focus:outline-none mb-4"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 mb-4"
            >
              Submit Code
            </button>
          </form>

          {error && <p className="text-red-600 text-center">{error}</p>}

          {/* Forgot Secret Code Button */}
          <div className="text-center mt-4">
            <button
              onClick={handleForgotCode}
              className="text-teal-600 hover:underline focus:outline-none"
            >
              Forgot Secret Code?
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-screen bg-gray-100 w-full">
        {/* Conversation List */}
        <div
          className={`col-span-1 bg-white rounded-lg shadow-lg ${
            selectedConversation ? "hidden md:block" : ""
          }`}
        >
          <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg shadow-md">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Conversations</h2>

              <div onClick={() => handleNewConversation()}>
                <FaPlus
                  title="add new conversation"
                  className="cursor-pointer text-xl"
                />
              </div>
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-4 px-4 py-2 border rounded-lg w-full"
            />
          </div>
          <div className="h-[600px] overflow-y-auto p-6 bg-gray-50 space-y-4">
            {filteredConversations.map((conversation, index) => (
              <div
                key={conversation.leadId || index}
                onClick={() => handleConversationClick(conversation)} // Updated click handler
                className={`relative cursor-pointer p-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl ${
                  selectedConversation?.leadId === conversation.leadId
                    ? "bg-teal-100 border-l-4 border-teal-500"
                    : "bg-white hover:bg-teal-50"
                }`}
              >
                <p className="font-medium text-teal-600 flex justify-between items-center">
                  {conversation.familyId
                    ? `familyId: ${conversation.familyId}`
                    : conversation.leadId
                    ? `leadId: ${conversation.leadId}`
                    : `Unknown: ${
                        conversation.conversation &&
                        conversation.conversation.length > 0
                          ? conversation.conversation[
                              conversation.conversation.length - 1
                            ].isReply
                            ? conversation.conversation[
                                conversation.conversation.length - 1
                              ].receiver
                            : conversation.conversation[
                                conversation.conversation.length - 1
                              ].sender
                          : "No Sender"
                      }`}

                  {!conversation.familyId && !conversation.leadId && (
                    <FaEllipsisH
                      className="text-gray-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent click
                        handleMenuClick(index);
                      }}
                    />
                  )}
                </p>

                {menuVisible === index && (
                  <div className="absolute top-10 right-4 bg-white border rounded-lg shadow-lg z-10">
                    <button
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={() => handleConvertToLead(conversation)}
                    >
                      Convert to Lead
                    </button>
                  </div>
                )}

                <p className="text-sm text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis">
                  {conversation.conversation?.length > 0 &&
                  conversation.conversation[
                    conversation.conversation.length - 1
                  ]?.text
                    ? conversation.conversation[
                        conversation.conversation.length - 1
                      ].text
                        ?.split(" ") // Safely split text
                        .slice(0, 4)
                        .join(" ") +
                      (conversation.conversation[
                        conversation.conversation.length - 1
                      ].text.split(" ").length > 5
                        ? "..."
                        : "")
                    : "No messages yet"}
                </p>

                {newMessages[conversation.leadId] > 0 && (
                  <span className="text-xs text-red-500">
                    {newMessages[conversation.leadId]} New Message
                  </span>
                )}
                <p className="text-xs text-gray-500">
                  {conversation.conversation?.length ? (
                    <>
                      {new Date(
                        conversation.conversation[
                          conversation.conversation.length - 1
                        ].createdAt
                      ).toLocaleDateString()}{" "}
                      {new Date(
                        conversation.conversation[
                          conversation.conversation.length - 1
                        ].createdAt
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  ) : (
                    "No messages yet"
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Component */}
        {selectedConversation && (
          <div className="col-span-2 flex-1">
            <div
              onClick={() => setSelectedConversation(null)}
              className="text-teal-600 cursor-pointer md:hidden flex gap-2 items-center"
            >
              <FaArrowLeft /> Back
            </div>
            <Chat selectedConversation={selectedConversation} />
          </div>
        )}
      </div>

      {/* Modal component */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {unknownConversation && <LeadForm conversation={unknownConversation} />}
      </Modal>
    </DashboardLayout>
  );
};

export default Conversations;
