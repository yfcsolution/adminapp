"use client";

import { useState } from "react";
import { FaLock } from "react-icons/fa"; // For the icon
import DashboardLayout from "../../../../admin_dashboard_layout/layout";
import axios from "axios";
import { useRouter } from "next/navigation"; // Correct import

export default function UpdateSecretCodePage() {
  const [currentSecretCode, setCurrentSecretCode] = useState("");
  const [newSecretCode, setNewSecretCode] = useState("");
  const [confirmSecretCode, setConfirmSecretCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter(); // Using useRouter from next/navigation

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that the new secret code and confirm code match
    if (newSecretCode !== confirmSecretCode) {
      setError("New secret code and confirmation do not match.");
      return;
    }

    // Reset error message before submitting
    setError("");
    setSuccess("");

    try {
      // Sending the request to the backend API
      const response = await axios.post("/api/secret-code/update", {
        currentSecretCode,
        newSecretCode,
      });

      if (response.status === 200) {
        setSuccess("Secret code updated successfully!");
        setCurrentSecretCode("");
        setNewSecretCode("");
        setConfirmSecretCode("");
        // Redirect to a success page or back to settings
        setTimeout(() => {
          router.push("/admin/settings"); // Adjust URL as needed
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-center items-center min-h-screen bg-teal-50">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-teal-800 mb-4 text-center">
            <FaLock className="inline-block mr-2" />
            Update Secret Code
          </h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-4 mb-4 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-600 p-4 mb-4 rounded-lg">
              <strong>Success:</strong> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="currentSecretCode"
                className="block text-sm font-medium text-teal-800 mb-2"
              >
                Current Secret Code
              </label>
              <input
                type="password"
                id="currentSecretCode"
                value={currentSecretCode}
                onChange={(e) => setCurrentSecretCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="Enter current secret code"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="newSecretCode"
                className="block text-sm font-medium text-teal-800 mb-2"
              >
                New Secret Code
              </label>
              <input
                type="password"
                id="newSecretCode"
                value={newSecretCode}
                onChange={(e) => setNewSecretCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="Enter new secret code"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="confirmSecretCode"
                className="block text-sm font-medium text-teal-800 mb-2"
              >
                Confirm New Secret Code
              </label>
              <input
                type="password"
                id="confirmSecretCode"
                value={confirmSecretCode}
                onChange={(e) => setConfirmSecretCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-md text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="Confirm new secret code"
                required
              />
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="px-6 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                Update Secret Code
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
