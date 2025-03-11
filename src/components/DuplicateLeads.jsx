"use client";
import React, { useEffect, useState } from "react";

const DuplicateLeads = ({ leadId }) => {
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!leadId) {
      router.push(`/admin/leads1/leads-data/profile/${leadId}`);
    } else {
      (async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/leads/duplicate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ Lead_Id: leadId }),
          });

          const data = await response.json();
          console.log("data im getting is", data);

          if (response.ok) {
            setLeadsData(data.data || []);
          } else {
            console.error("Error fetching leads:", data.error);
            setLeadsData([]);
          }
        } catch (error) {
          console.error("Error:", error);
          setLeadsData([]);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [leadId]);

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
    <div className="flex justify-center min-h-screen bg-gray-100 p-4 sm:p-10">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl border border-gray-200 p-6 sm:p-10">
        {leadsData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadsData.map((lead, index) => (
              <div
                key={index}
                className="   shadow-md rounded-lg p-6 border border-teal-200 hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold text-teal-900 mb-3">
                  {lead.FULL_NAME}
                </h3>
                <div className="space-y-2">
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Email:</span> {lead.EMAIL}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Phone:</span> {lead.PHONE_NO}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Country:</span> {lead.COUNTRY}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">State:</span> {lead.STATE}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Time Zone:</span>{" "}
                    {lead.TIME_ZONE}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Currency:</span>{" "}
                    {lead.CURRENCY}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Lead IP:</span> {lead.LEAD_IP}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">WhatsApp Status:</span>{" "}
                    {lead.WHATSAPP_STATUS}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Synced to Oracle:</span>{" "}
                    {lead.syncedToOracle ? "Yes" : "No"}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Created At:</span>{" "}
                    {new Date(lead.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Updated At:</span>{" "}
                    {new Date(lead.updatedAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-teal-800">
                    <span className="font-medium">Remarks:</span> {lead.REMARKS}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-teal-800">No duplicate leads found.</p>
        )}
      </div>
    </div>
  );
};

export default DuplicateLeads;
