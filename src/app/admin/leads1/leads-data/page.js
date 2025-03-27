"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowRight, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";
import Link from "next/link";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import AddLeadForm from "@/components/AddLeadForm";

const LeadsData = () => {
  const [leadsData, setLeadsData] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [visibleFields, setVisibleFields] = useState({});
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedField, setSelectedField] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [visibleRemarks, setVisibleRemarks] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalLeads, setTotalLeads] = useState(0);
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [newLead, setNewLead] = useState({
    FULL_NAME: "",
    PHONE_NO: "",
    EMAIL: "",
    STATE: "",
    LEAD_IP: "",
    REMARKS: "",
    REQUEST_FORM: "",
  });
  const [sortField, setSortField] = useState("updatedAt"); // Default sort by createdAt

  const fetchLeadsData = async () => {
    try {
      const response = await axios.post(`/api/leads/data`, {
        page,
        pageSize,
        sortField, // Add this line
      });
      setLeadsData(response.data.data);
      setTotalLeads(response.data.total);
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
      [leadId]: !prev[leadId],
    }));
  };

  const handleAddLeadClick = () => {
    setShowAddLeadForm(true);
  };

  const handleAddLeadFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/leads/add", newLead);
      if (response.status === 200) {
        toast.success("Lead added successfully!");
        setShowAddLeadForm(false);
        setNewLead({
          FULL_NAME: "",
          PHONE_NO: "",
          EMAIL: "",
          STATE: "",
          LEAD_IP: "",
          REMARKS: "",
          REQUEST_FORM: "",
        });
        fetchLeadsData(); // Refresh the leads data
      }
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Failed to add lead.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLead((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchLeadsData();
  }, [page, pageSize, sortField]); // Add sortField here

  const totalPages = Math.ceil(totalLeads / pageSize);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const handleSyncClick = async (LEAD_ID) => {
    try {
      const response = await axios.post("/api/leads/manual-sync", { LEAD_ID });
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error occurred during sync:", error.message);
      toast.error("Error occurred during sync:", error.message);
    }
  };

  return (
    <>
      <DashboardLayout>
        <title>ilmulQuran Leads</title>

        <div className="p-6 bg-white rounded-lg max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-teal-800 mb-6 text-center">
            Leads
          </h2>

          <div className="flex items-center mb-6 bg-gray-100 p-2 rounded-lg shadow-sm">
            <label className="ml-4">
              <Link
                href="/admin/leads1/search-leads"
                className="bg-teal-600 text-white px-6 py-3 rounded-full hover:bg-teal-700 font-semibold text-lg transition-colors duration-300 ease-in-out cursor-pointer shadow-md hover:shadow-lg"
              >
                Search Leads
              </Link>
            </label>
            <button
              onClick={handleAddLeadClick}
              className="ml-4 bg-teal-600 text-white px-6 py-[10px] rounded-full hover:bg-teal-700 font-semibold text-lg transition-colors duration-300 ease-in-out cursor-pointer shadow-md hover:shadow-lg"
            >
              Add Lead
            </button>
            <div className="ml-4">
              <label className="mr-2 font-semibold">Sort By:</label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="border border-teal-500 rounded-lg p-2"
              >
                <option value="createdAt">Date Created</option>
                <option value="LEAD_ID">Lead ID</option>
                <option value="FULL_NAME">Name</option>
                <option value="STATE">State</option>
                <option value="COUNTRY">Country</option>
                <option value="REQUEST_FORM">Request Form</option>
              </select>
            </div>
          </div>

          {showAddLeadForm && (
            <AddLeadForm setShowAddLeadForm={setShowAddLeadForm} />
          )}

          {showPasswordModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white rounded-lg p-6 w-80">
                <h3 className="text-lg font-semibold text-center mb-4">
                  Enter code
                </h3>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full border border-teal-500 rounded-lg p-2 mb-4"
                  placeholder="Enter code"
                  autoComplete="off"
                />

                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handlePasswordSubmit}
                    className="bg-teal-600 text-white p-2 rounded-lg"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="bg-gray-300 text-gray-700 p-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:hidden">
            {Array.isArray(leadsData) ? (
              leadsData.map((lead, index) => (
                <div
                  key={index}
                  className="bg-white border border-teal-500 rounded-lg p-4 shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                >
                  <Link
                    href={`/admin/leads1/leads-data/profile/${lead.LEAD_ID}`}
                    className="text-lg font-bold text-teal-700 mb-2 hover:underline"
                  >
                    {lead.FULL_NAME}
                  </Link>
                  <p>
                    <strong>Lead ID:</strong> {lead.LEAD_ID}
                  </p>
                  <p>
                    <strong>Phone No:</strong>{" "}
                    {lead.VISIBLE
                      ? lead.PHONE_NO
                      : visibleFields[lead.LEAD_ID]?.PHONE_NO || "***********"}
                    {!lead.VISIBLE && (
                      <button
                        onClick={() =>
                          toggleVisibility(lead.LEAD_ID, "PHONE_NO")
                        }
                        className="ml-2"
                      >
                        {visibleFields[lead.LEAD_ID]?.PHONE_NO ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    )}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {lead.VISIBLE
                      ? lead.EMAIL
                      : visibleFields[lead.LEAD_ID]?.EMAIL || "***********"}
                    {!lead.VISIBLE && (
                      <button
                        onClick={() => toggleVisibility(lead.LEAD_ID, "EMAIL")}
                        className="ml-2"
                      >
                        {visibleFields[lead.LEAD_ID]?.EMAIL ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    )}
                  </p>
                  <p>
                    <strong>Remarks:</strong>
                    {lead.REMARKS ? (
                      visibleRemarks[lead.LEAD_ID] ? (
                        lead.REMARKS
                      ) : (
                        `${lead.REMARKS.slice(0, 30)}...`
                      )
                    ) : (
                      <span>No remarks available</span>
                    )}
                    <button
                      onClick={() => toggleRemarksVisibility(lead.LEAD_ID)}
                      className="ml-2"
                    >
                      {visibleRemarks[lead.LEAD_ID] ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>
                  </p>
                  <p>
                    <strong>Request From:</strong> {lead.REQUEST_FORM}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(lead.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    <strong>Time:</strong>{" "}
                    {new Date(lead.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </p>
                  <p>
                    <strong>Oracle Synced:</strong>{" "}
                    {lead.syncedToOracle ? (
                      "true"
                    ) : (
                      <button
                        onClick={() => handleSyncClick(lead.LEAD_ID)}
                        className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition duration-200"
                      >
                        <FaArrowRight className="h-5 w-5" />
                      </button>
                    )}
                  </p>
                </div>
              ))
            ) : (
              <p>No leads available.</p>
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border-collapse rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Lead ID
                  </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Full Name
                  </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Phone No
                  </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Email
                  </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    State
                  </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Lead IP
                  </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Remarks
                  </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Date & Time
                  </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Request Form
                  </th>
                  <th className="py-3 px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Oracle Synced
                  </th>
                </tr>
              </thead>
              <tbody>
                {leadsData.map((lead, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-100 transition-colors duration-200 border-b border-gray-300"
                  >
                    <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                      {lead.LEAD_ID}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                      <Link
                        href={`/admin/leads1/leads-data/profile/${lead.LEAD_ID}`}
                        className="text-teal-700 hover:underline"
                      >
                        {lead.FULL_NAME}
                      </Link>
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                      {lead.VISIBLE
                        ? lead.PHONE_NO
                        : visibleFields[lead.LEAD_ID]?.PHONE_NO ||
                          "***********"}
                      {!lead.VISIBLE && (
                        <button
                          onClick={() =>
                            toggleVisibility(lead.LEAD_ID, "PHONE_NO")
                          }
                          className="ml-2"
                        >
                          {visibleFields[lead.LEAD_ID]?.PHONE_NO ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                      {lead.VISIBLE
                        ? lead.EMAIL
                        : [lead.LEAD_ID]?.EMAIL || "***********"}

                      {!lead.VISIBLE && (
                        <button
                          onClick={() =>
                            toggleVisibility(lead.LEAD_ID, "EMAIL")
                          }
                          className="ml-2"
                        >
                          {visibleFields[lead.LEAD_ID]?.EMAIL ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                      {lead.STATE}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                      {lead.LEAD_IP}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                      {lead.REMARKS ? (
                        visibleRemarks[lead.LEAD_ID] ? (
                          lead.REMARKS
                        ) : (
                          `${lead.REMARKS.slice(0, 30)}...`
                        )
                      ) : (
                        <span>No remarks available</span>
                      )}
                      <button
                        onClick={() => toggleRemarksVisibility(lead.LEAD_ID)}
                        className="ml-2"
                      >
                        {visibleRemarks[lead.LEAD_ID] ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                      {new Date(lead.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </td>

                    <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                      {lead.REQUEST_FORM}
                    </td>
                    <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                      {lead.syncedToOracle ? (
                        "true"
                      ) : (
                        <button
                          onClick={() => handleSyncClick(lead.LEAD_ID)}
                          className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition duration-200"
                        >
                          <FaArrowRight className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-4 sm:space-y-0">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-center">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default LeadsData;
