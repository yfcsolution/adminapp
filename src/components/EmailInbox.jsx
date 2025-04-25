"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiInbox,
  FiLoader,
  FiMail,
  FiClock,
  FiUser,
  FiAlertCircle,
} from "react-icons/fi";

export default function EmailInbox() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);

  // Enhanced email body cleaner
  const cleanEmailBody = (body) => {
    if (!body) return "No message content";

    // Remove MIME boundaries and technical headers
    let cleanBody = body.replace(/--[a-zA-Z0-9]+--\r\n/g, "");
    cleanBody = cleanBody.replace(/Content-.*?\r\n\r\n/gs, "");

    // Decode quoted-printable
    cleanBody = cleanBody.replace(/=\r?\n/g, "");
    cleanBody = cleanBody.replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );

    // Remove HTML tags but preserve line breaks
    cleanBody = cleanBody.replace(/<[^>]+>/g, "");
    cleanBody = cleanBody.replace(/\r\n/g, "\n");

    // Remove quoted text and signatures
    cleanBody = cleanBody.replace(/On\s.+\s?wrote:.*$/gms, "");
    cleanBody = cleanBody.replace(/^>.*$/gm, "");
    cleanBody = cleanBody.replace(/\n-+\n.*$/s, "");

    return cleanBody.trim() || "No readable message content";
  };

  // Improved date formatting
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Extract sender name from email header
  const getSenderName = (fromHeader) => {
    if (!fromHeader) return "Unknown Sender";
    const match = fromHeader.match(/"?(.*?)"?\s*<[^>]+>/);
    return match ? match[1] : fromHeader.split("<")[0].trim();
  };

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get("/api/email/inbox");
        setEmails(response.data);
      } catch (err) {
        console.error("Error fetching emails:", err);
        setError("Failed to load emails. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleBackToInbox = () => {
    setSelectedEmail(null);
  };

  return (
    <div className="email-inbox p-4 md:p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FiInbox className="text-blue-500" /> Email Inbox
      </h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-blue-500 text-2xl mr-2" />
          <p className="text-gray-500">Loading your emails...</p>
        </div>
      ) : selectedEmail ? (
        <div className="email-detail">
          <button
            onClick={handleBackToInbox}
            className="mb-4 flex items-center text-blue-500 hover:text-blue-700"
          >
            ← Back to inbox
          </button>

          <div className="border-b pb-4 mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {selectedEmail.headers.subject?.[0] || "No Subject"}
            </h3>
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <FiUser className="mr-1" />
              <span className="font-medium mr-2">
                {getSenderName(selectedEmail.headers.from?.[0])}
              </span>
              <span className="text-gray-400">
                &lt;
                {selectedEmail.headers.from?.[0].match(/<([^>]+)>/)?.[1] ||
                  selectedEmail.headers.from?.[0]}
                &gt;
              </span>
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <FiClock className="mr-1" />
              {formatDate(selectedEmail.headers.date?.[0])}
            </div>
          </div>

          <div className="email-content bg-gray-50 p-4 rounded whitespace-pre-line">
            {cleanEmailBody(selectedEmail.body)}
          </div>
        </div>
      ) : emails.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FiMail className="text-gray-300 text-4xl mb-2" />
          <p className="text-gray-500">Your inbox is empty</p>
          <p className="text-gray-400 text-sm mt-1">
            No emails found in your inbox
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {emails.map((email, i) => {
                const from = getSenderName(email.headers.from?.[0]);
                const subject = email.headers.subject?.[0] || "No Subject";
                const date = formatDate(email.headers.date?.[0]);
                const cleanBody = cleanEmailBody(email.body);
                const preview =
                  cleanBody.substring(0, 80) +
                  (cleanBody.length > 80 ? "..." : "");

                return (
                  <tr
                    key={i}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedEmail?.uid === email.uid ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleEmailClick(email)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                          {from.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {from}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-xs">
                            {email.headers.from?.[0].match(/<([^>]+)>/)?.[1] ||
                              email.headers.from?.[0]}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {subject}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {preview}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{date}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
