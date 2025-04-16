"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const Search = () => {
  // State management
  const [searchParams, setSearchParams] = useState({
    query: "",
    field: "email",
    page: 1,
    limit: 10,
  });
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState({
    search: false,
    auth: false,
    default: false,
  });
  const [auth, setAuth] = useState({
    code: "",
    isAuthorized: false,
    error: "",
  });

  const router = useRouter();

  // Constants
  const SEARCH_FIELDS = [
    { value: "id", label: "ID" },
    { value: "userid", label: "User ID" },
    { value: "firstname", label: "First Name" },
    { value: "lastname", label: "Last Name" },
    { value: "email", label: "Email" },
    { value: "phonenumber", label: "Phone Number" },
  ];

  // Data fetching
  useEffect(() => {
    if (auth.isAuthorized) {
      fetchStudents();
    }
  }, [auth.isAuthorized, searchParams.page]);

  const fetchStudents = async (searchQuery = null) => {
    setLoading((prev) => ({ ...prev, default: true }));

    try {
      const url = searchQuery
        ? `/api/fetch-stds-info/search?query=${searchQuery}&field=${searchParams.field}`
        : `/api/fetch-stds-info/search/default?page=${searchParams.page}&limit=${searchParams.limit}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch students");

      setResults(data.students || []);
      if (data.pagination) {
        setPagination({
          currentPage: data.pagination.currentPage,
          totalPages: data.pagination.totalPages,
          totalItems: data.pagination.totalItems,
        });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading((prev) => ({ ...prev, default: false }));
    }
  };

  // Handlers
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchParams.query.trim()) return;

    setLoading((prev) => ({ ...prev, search: true }));
    await fetchStudents(searchParams.query);
    setLoading((prev) => ({ ...prev, search: false }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!auth.code) {
      setAuth((prev) => ({ ...prev, error: "Please enter a secret code" }));
      return;
    }

    setLoading((prev) => ({ ...prev, auth: true }));

    try {
      const res = await fetch("/api/secret-code/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretCode: auth.code }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Invalid secret code");

      setAuth((prev) => ({ ...prev, isAuthorized: true, error: "" }));
    } catch (error) {
      setAuth((prev) => ({ ...prev, error: error.message }));
    } finally {
      setLoading((prev) => ({ ...prev, auth: false }));
    }
  };

  const handleActionSelect = (action, student) => {
    if (action === "payment") {
      router.push(
        `/admin/student-payment?_id=${student._id}&userid=${student.userid}`
      );
    } else if (action === "invoice") {
      const invoiceLink = `https://sp.ilmulquran.com/student/invoice/${student.userid}/${student._id}`;
      navigator.clipboard
        .writeText(invoiceLink)
        .then(() => toast.success("Invoice link copied!"))
        .catch(() => toast.error("Failed to copy link"));
    }
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  // Render functions
  const renderAuthForm = () => (
    <DashboardLayout>
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">
          Admin Authorization
        </h2>

        <form onSubmit={handleAuthSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="secretCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Secret Code
            </label>
            <input
              type="password"
              id="secretCode"
              value={auth.code}
              onChange={(e) =>
                setAuth((prev) => ({ ...prev, code: e.target.value }))
              }
              className="w-full px-4 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter your secret code"
            />
          </div>

          {auth.error && <p className="text-red-600 text-sm">{auth.error}</p>}

          <button
            type="submit"
            disabled={loading.auth}
            className="w-full py-2 px-4 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300 transition-colors"
          >
            {loading.auth ? "Verifying..." : "Authorize"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/admin/settings/secret-code/forgot")}
              className="text-teal-600 hover:text-teal-800 text-sm"
            >
              Forgot your code?
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );

  const renderSearchResults = () => (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-teal-800 mb-6 text-center">
            Student Search
          </h2>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  value={searchParams.query}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      query: e.target.value,
                    }))
                  }
                  placeholder="Search students..."
                  className="w-full px-4 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <select
                value={searchParams.field}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    field: e.target.value,
                  }))
                }
                className="px-4 py-2 border rounded-md focus:ring-teal-500 focus:border-teal-500"
              >
                {SEARCH_FIELDS.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={loading.search}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:bg-teal-300 transition-colors"
              >
                {loading.search ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-teal-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-teal-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.length > 0 ? (
                  results.map((student) => (
                    <tr key={student._id} className="hover:bg-teal-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.userid}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.firstname} {student.lastname}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.phonenumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <select
                          onChange={(e) =>
                            handleActionSelect(e.target.value, student)
                          }
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select action
                          </option>
                          <option value="payment">Make Payment</option>
                          <option value="invoice">Copy Invoice Link</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {loading.default ? "Loading..." : "No students found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );

  return auth.isAuthorized ? renderSearchResults() : renderAuthForm();
};

export default Search;
