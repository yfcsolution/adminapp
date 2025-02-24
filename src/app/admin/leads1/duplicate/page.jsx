"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../admin_dashboard_layout/layout";

const DuplicateLeads = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leadsData, setLeadsData] = useState([]);
  const leadId = searchParams.get("id");

  useEffect(() => {
    if (!leadId) {
      router.push("/admin/leads1/leads-data");
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
  }, [leadId, router]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center min-h-screen p-6">
        {loading ? (
          <span className="text-teal-600 text-lg font-semibold">
            Loading...
          </span>
        ) : (
          <div className="w-full max-w-5xl space-y-6">
            {/* Summary Section */}
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-300">
              <h2 className="text-xl font-bold text-teal-600">Summary</h2>
              <p className="text-gray-700 mt-2">
                <span className="font-semibold">Total Forms Submitted:</span>{" "}
                {leadsData.length}
              </p>
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
