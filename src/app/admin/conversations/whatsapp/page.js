"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaTrashAlt,
  FaArrowCircleRight,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa"; // Eye icons for toggling conversation
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import Modal from "@/components/Modal";
import LeadForm from "@/components/LeadForm";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const WebhookData = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1); // Current page
  const [totalCount, setTotalCount] = useState(0); // Total number of webhooks
  const [pageSize] = useState(10); // Items per page
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [selectedWebhook, setSelectedWebhook] = useState(null); // Selected webhook for converting
  const [expandedConversations, setExpandedConversations] = useState({}); // Track which conversations are expanded
  const [filterType, setFilterType] = useState("conversationId"); // Default filter is by ID
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [searchTriggered, setSearchTriggered] = useState(false); // Flag to trigger search on button click
  const [secretCode, setSecretCode] = useState(""); // State for secret code
  const [isAuthorized, setIsAuthorized] = useState(false); // Authorization state
  const timeZone = "Asia/Karachi"; // Adjust to your desired time zone

  const router = useRouter();

  // Format date in a given timezone using Intl.DateTimeFormat
  const formatDateInTimeZone = (date, timeZone) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      day: "2-digit", // 2-digit day (e.g., "10")
      month: "short", // Abbreviated month (e.g., "NOV")
      year: "numeric", // Full year (e.g., "2024")
      hour: "2-digit", // 2-digit  hour (e.g., "08")
      minute: "2-digit", // 2-digit minute (e.g., "30")
      hour12: true, // Use 12-hour format (AM/PM)
    }).format(new Date(date));
  };

  // Fetch data when the component mounts or page changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          "/api/messages/whatsapp/webhooks/data",
          {
            params: { page, pageSize }, // Pass pagination parameters
          }
        );
        if (response.data.success) {
          setWebhooks(response.data.data);
          setTotalCount(response.data.totalCount);
        }
      } catch (error) {
        console.error("Error fetching webhook data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!searchTriggered) {
      fetchData();
    }
  }, [page, pageSize, searchTriggered]);

  const totalPages = Math.ceil(totalCount / pageSize); // Calculate total pages

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleForgotCode = () => {
    router.push("/admin/settings/secret-code/forgot"); // Correctly use the router here
  };
  // handle sync data to oracle
  const handleSyncClick = async (conversationId) => {
    try {
      // Make the POST request with LEAD_ID in the request body
      const response = await axios.post(
        "/api/messages/whatsapp/webhooks/manual-sync",
        {
          conversationId,
        }
      );
      toast.success(response.data.message);
    } catch (error) {
      // Handle any errors
      console.error("Error occurred during sync:", error.message);
      toast.error("Error occurred during sync:", error.message);
    }
  };

  const handleDelete = async (conversationId) => {
    try {
      const response = await axios.post(
        "/api/messages/whatsapp/webhooks/delete",
        { conversationId }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to delete conversation");
      console.error(error);
    }
  };

  const handleConvertToLead = (webhook) => {
    setSelectedWebhook(webhook);
    setIsModalOpen(true); // Open the modal when Convert to Lead is clicked
  };

  const shouldShowEyeIcon = (conversation) => {
    return conversation && conversation.length > 100; // Show the eye icon if conversation exceeds 100 characters
  };

  const toggleConversation = (conversationId) => {
    setExpandedConversations((prev) => ({
      ...prev,
      [conversationId]: !prev[conversationId],
    }));
  };

  // Handle search functionality
  const handleSearch = async () => {
    setSearchTriggered(true); // Trigger the search when the button is clicked
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query.");
      return;
    }

    setLoading(true);

    // Build the request URL with query parameters
    const searchUrl = `/api/messages/whatsapp/webhooks/search?query=${encodeURIComponent(
      searchQuery
    )}&field=${encodeURIComponent(filterType)}`;

    try {
      const response = await axios.get(searchUrl);
      console.log("The response I received is ", response);

      if (response) {
        setWebhooks(response.data.conversations);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      toast.error("Error fetching filtered webhooks");
      console.error("Error fetching filtered webhooks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }
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
      <div className="max-w-6xl mx-auto p-4">
        <h1 className="text-3xl font-semibold text-teal-600 mb-6 text-center">
          Webhook Logs
        </h1>

        {/* Search and Filter Section */}
        <div className="flex justify-between mb-6">
          <div className="flex space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border p-2 rounded-md"
            >
              <option value="conversationId">ID</option>
              <option value="leadId">Lead ID</option>
              <option value="familyId">Family ID</option>
              <option value="sender">Sender</option>
            </select>

            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border p-2 rounded-md"
            />

            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-teal-600 text-white rounded-md"
            >
              Search
            </button>
          </div>
        </div>

        {/* Webhook Table */}
        <table className="min-w-full table-auto border-collapse shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Family</th>
              <th className="px-4 py-2 text-left">Lead</th>
              <th className="px-4 py-2 text-left">Conversation</th>
              <th className="px-4 py-2 text-left">Sender</th>
              <th className="px-4 py-2 text-left">Receiver</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Synced</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map((webhook) => (
              <tr key={webhook._id} className="border-b hover:bg-teal-50">
                <td className="px-4 py-2">{webhook.conversationId}</td>
                <td className="px-4 py-2">{webhook.familyId || "---"}</td>
                <td className="px-4 py-2">{webhook.leadId || "---"}</td>
                <td className="px-4 py-2">
                  <div className="relative">
                    {shouldShowEyeIcon(webhook.conversation) ? (
                      <div>
                        <p>
                          {expandedConversations[webhook._id]
                            ? webhook.conversation
                            : `${webhook.conversation.slice(0, 100)}...`}
                        </p>
                        <button
                          className="absolute right-0 top-0"
                          onClick={() => toggleConversation(webhook._id)}
                        >
                          {expandedConversations[webhook._id] ? (
                            <FaEyeSlash size={18} />
                          ) : (
                            <FaEye size={18} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <p>{webhook.conversation}</p>
                    )}
                  </div>
                </td>

                <td className="px-4 py-2">{webhook.sender}</td>
                <td className="px-4 py-2">{webhook.receiver}</td>
                <td className="px-4 py-2">
                  {formatDateInTimeZone(webhook.createdAt, timeZone)}
                </td>
                <td className="px-4 py-2">
                  {webhook.syncedToOracle ? (
                    "Yes"
                  ) : (
                    <button
                      title="sync to oracle"
                      onClick={() => {
                        // Debugging log
                        handleSyncClick(webhook.conversationId);
                      }}
                      className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition duration-200"
                      aria-label="Sync to Oracle"
                    >
                      <FaArrowRight className="h-5 w-5" />
                    </button>
                  )}
                </td>
                <td className="px-4 py-2">
                  {webhook.isVerified === false && (
                    <>
                      <button
                        className="text-red-600 mx-2"
                        onClick={() => handleDelete(webhook.conversationId)}
                        title="Delete"
                      >
                        <FaTrashAlt size={20} />
                      </button>
                      <button
                        className="text-teal-600 mx-2"
                        onClick={() => handleConvertToLead(webhook)}
                        title="Convert to Lead"
                      >
                        <FaArrowCircleRight size={20} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {!searchTriggered && (
          <div className="mt-4 text-center">
            <button
              className="px-4 py-2 bg-teal-600 text-white rounded-md mx-2"
              onClick={handlePrevPage}
              disabled={page <= 1}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-teal-600 text-white rounded-md mx-2"
              onClick={handleNextPage}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal component */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedWebhook && (
          <LeadForm
            PHONE_NO={selectedWebhook.sender} // Pass sender's phone number
            REMARKS={selectedWebhook.conversation} // Pass conversation as remarks
            conversationId={selectedWebhook.conversationId} // Pass conversationId
          />
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default WebhookData;
