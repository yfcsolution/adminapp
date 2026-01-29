"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiMail,
  FiInbox,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiUser,
  FiSend,
  FiPaperclip,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiCalendar,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiPlus,
} from "react-icons/fi";
import EmailComposer from "./EmailWrite";

const LeadsEmail = ({ leadId }) => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showComposeEmail, setShowComposeEmail] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const router = useRouter();

  useEffect(() => {
    if (!leadId) {
      router.push(`/admin/leads1/leads-data/profile/${leadId}`);
    } else {
      fetchEmails();
    }
  }, [leadId, activeTab, pagination.page]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setEmails([]);
    setSelectedEmail(null);
    setError(null);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);

      const body = { 
        leadId,
        page: pagination.page,
        limit: pagination.limit,
      };
      if (activeTab === "sent") {
        body.sent = true;
      } else {
        body.received = true;
      }

      const response = await axios.post("/api/email/get", body);

      let emailRecords = [];

      if (Array.isArray(response.data?.emails)) {
        emailRecords = response.data.emails;
      } else if (Array.isArray(response.data)) {
        emailRecords = response.data;
      } else if (response.data?.emails) {
        emailRecords = response.data.emails;
      } else if (response.data?.data?.emails) {
        emailRecords = response.data.data.emails;
      } else {
        emailRecords = response.data || [];
      }

      if (!Array.isArray(emailRecords)) {
        emailRecords = [emailRecords];
      }

      const allEmails = emailRecords.flatMap((record) =>
        Array.isArray(record.emails) ? record.emails : [record]
      );

      allEmails.sort(
        (a, b) =>
          new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt)
      );
      
      setEmails(allEmails);
      
      // Update pagination from response
      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      setError(
        error.response?.data?.error || error.message || "Failed to fetch emails"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const handleRefresh = () => {
    fetchEmails();
  };

  const handleNewEmail = () => {
    setShowComposeEmail(true);
  };

  const handleEmailSent = () => {
    setShowComposeEmail(false);
    fetchEmails();
  };

  const handleCloseCompose = () => {
    setShowComposeEmail(false);
  };

  const filteredEmails = emails.filter((email) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      email.subject?.toLowerCase().includes(searchLower) ||
      email.body?.toLowerCase().includes(searchLower) ||
      email.receiver?.toLowerCase().includes(searchLower) ||
      email.sender?.toLowerCase().includes(searchLower)
    );
  });

  const getEmailStatusIcon = (email) => {
    if (email.status === "delivered") {
      return <FiCheckCircle className="text-green-500" />;
    }
    if (email.status === "failed") {
      return <FiAlertCircle className="text-red-500" />;
    }
    return <FiClock className="text-yellow-500" />;
  };

  const getReadStatusIcon = (email) => {
    if (email.opened === true) {
      return <FiEye className="text-green-500 ml-2 text-sm" title="Read" />;
    } else if (email.opened === false) {
      return <FiEyeOff className="text-gray-400 ml-2 text-sm" title="Unread" />;
    }
    return null;
  };

  const hasAttachments = (email) => {
    return email.attachments && email.attachments.length > 0;
  };

  if (loading && emails.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-gray-600 flex items-center">
          <FiInbox className="mr-2" /> Loading emails...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {!selectedEmail ? (
        <div className="bg-white">
          <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold flex items-center">
                <FiInbox className="mr-2 text-teal-600" />
                {activeTab === "inbox" ? "Inbox" : "Sent Emails"}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleNewEmail}
                  className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center"
                  title="New Email"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
                <button
                  onClick={handleRefresh}
                  className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors"
                  title="Refresh emails"
                >
                  <FiRefreshCw
                    className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>

            <div className="flex border-b border-gray-200 mb-4">
              <button
                className={`py-2 px-4 font-medium text-sm flex items-center ${
                  activeTab === "inbox"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("inbox")}
              >
                <FiInbox className="mr-2" /> Inbox
              </button>
              <button
                className={`py-2 px-4 font-medium text-sm flex items-center ${
                  activeTab === "sent"
                    ? "text-teal-600 border-b-2 border-teal-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => handleTabChange("sent")}
              >
                <FiSend className="mr-2" /> Sent
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search emails..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <FiX className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <FiMail className="mr-1" />
              {filteredEmails.length}{" "}
              {filteredEmails.length === 1 ? "email" : "emails"} found
            </div>
          </div>

          {loading && emails.length > 0 && (
            <div className="p-3 text-center text-gray-500 flex items-center justify-center">
              <FiRefreshCw className="animate-spin mr-2" /> Updating emails...
            </div>
          )}

          {loading && emails.length === 0 && (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <FiRefreshCw className="animate-spin text-4xl mb-3 text-teal-500" />
              <p>Loading emails...</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-600 flex items-center justify-between">
              <div className="flex items-center">
                <FiAlertCircle className="mr-2" />
                <span>{error}</span>
              </div>
              <button
                onClick={fetchEmails}
                className="text-red-600 hover:text-red-800"
              >
                <FiRefreshCw />
              </button>
            </div>
          )}

          {!loading && filteredEmails.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredEmails.map((email) => (
                <div
                  key={email.messageId || email.id || Math.random()}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedEmail?.messageId === email.messageId
                      ? "bg-teal-50 border-l-4 border-teal-500"
                      : ""
                  }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center">
                      <div className="flex items-center mr-2">
                        {getEmailStatusIcon(email)}
                      </div>
                      <h3 className="font-medium truncate flex items-center">
                        {email.subject || "No Subject"}
                        {getReadStatusIcon(email)}
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2 flex items-center">
                      <FiCalendar className="mr-1" />
                      {formatDate(email.sentAt || email.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 truncate">
                    <FiUser className="mr-1 text-gray-400" />
                    <span>To: {email.receiver || "Unknown recipient"}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <p className="text-sm text-gray-500 truncate flex-1">
                      {email.body
                        ?.replace(/<[^>]*>?/gm, "")
                        .substring(0, 100) || "No content"}
                      ...
                    </p>
                    {hasAttachments(email) && (
                      <FiPaperclip className="ml-2 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {pagination.pages > 1 && (
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} emails
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1 || loading}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1"
                  >
                    <FiChevronLeft /> Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.pages || loading}
                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 flex items-center gap-1"
                  >
                    Next <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          ) : !loading && emails.length === 0 ? (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <FiMail className="text-4xl mb-3 text-gray-300" />
              <p>No emails found</p>
              <button
                onClick={handleNewEmail}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 flex items-center"
              >
                <FiPlus className="mr-2" /> Compose New Email
              </button>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-2 text-teal-600 hover:text-teal-800 flex items-center"
                >
                  <FiX className="mr-1" /> Clear search
                </button>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="bg-white p-4">
          <div className="mb-4 flex items-center">
            <button
              onClick={() => setSelectedEmail(null)}
              className="p-2 mr-2 text-gray-500 hover:text-teal-600 hover:bg-gray-100 rounded-full"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold flex items-center">
              <div className="flex items-center mr-2">
                {getEmailStatusIcon(selectedEmail)}
              </div>
              {selectedEmail.subject || "No Subject"}
              {getReadStatusIcon(selectedEmail)}
            </h1>
          </div>

          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <span className="font-medium w-16 flex items-center">
                <FiSend className="mr-2 text-gray-500" /> From:
              </span>
              <span>{selectedEmail.sender || "Unknown sender"}</span>
            </div>
            <div className="flex items-center mb-2">
              <span className="font-medium w-16 flex items-center">
                <FiUser className="mr-2 text-gray-500" /> To:
              </span>
              <span>{selectedEmail.receiver || "Unknown recipient"}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FiClock className="mr-2" />
              <span>
                {formatFullDate(
                  selectedEmail.sentAt || selectedEmail.createdAt
                )}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: selectedEmail.body || "<p>No content available</p>",
              }}
            />
          </div>

          {hasAttachments(selectedEmail) && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="font-medium flex items-center mb-3">
                <FiPaperclip className="mr-2" /> Attachments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedEmail.attachments?.map((attachment, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="bg-teal-100 p-2 rounded-lg mr-3">
                        <FiPaperclip className="text-teal-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-gray-500">
                          {attachment.size}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showComposeEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 p-4">
          <EmailComposer
            leadId={leadId}
            onClose={handleCloseCompose}
            onEmailSent={handleEmailSent}
          />
        </div>
      )}
    </div>
  );
};

export default LeadsEmail;
