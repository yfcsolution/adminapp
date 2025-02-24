"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaTimes,
  FaSearch,
  FaFileExport,
  FaFileImport,
  FaArrowRight,
  FaTrashAlt,
  FaPen,
  FaEllipsisH,
  FaEye,
  FaEyeSlash,
  FaBell,
} from "react-icons/fa";
import Link from "next/link";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import Papa from "papaparse";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { syncDataToOracle } from "@/components/SyncToOracle";

const LeadsData = () => {
  const [leadsData, setLeadsData] = useState([]);
  const [dialogData, setDialogData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [visibleFields, setVisibleFields] = useState({});
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedField, setSelectedField] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const router = useRouter();
  const [visibleRemarks, setVisibleRemarks] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalLeads, setTotalLeads] = useState(0);

  const fetchLeadsData = async () => {
    try {
      const response = await axios.get(
        `/api/leads/data?page=${page}&pageSize=${pageSize}`
      );

      setLeadsData(response.data.data.data);
      setTotalLeads(response.data.data.total);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch leads data.");
    }
  };

  const fetchContacts = async (leadId, field, password) => {
    try {
      const response = await axios.post("/api/leads/contact", {
        LEAD_ID: leadId,
        [field]: true,
        CONTACT_SECRETE: password,
      });
      const data = response.data.data;
      setVisibleFields((prev) => ({
        ...prev,
        [leadId]: {
          ...prev[leadId],
          [field]: data[field] || "N/A",
        },
      }));
    } catch (error) {
      console.error(`Error fetching ${field}`, error);
      toast.error(`Failed to fetch ${field}.`);
    }
  };

  const openPasswordModal = (leadId, field) => {
    setSelectedLeadId(leadId);
    setSelectedField(field);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    fetchContacts(selectedLeadId, selectedField, passwordInput);
    setShowPasswordModal(false);
    setPasswordInput("");
  };

  const toggleVisibility = (leadId, field) => {
    if (!visibleFields[leadId]?.[field]) {
      openPasswordModal(leadId, field);
    } else {
      setVisibleFields((prev) => ({
        ...prev,
        [leadId]: {
          ...prev[leadId],
          [field]: !prev[leadId][field],
        },
      }));
    }
  };

  const toggleRemarksVisibility = (leadId) => {
    setVisibleRemarks((prev) => ({
      ...prev,
      [leadId]: !prev[leadId], // Toggle visibility for the specific lead
    }));
  };

  useEffect(() => {
    fetchLeadsData();
  }, [page, pageSize]); // Ensure the data refreshes when the page or pageSize changes

  // Calculate total pages
  const totalPages = Math.ceil(totalLeads / pageSize);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage); // This will trigger the useEffect to re-fetch data
  };

  const handleOpenDialog = (lead) => {
    setDialogData(lead);
    setIsModalOpen(true);
  };

  const handleCloseDialog = () => {
    setIsModalOpen(false);
    setDialogData(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const highlightText = (text, keyword) => {
    if (!keyword) return text;
    const escapedKeyword = escapeRegExp(keyword);
    const textStr = String(text);
    const parts = textStr.split(new RegExp(`(${escapedKeyword})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === keyword.toLowerCase() ? (
            <span key={index} className="bg-yellow-200">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const filteredLeads = Array.isArray(leadsData)
    ? leadsData.filter((lead) =>
        Object.values(lead).some((value) =>
          String(value).toLowerCase().includes(searchTerm)
        )
      )
    : [];

  // handle sync data to oracle
  const handleSyncClick = async (LEAD_ID) => {
    try {
      // Make the POST request with LEAD_ID in the request body
      const response = await axios.post("/api/leads/manual-sync", { LEAD_ID });
      toast.success(response.data.message);
    } catch (error) {
      // Handle any errors
      console.error("Error occurred during sync:", error.message);
      toast.error("Error occurred during sync:", error.message);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "LEAD_ID",
      "FULL_NAME",
      "PHONE_NO",
      "EMAIL",
      "STATE",
      "LEAD_IP",
      "REMARKS",
    ];
    const rows = leadsData.map((lead) => [
      lead.LEAD_ID,
      lead.FULL_NAME,
      lead.PHONE_NO,
      lead.EMAIL,
      lead.STATE,
      lead.LEAD_IP,
      lead.REMARKS,
    ]);

    const csvContent = Papa.unparse([headers, ...rows]);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "leads_data.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const importedLeads = results.data.map((lead) => ({
            ...lead,
          }));
          setLeadsData((prevLeads) => [...prevLeads, ...importedLeads]);
        },
      });
    }
  };

  const deleteLead = async (id) => {
    try {
      const response = await axios.post("/api/leads/delete", { id });
      if (response.status === 200) {
        toast.success(response.data.message);
        setLeadsData((prevLeads) =>
          prevLeads.filter((lead) => lead._id !== id)
        );
      }
    } catch (error) {
      toast.error("Failed to delete lead");
      console.error(error);
    }
  };
  const handleAllMessages = async (id) => {
    router.push(`/admin/leads1/duplicate?id=${id}`);
  };

  const handleUpdateLead = (lead) => {
    router.push(`/admin/leads1/update?id=${lead._id}`);
  };

  return (
    <>
      <DashboardLayout>
        <div className="flex-1 overflow-hidden">
          <div className="max-h-screen overflow-y-auto px-4 py-3">
            <div className="bg-white rounded-lg shadow-sm max-w-[1400px] mx-auto">
              <div className="p-4">
                <h2 className="text-2xl font-semibold text-teal-800 mb-4">
                  Leads
                </h2>

                {/* Search and Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 py-2">
                    <FaSearch className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full bg-transparent outline-none text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center px-4 py-2 text-sm bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100"
                    >
                      <FaFileExport className="mr-2" />
                      Export
                    </button>
                    <Link
                      href="/admin/leads1/search-leads"
                      className="flex items-center px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                    >
                      Search Leads
                    </Link>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="grid gap-3 md:hidden">
                  {leadsData?.map((lead, index) => (
                    <div
                      key={index}
                      className="bg-white border rounded-lg p-3 text-sm"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-teal-800">
                          {lead.FULL_NAME}
                        </h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          ID: {lead.LEAD_ID}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Phone:</span>
                          <div className="flex items-center">
                            {visibleFields[lead.LEAD_ID]?.PHONE_NO ||
                              "***********"}
                            <button
                              onClick={() =>
                                toggleVisibility(lead.LEAD_ID, "PHONE_NO")
                              }
                              className="ml-2"
                            >
                              {visibleFields[lead.LEAD_ID]?.PHONE_NO ? (
                                <FaEyeSlash className="w-4 h-4" />
                              ) : (
                                <FaEye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Status:</span>
                          {lead.syncedToOracle ? (
                            <span className="text-green-600">Synced</span>
                          ) : (
                            <button
                              onClick={() => handleSyncClick(lead.LEAD_ID)}
                              className="text-teal-600"
                            >
                              <FaArrowRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          {lead.New_Messages > 0 && (
                            <button
                              onClick={() => handleAllMessages(lead.LEAD_ID)}
                              className="p-2 text-teal-600"
                            >
                              <FaBell className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateLead(lead)}
                            className="p-2 text-teal-600"
                          >
                            <FaPen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDialog(lead)}
                            className="p-2 text-teal-600"
                          >
                            <FaEllipsisH className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {[
                          "ID",
                          "Name",
                          "Phone",
                          "Email",
                          "State",
                          "Status",
                          "Actions",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-3 py-2 text-left font-medium text-gray-600"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredLeads.map((lead, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{lead.LEAD_ID}</td>
                          <td className="px-3 py-2">
                            <Link
                              href={`/admin/leads1/leads-data/profile/${lead.LEAD_ID}`}
                              className="text-teal-500 hover:underline"
                            >
                              {lead.FULL_NAME}
                            </Link>
                          </td>{" "}
                          <td className="px-3 py-2">
                            <div className="flex items-center">
                              {visibleFields[lead.LEAD_ID]?.PHONE_NO ||
                                "***********"}
                              <button
                                onClick={() =>
                                  toggleVisibility(lead.LEAD_ID, "PHONE_NO")
                                }
                                className="ml-2"
                              >
                                {visibleFields[lead.LEAD_ID]?.PHONE_NO ? (
                                  <FaEyeSlash className="w-4 h-4" />
                                ) : (
                                  <FaEye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center">
                              {visibleFields[lead.LEAD_ID]?.EMAIL ||
                                "***********"}
                              <button
                                onClick={() =>
                                  toggleVisibility(lead.LEAD_ID, "EMAIL")
                                }
                                className="ml-2"
                              >
                                {visibleFields[lead.LEAD_ID]?.EMAIL ? (
                                  <FaEyeSlash className="w-4 h-4" />
                                ) : (
                                  <FaEye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2">{lead.STATE}</td>
                          <td className="px-3 py-2">
                            {lead.syncedToOracle ? (
                              <span className="text-green-600">Synced</span>
                            ) : (
                              <button
                                onClick={() => handleSyncClick(lead.LEAD_ID)}
                                className="text-teal-600"
                              >
                                <FaArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              {lead.New_Messages > 0 && (
                                <button
                                  onClick={() =>
                                    handleAllMessages(lead.LEAD_ID)
                                  }
                                  className="text-teal-600"
                                >
                                  <FaBell className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateLead(lead)}
                                className="text-teal-600"
                              >
                                <FaPen className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDialog(lead)}
                                className="text-teal-600"
                              >
                                <FaEllipsisH className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-4 px-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1 text-sm bg-gray-100 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isModalOpen && dialogData && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-sm">
              <div className="bg-white w-11/12 md:w-1/2 lg:w-1/3 p-8 rounded-xl shadow-xl transition-transform transform scale-100 hover:scale-105 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-teal-800">
                    Lead Information
                  </h2>
                  <button
                    onClick={handleCloseDialog}
                    className="text-gray-500 hover:text-teal-600 transition duration-300"
                  >
                    <FaTimes className="text-2xl" />
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Time Zone and Currency (outside of the student array) */}
                  <p className="text-sm text-gray-700">
                    <strong>Time Zone:</strong> {dialogData.TIME_ZONE}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Currency:</strong> {dialogData.CURRENCY}
                  </p>

                  {/* WhatsApp Status */}
                  <p className="text-sm text-gray-700">
                    <strong>WhatsApp Status:</strong>{" "}
                    {dialogData.WHATSAPP_STATUS}
                  </p>
                  {dialogData.STUDENTS?.slice()
                    .reverse()
                    .map((student, index) => (
                      <div
                        key={index}
                        className="space-y-2 border-b border-gray-300 pb-4"
                      >
                        <p className="text-sm text-gray-700">
                          <strong>Student Name:</strong> {student.STUDENT_NAME}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Age:</strong> {student.STUDENT_AGE}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Gender:</strong> {student.STUDENT_GENDER}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Preferred Courses:</strong>
                          {Array.isArray(student.PREFERRED_COURSES) &&
                          student.PREFERRED_COURSES.length > 0
                            ? student.PREFERRED_COURSES.map((course, idx) => (
                                <span key={idx}>
                                  {course}
                                  {idx < student.PREFERRED_COURSES.length - 1
                                    ? ", "
                                    : ""}
                                </span>
                              ))
                            : "N/A"}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Class Timing:</strong> {student.CLASS_TIMING}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Contact Method:</strong>{" "}
                          {student.CONTACT_METHOD}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Contact Time:</strong>{" "}
                          {new Date(student.CONTACT_TIME).toLocaleString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                              hour12: true,
                            }
                          )}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Special Requirements:</strong>{" "}
                          {student.SPECIAL_REQUIREMENTS}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Synced:</strong>{" "}
                          {student.SYNCED ? "TRUE" : "FALSE"}
                        </p>
                      </div>
                    ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleCloseDialog}
                    className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default LeadsData;
