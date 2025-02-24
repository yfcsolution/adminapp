"use client";
import { useState } from "react";
import axios from "axios";
import DashboardLayout from "../../../../admin_dashboard_layout/layout";

const SecretCodeUpdate = () => {
  const [adminPassword, setAdminPassword] = useState("");
  const [newCode, setNewCode] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSecretCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axios.post("/api/secret-code/forgot", {
        adminPassword,
        newCode,
      });

      if (response.status === 200) {
        setSuccessMessage(response.data.message);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center px-6 py-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-medium text-teal-600 text-center mb-6">
            Update Secret Code
          </h2>

          <form onSubmit={handleSecretCodeSubmit}>
            <div className="mb-6">
              <label
                htmlFor="adminPassword"
                className="block text-md text-teal-600 mb-2"
              >
                Admin Password
              </label>
              <input
                id="adminPassword"
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter Admin Password"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="newCode"
                className="block text-md text-teal-600 mb-2"
              >
                New Secret Code
              </label>
              <input
                id="newCode"
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Enter New Secret Code"
                required
              />
            </div>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {successMessage && (
              <p className="text-green-500 text-center mb-4">
                {successMessage}
              </p>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                className="px-6 py-3 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition duration-300 disabled:bg-teal-300"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Secret Code"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecretCodeUpdate;
