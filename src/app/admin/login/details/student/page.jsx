"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../../admin_dashboard_layout/layout";
import axios from "axios";
import { toast } from "react-toastify"; // Ensure toast is imported

const StudentLoginAttempts = () => {
  const [activeTab, setActiveTab] = useState("staff");
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);

  // Fetch student login attempts with server-side pagination
  const fetchAttempts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/student/login_attempts", {
        params: { page: currentPage, limit: itemsPerPage },
      });
      console.log("the response im geting is ", response);
      // Expected response: { data, total, page, totalPages }
      setAttempts(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Failed to fetch login attempts. Try again.");
      console.error("Error fetching login attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [currentPage]);

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <h2 className="px-4 py-2 rounded-lg font-semibold text-teal-600 bg-teal-100">
            Students Login Attempts
          </h2>
        </div>

        {/* Main Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-teal-700 text-center">Loading login attempts...</p>
          ) : attempts.length > 0 ? (
            <>
              {/* Table view for large screens */}
              <div className="hidden lg:block">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden border border-teal-300">
                  <thead className="bg-teal-600 text-white">
                    <tr>
                      <th className="px-4 py-2">FId</th>
                      <th className="px-4 py-2">RName</th>
                      <th className="px-4 py-2">REmail</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">IP Address</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Reason</th>
                      <th className="px-4 py-2">Login Time</th>
                      <th className="px-4 py-2">User Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt) => {
                      const rEmail = attempt.studentId?.email || "-";
                      const email = attempt.email;
                      return (
                        <tr key={attempt._id} className="border-b hover:bg-teal-50">
                          <td className="px-4 py-2">
                            {attempt.studentId ? `${attempt.studentId.userid}` : "-"}
                          </td>
                          <td className="px-4 py-2">
                            {attempt.studentId
                              ? `${attempt.studentId.firstname} ${attempt.studentId.lastname}`
                              : "-"}
                          </td>
                          <td className="px-4 py-2">{rEmail}</td>
                          <td className="px-4 py-2">
                            {rEmail === email ? "---" : email}
                          </td>
                          <td className="px-4 py-2">{attempt.ipAddress}</td>
                          <td className="px-4 py-2 capitalize">{attempt.status}</td>
                          <td className="px-4 py-2">{attempt.reason || "-"}</td>
                          <td className="px-4 py-2">
                            {new Date(attempt.loginTime).toLocaleString()}
                          </td>
                          <td
                            className="px-4 py-2 max-w-xs truncate"
                            title={attempt.userAgent}
                          >
                            {attempt.userAgent}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Card view for mobile/tablet */}
              <div className="block lg:hidden space-y-4">
                {attempts.map((attempt) => {
                  const rEmail = attempt.studentId?.email || "-";
                  const email = attempt.email;
                  return (
                    <div
                      key={attempt._id}
                      className="bg-white shadow-md rounded-lg p-4 border border-teal-300"
                    >
                      <div className="mb-2">
                        <span className="font-semibold">FId: </span>
                        {attempt.studentId ? `${attempt.studentId.userid}` : "-"}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">RName: </span>
                        {attempt.studentId
                          ? `${attempt.studentId.firstname} ${attempt.studentId.lastname}`
                          : "-"}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">REmail: </span>
                        {rEmail}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Email: </span>
                        {rEmail === email ? "---" : email}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">IP Address: </span>
                        {attempt.ipAddress}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Status: </span>
                        <span className="capitalize">{attempt.status}</span>
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Reason: </span>
                        {attempt.reason || "-"}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">Login Time: </span>
                        {new Date(attempt.loginTime).toLocaleString()}
                      </div>
                      <div className="mb-2">
                        <span className="font-semibold">User Agent: </span>
                        <span className="max-w-xs truncate" title={attempt.userAgent}>
                          {attempt.userAgent}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-teal-600 text-teal-600 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === i + 1
                          ? "bg-teal-600 text-white"
                          : "bg-white text-teal-600"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-teal-600 text-teal-600 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-600">No login attempts found.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentLoginAttempts;
