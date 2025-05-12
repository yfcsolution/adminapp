"use client";
import { useState, useEffect } from "react";
import Head from "next/head";

export default function EmailInbox() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadEmails() {
      try {
        setLoading(true);
        const response = await fetch("/api/email/incoming");
        const data = await response.json();
        if (response.ok) {
          setEmails(data);
        } else {
          setError(data.message || "Failed to fetch emails");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEmails();
  }, []);

  // Safely filter emails to avoid errors
  const filteredEmails = emails.filter((email) => {
    const searchLower = searchTerm.toLowerCase();
    const subject = email.subject?.toLowerCase() || "";
    const from = email.from?.toLowerCase() || "";
    const text = email.text?.toLowerCase() || "";

    return (
      subject.includes(searchLower) ||
      from.includes(searchLower) ||
      text.includes(searchLower)
    );
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading all emails...</div>
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-500">
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Email Inbox</title>
      </Head>

      <h1 className="text-3xl font-bold mb-6">Email Inbox</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search emails..."
          className="w-full p-3 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredEmails.length} of {emails.length} emails
        </p>
      </div>

      <div className="space-y-4">
        {filteredEmails.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No emails found</p>
          </div>
        ) : (
          filteredEmails.map((email, index) => (
            <div
              key={index}
              className="border p-4 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold break-words">
                  {email.subject || "No Subject"}
                </h2>
                <span className="text-sm text-gray-500 whitespace-nowrap ml-2">
                  {email.date ? new Date(email.date).toLocaleString() : "Unknown Date"}
                </span>
              </div>

              <div className="mt-2">
                <p className="text-gray-600 break-words">
                  <strong>From:</strong> {email.from || "Unknown Sender"}
                </p>
                {email.to && (
                  <p className="text-gray-600 break-words">
                    <strong>To:</strong> {email.to}
                  </p>
                )}
              </div>

              <div className="mt-3">
                {email.text && (
                  <div className="whitespace-pre-line bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                    {email.text.length > 500
                      ? `${email.text.substring(0, 500)}...`
                      : email.text}
                  </div>
                )}
              </div>

              {email.attachments?.length > 0 && (
                <div className="mt-3">
                  <h3 className="font-medium">
                    Attachments ({email.attachments.length}):
                  </h3>
                  <ul className="list-disc pl-5">
                    {email.attachments.map((attachment, i) => (
                      <li key={i} className="break-all">
                        {attachment.filename || `Attachment ${i + 1}`}
                        {attachment.size && (
                          <span className="text-gray-500 text-sm ml-2">
                            ({Math.round(attachment.size / 1024)} KB)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
