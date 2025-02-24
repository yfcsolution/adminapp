"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../../admin_dashboard_layout/layout";

export default function PayPalSuccessPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching payment details or stop loading after a short delay
    const fetchPaymentDetails = async () => {
      // Simulate a payment details fetch or simply stop loading
      setTimeout(() => {
        setLoading(false);
      }, 1000); // Simulating a delay
    };

    fetchPaymentDetails();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <span className="text-teal-500 text-lg font-semibold">
            Loading...
          </span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-teal-500">
          Thank You for Your Payment!
        </h2>

        <div className="mt-6 flex justify-center">
          <a
            href="/admin/dashboard"
            className="bg-teal-500 text-white py-2 px-6 rounded-full text-lg font-semibold hover:bg-teal-600 transition"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
