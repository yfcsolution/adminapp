"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function Search() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [field, setField] = useState("EMAIL");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allLeads, setAllLeads] = useState([]);
  const [secretCode, setSecretCode] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userId, setUserId] = useState(null); // Track user ID from backend

  // Check for user-specific authorization
  const isAuthorized =
    typeof window !== "undefined" && userId
      ? sessionStorage.getItem(`leadsAccessAuthorized_${userId}`) === "true"
      : false;

  useEffect(() => {
    // Get user ID from session if available
    const storedUserId = sessionStorage.getItem("currentUserId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

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
      }
    }

    if (isAuthorized) {
      fetchLeads();
    }
  }, [page, isAuthorized]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleForgotCode = () => {
    router.push("/admin/settings/secret-code/forgot");
  };

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
        // Store both the authorization and user ID
        sessionStorage.setItem("currentUserId", data.userId);
        sessionStorage.setItem(`leadsAccessAuthorized_${data.userId}`, "true");
        setUserId(data.userId);
        window.location.reload(); // Refresh to apply changes
      } else {
        setError(data.error || "Invalid secret code");
      }
    } catch (error) {
      setError("Error validating secret code.");
    }
  };

  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <button
            onClick={() => router.back()}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">
            Search Leads
          </h2>
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
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">
          Search Leads
        </h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!query.trim()) return;

            setLoading(true);
            setError("");
            try {
              const res = await axios.post(`/api/leads/search`, {
                query: query,
                field: field,
              });

              if (res.data.data.length > 0) {
                setResults(res.data.data || []);
              } else {
                setError("No leads found");
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
              {(results.length > 0 ? results : allLeads).map((lead) => (
                <tr key={lead.LEAD_ID} className="hover:bg-teal-50">
                  <td className="py-3 px-4">{lead.LEAD_ID}</td>
                  <td className="py-3 px-4">
                    <Link
                      href={`/admin/leads1/search-leads/profile/${lead.LEAD_ID}`}
                      className="text-teal-700 hover:underline"
                    >
                      {lead.FULL_NAME}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{lead.PHONE_NO}</td>
                  <td className="py-3 px-4">{lead.EMAIL}</td>
                  <td className="py-3 px-4">{lead.STATE}</td>
                  <td className="py-3 px-4">{lead.LEAD_IP}</td>
                </tr>
              ))}
            </tbody>
          </table>

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
    </DashboardLayout>
  );
}
