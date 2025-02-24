"use client"; // To indicate client-side code for Next.js

import { useState, useEffect } from "react";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import { useRouter } from "next/navigation"; // Import useRouter correctly

export default function Search() {
  const [query, setQuery] = useState("");
  const [field, setField] = useState("email"); // Default field is email
  const [results, setResults] = useState([]); // Ensure it’s initialized as an array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [secretCode, setSecretCode] = useState(""); // State for secret code
  const [isAuthorized, setIsAuthorized] = useState(false); // Authorization state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter(); // Place the router hook at the top

  // Fetch all students by default when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchAllStudents();
    }
  }, [isAuthorized, currentPage]);

  // Function to fetch all students
  const fetchAllStudents = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/fetch-stds-info/search/default?page=${currentPage}&limit=10`
      );
      const data = await res.json();

      if (res.ok) {
        setResults(data.students || []);
        setTotalPages(data.pagination.totalPages || 1);
      } else {
        setError(data.message || "No students found");
      }
    } catch (err) {
      setError("Error fetching student data");
    } finally {
      setLoading(false);
    }
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle the search query and trigger the backend API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/fetch-stds-info/search?query=${query}&field=${field}`
      );
      const data = await res.json();

      if (res.ok) {
        setResults(data.students || []); // Ensure it’s always an array
      } else {
        setError(data.message || "No students found");
      }
    } catch (err) {
      setError("Error searching the database");
    } finally {
      setLoading(false);
    }
  };

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

  // Render the content only when client-side is ready and authorized
  if (!isAuthorized) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">
            Enter Secret Code
          </h2>
          <form onSubmit={handleSecretCodeSubmit} className="text-center">
            <input
              type="password"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Please Enter Secret Code"
              className="px-4 py-2 border rounded-md border-gray-300 focus:ring-teal-500 focus:ring-2 focus:outline-none mb-4"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 mb-4"
            >
              Submit Code
            </button>
          </form>

          {error && <p className="text-red-600 text-center">{error}</p>}

          {/* Forgot Secret Code Button */}
          <div className="text-center mt-4">
            <button
              onClick={handleForgotCode}
              className="text-teal-600 hover:underline focus:outline-none"
            >
              Forgot Secret Code?
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Render the search form and results only if authorized
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">
          Search Students
        </h2>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter student ID, firstname, email, etc."
            className="px-4 py-2 border rounded-md border-gray-300 focus:ring-teal-500 focus:ring-2 focus:outline-none w-1/3"
          />
          <select
            id="field"
            value={field}
            onChange={(e) => setField(e.target.value)}
            className="px-4 py-2 border rounded-md border-gray-300 focus:ring-teal-500 focus:ring-2 focus:outline-none"
          >
            <option value="id">ID</option>
            <option value="userid">User ID</option>
            <option value="firstname">First Name</option>
            <option value="lastname">Last Name</option>
            <option value="email">Email</option>
            <option value="phonenumber">Phone Number</option>
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
            Search Results
          </h3>

          {/* Table to show results */}
          <table className="min-w-full bg-white border border-teal-600 rounded-md shadow-md">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">User ID</th>
                <th className="py-3 px-4 text-left">First Name</th>
                <th className="py-3 px-4 text-left">Last Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {/* Map over the search results */}
              {results.length > 0 ? (
                results.map((student) => (
                  <tr key={student.id} className="hover:bg-teal-50">
                    <td className="py-3 px-4">{student.id}</td>
                    <td className="py-3 px-4">{student.userid}</td>
                    <td className="py-3 px-4">{student.firstname}</td>
                    <td className="py-3 px-4">{student.lastname}</td>
                    <td className="py-3 px-4">{student.email}</td>
                    <td className="py-3 px-4">{student.phonenumber}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3 text-teal-600">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300"
            >
              Previous
            </button>
            <span className="mx-4 text-teal-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
