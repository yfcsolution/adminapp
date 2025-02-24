"use client"; // To indicate client-side code for Next.js

import { useState, useEffect } from "react";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Search() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [field, setField] = useState("EMAIL");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allLeads, setAllLeads] = useState([]);
  const [secretCode, setSecretCode] = useState(""); // State for secret code
  const [isAuthorized, setIsAuthorized] = useState(false); // Authorization state
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await axios.get(
          `/api/leads/search/default?page=${page}&limit=10`
        );

        if (response.status === 200) {
          setAllLeads(response.data.leads || []);
          setTotalPages(response.data.totalPages);
        } else {
          setError("Failed to fetch leads data.");
        }
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Error fetching leads.");
      }
    }
    fetchLeads();
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return; // Prevent out-of-bound pages
    setPage(newPage);
  };
  // Fetch all leads initially to display the default data
  useEffect(() => {
    async function fetchLeads() {
      try {
        const response = await axios.get(`/api/leads/search/default`);

        console.log("default leads fetched:", response);

        if (response.status === 200) {
          setAllLeads(response.data.leads || []);
        } else {
          setError("Failed to fetch leads data.");
        }
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Error fetching leads.");
      }
    }
    fetchLeads();
  }, []);
  const handleForgotCode = () => {
    router.push("/admin/settings/secret-code/forgot"); // Correctly use the router here
  };
  // Handle the secret code validation
  const handleSecretCodeSubmit = async (e) => {
    e.preventDefault();
    if (!secretCode) {
      setError("Please enter a secret code.");
      return;
    }

    try {
      const res = await fetch("/api/secret-code/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretCode }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsAuthorized(true); // Unlock the data
      } else {
        setError(data.error || "Invalid secret code");
      }
    } catch (error) {
      setError("Error validating secret code.");
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">
          Search Leads
        </h2>

        {/* Secret Code Input */}
        {!isAuthorized ? (
          <div className="text-center mb-6">
            <form onSubmit={handleSecretCodeSubmit}>
              <input
                type="password"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="Please Enter Secret Code"
                className="px-4 py-2 border rounded-md border-gray-300 focus:ring-teal-500 focus:ring-2 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Submit Code
              </button>
            </form>
            {error && <p className="text-red-600">{error}</p>}
            <div className="text-center mt-4">
              <button
                onClick={handleForgotCode}
                className="text-teal-600 hover:underline focus:outline-none"
              >
                Forgot Secret Code?
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* The rest of your search form and results display */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!query.trim()) return;

                setLoading(true);
                setError("");
                try {
                  const res = await fetch(
                    `/api/leads/search?query=${query}&field=${field}`
                  );
                  const data = await res.json();

                  if (res.ok) {
                    setResults(data.leads || []); // Ensure it’s always an array
                  } else {
                    setError(data.message || "No leads found");
                  }
                } catch (err) {
                  setError("Error searching the database");
                } finally {
                  setLoading(false);
                }
              }}
              className="flex items-center justify-center gap-4 mb-6"
            >
              <input
                type="text"
                id="query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter lead ID, email, or phone number"
                className="px-4 py-2 border rounded-md border-gray-300 focus:ring-teal-500 focus:ring-2 focus:outline-none w-1/3"
              />
              <select
                id="field"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="px-4 py-2 border rounded-md border-gray-300 focus:ring-teal-500 focus:ring-2 focus:outline-none"
              >
                <option value="LEAD_ID">LEAD_ID</option>
                <option value="EMAIL">EMAIL</option>
                <option value="PHONE_NO">PHONE_NO</option>
                <option value="FULL_NAME">Full Name</option>
                <option value="COUNTRY">Country</option>
                <option value="STATE">State</option>
                <option value="LEAD_IP">Lead IP</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>

            {error && <p className="text-red-600 text-center">{error}</p>}

            <div className="mt-6">
              <h3 className="text-xl font-semibold text-teal-800 mb-4">
                Leads Results
              </h3>

              {/* Table to show results */}
              <table className="min-w-full bg-white border border-teal-600 rounded-md shadow-md">
                <thead>
                  <tr className="bg-teal-600 text-white">
                    <th className="py-3 px-4 text-left">Lead ID</th>
                    <th className="py-3 px-4 text-left">Full Name</th>
                    <th className="py-3 px-4 text-left">Phone No</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">State</th>
                    <th className="py-3 px-4 text-left">Ip</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Ensure results or allLeads are arrays and map works correctly */}
                  {(results.length > 0 ? results : allLeads).map((lead) => (
                    <tr key={lead.LEAD_ID} className="hover:bg-teal-50">
                      <td className="py-3 px-4">{lead.LEAD_ID}</td>
                      <td className="py-3 px-4">{lead.FULL_NAME}</td>
                      <td className="py-3 px-4">{lead.PHONE_NO}</td>
                      <td className="py-3 px-4">{lead.EMAIL}</td>
                      <td className="py-3 px-4">{lead.STATE}</td>
                      <td className="py-3 px-4">{lead.LEAD_IP}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* If no results */}
              {results.length === 0 && allLeads.length === 0 && (
                <p className="text-center text-teal-600">No leads available.</p>
              )}
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md disabled:bg-teal-300"
                >
                  Prev
                </button>
                <span className="self-center text-teal-600">{`Page ${page} of ${totalPages}`}</span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md disabled:bg-teal-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
