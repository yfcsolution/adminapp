"use client"; // To indicate client-side code for Next.js

import { useState, useEffect } from "react";
import DashboardLayout from "../../../../admin_dashboard_layout/layout";

export default function SetSecretCode() {
  const [secretCode, setSecretCode] = useState(""); // State for secret code
  const [error, setError] = useState(""); // Error state
  const [codeExists, setCodeExists] = useState(false); // State to check if the code exists

  // Handle setting a new secret code
  const handleSetCodeSubmit = async (e) => {
    e.preventDefault();
    if (!secretCode) {
      setError("Please enter a new secret code.");
      return;
    }

    try {
      const res = await fetch("/api/secret-code/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretCode }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Secret code set successfully.");
      } else {
        setError(data.error || "Error setting secret code.");
      }
    } catch (error) {
      setError("Error setting secret code.");
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">
          Set Secret Code
        </h2>

        {/* Secret Code Input */}
        <div className="text-center mb-6">
          <p className="text-red-600">{error}</p>

          {/* If a secret code already exists, prevent setting a new one */}

          <form onSubmit={handleSetCodeSubmit}>
            <input
              type="text"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Enter New Secret Code"
              className="px-4 py-2 border rounded-md border-gray-300 focus:ring-teal-500 focus:ring-2 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Set Secret Code
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
