"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../admin_dashboard_layout/layout";

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(`/api/webhooks/payment/paypal/getData`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setPayments(data); // API returned an array
        } else if (data.payments && Array.isArray(data.payments)) {
          setPayments(data.payments); // API returned an object with a `payments` key
        } else {
          console.error("Unexpected data format:", data);
          setPayments([]); // Fallback to an empty array
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch payment data:", error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Use the updated search endpoint and replace "query" with "familyId"
      const response = await fetch(
        `/api/webhooks/payment/paypal/search?familyId=${encodeURIComponent(
          searchQuery
        )}`
      );

      // Check for response status
      if (!response.ok) {
        throw new Error("Search failed. Please try again.");
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error("Search failed:", error);
      // Optionally, you can handle error state or display an error message to the user
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <span className="text-teal-500 text-lg font-semibold">
            Loading payments...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-teal-600 mb-6">
          Payment History
        </h1>

        {/* Search Input and Button */}
        <div className="mb-4 flex justify-center space-x-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments..."
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-teal-400 text-gray-800"
          />
          <button
            onClick={handleSearch}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 focus:outline-none"
          >
            Search
          </button>
        </div>

        {payments.length === 0 ? (
          <div className="text-center text-teal-500">
            <p>No payment data available.</p>
          </div>
        ) : (
          <div>
            {/* Table for Large Screens */}
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-lg rounded-lg">
                  <thead className="bg-teal-600 text-white">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-semibold">
                        Family ID
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold">
                        Transaction ID
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold">
                        Amount
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold">
                        Currency
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-sm font-semibold">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr
                        key={payment._id}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-6 py-4 text-gray-800">
                          {payment.familyId}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {payment.transactionId}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {payment.amount}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {payment.currency}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {payment.status}
                        </td>
                        <td className="px-6 py-4 text-gray-800">
                          {new Date(payment.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Cards for Mobile Screens */}
            <div className="block lg:hidden">
              <div className="grid grid-cols-1 gap-4">
                {payments.map((payment) => (
                  <div
                    key={payment._id}
                    className="bg-white shadow-md rounded-lg border border-gray-300 p-4"
                  >
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      Family ID:{" "}
                      <span className="font-normal text-gray-600">
                        {payment.familyId}
                      </span>
                    </h2>
                    <p className="text-gray-700 mb-1">
                      <strong className="text-gray-800">Transaction ID:</strong>{" "}
                      {payment.transactionId}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <strong className="text-gray-800">Amount:</strong> $
                      {payment.amount}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <strong className="text-gray-800">Currency:</strong>{" "}
                      {payment.currency}
                    </p>
                    <p className="text-gray-700 mb-1">
                      <strong className="text-gray-800">Status:</strong>{" "}
                      <span
                        className={`px-2 py-1 rounded-md text-sm ${
                          payment.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      <strong className="text-gray-800">Date:</strong>{" "}
                      {new Date(payment.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PaymentsPage;
