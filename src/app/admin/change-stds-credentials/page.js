"use client";

import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardLayout from "../../admin_dashboard_layout/layout";

const Page = () => {
  const [loading, setLoading] = useState(false);
  // Function to handle the password change request
  const handleChangePasswords = async () => {
    setLoading(true); // Show loading state

    try {
      const response = await axios.post("/api/change-all-stds-password");
      toast.success(response.data.message); // Show success message if request is successful
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating passwords"); // Show error message if request fails
    } finally {
      setLoading(false); // Hide loading state
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
        <div className="bg-white shadow-xl rounded-lg w-full max-w-lg p-8">
          <div className="flex justify-center mb-6">
            <button
              onClick={handleChangePasswords}
              className={`px-5 py-2 text-sm font-semibold text-white rounded-lg transition duration-300 focus:outline-none ${
                loading
                  ? "bg-teal-500 cursor-not-allowed"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
              disabled={loading}
            >
              {loading ? "Changing..." : "Change All Students' Passwords"}
            </button>
          </div>
        </div>

        {/* Toast notification container */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </DashboardLayout>
  );
};

export default Page;
