"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DuplicateLeads = ({ leadId, email, phone }) => {
  const router = useRouter();
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!leadId && !email && !phone) {
      setError("No search parameters provided");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/leads/duplicate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            Lead_Id: leadId || null,
            Email: email || null,
            Phone: phone || null,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success !== false) {
          setLeadsData(data.data || []);
        } else {
          setError(data.error || data.message || "Failed to fetch duplicate leads");
          setLeadsData([]);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("An error occurred while fetching duplicate leads");
        setLeadsData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [leadId, email, phone]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-10">
      <div className="w-full max-w-5xl mx-auto">
        {leadsData.length > 0 ? (
          <div className="space-y-6">
            {leadsData.map((lead, index) => (
              <div
                key={index}
                className="bg-white  overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-teal-700 mb-4">
                    {lead.FULL_NAME}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        Email:
                      </span>
                      <span className="text-sm text-gray-700">{lead.EMAIL}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        Phone:
                      </span>
                      <span className="text-sm text-gray-700">
                        {lead.PHONE_NO}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        Country:
                      </span>
                      <span className="text-sm text-gray-700">
                        {lead.COUNTRY}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        State:
                      </span>
                      <span className="text-sm text-gray-700">{lead.STATE}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        Time Zone:
                      </span>
                      <span className="text-sm text-gray-700">
                        {lead.TIME_ZONE}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        Currency:
                      </span>
                      <span className="text-sm text-gray-700">
                        {lead.CURRENCY}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        Lead IP:
                      </span>
                      <span className="text-sm text-gray-700">
                        {lead.LEAD_IP}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        WhatsApp:
                      </span>
                      <span className="text-sm text-gray-700">
                        {lead.WHATSAPP_STATUS}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        Synced:
                      </span>
                      <span className="text-sm text-gray-700">
                        {lead.syncedToOracle ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        Created At:
                      </span>
                      <span className="text-sm text-gray-700">
                        {new Date(lead.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        Updated At:
                      </span>
                      <span className="text-sm text-gray-700">
                        {new Date(lead.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-24">
                        Remarks:
                      </span>
                      <span className="text-sm text-gray-700">
                        {lead.REMARKS}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No duplicate leads found.</p>
        )}
      </div>
    </div>
  );
};

export default DuplicateLeads;
