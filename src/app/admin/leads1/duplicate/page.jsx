"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../admin_dashboard_layout/layout";

const DuplicateLeads = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leadsData, setLeadsData] = useState([]);
  const [error, setError] = useState(null);
  const leadId = searchParams.get("id");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");

  useEffect(() => {
    if (!leadId && !email && !phone) {
      setError("No search parameters provided. Please provide Lead ID, Email, or Phone.");
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
          const errorMsg = data.error || data.message || "Failed to fetch duplicate leads";
          setError(errorMsg);
          console.error("Error fetching leads:", errorMsg);
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
  }, [leadId, email, phone, router]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center min-h-screen p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
            <span className="text-teal-600 text-lg font-semibold">
              Loading duplicate leads...
            </span>
          </div>
        ) : error ? (
          <div className="w-full max-w-5xl">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => router.push("/admin/leads1/leads-data")}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Back to Leads
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl space-y-6">
            {/* Summary Section */}
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-300">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-teal-600">Duplicate Leads Summary</h2>
                  <p className="text-gray-700 mt-2">
                    <span className="font-semibold">Total Forms Submitted:</span>{" "}
                    {leadsData.length}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/admin/leads1/leads-data")}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Back to Leads
                </button>
              </div>
            </div>

            {/* Leads List */}
            {leadsData.length > 0 ? (
              leadsData.map((lead, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg border border-gray-300 p-6 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Header: Only Full Name */}
                  <div className="border-b border-gray-300 pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      {lead.FULL_NAME}
                    </h2>
                  </div>

                  {/* Grid for details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                    <p>
                      <span className="font-semibold text-gray-900">
                        Lead ID:
                      </span>{" "}
                      {lead.LEAD_ID}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Email:
                      </span>{" "}
                      {lead.EMAIL}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Phone:
                      </span>{" "}
                      {lead.PHONE_NO}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Country:
                      </span>{" "}
                      {lead.COUNTRY}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        State:
                      </span>{" "}
                      {lead.STATE}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Time Zone:
                      </span>{" "}
                      {lead.TIME_ZONE}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Currency:
                      </span>{" "}
                      {lead.CURRENCY}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Lead IP:
                      </span>{" "}
                      {lead.LEAD_IP}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Request Form:
                      </span>{" "}
                      {lead.REQUEST_FORM}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        WhatsApp Status:
                      </span>{" "}
                      {lead.WHATSAPP_STATUS}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Synced to Oracle:
                      </span>{" "}
                      {lead.syncedToOracle ? "Yes" : "No"}
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">
                        Created At:
                      </span>{" "}
                      {new Date(lead.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Remarks Section */}
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-700 border border-gray-300">
                    <span className="font-semibold text-gray-900">
                      Remarks:
                    </span>{" "}
                    {lead.REMARKS || "No remarks available"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-lg">
                No duplicate leads found.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default function DuplicateLeadsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DuplicateLeads />
    </Suspense>
  );
}
