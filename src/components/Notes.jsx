"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const Notes = ({ leadId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [leadsStatus, setLeadsStatus] = useState([]);
  const [formData, setFormData] = useState({
    description: "",
    dateContacted: "",
    addedFrom: "",
    leadStatus: "",
  });

  const [roleId, setRoleId] = useState(null);

  // Fetch notes
  const fetchNotes = async () => {
    if (!leadId) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/notes/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ P_REL_ID: leadId, P_REL_TYPE: "Lead" }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Notes");
      }

      const result = await response.json();
      if (result && result.data && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        console.error("Unexpected response structure:", result);
        setData([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [leadId]);

  useEffect(() => {
    const getAdminData = async () => {
      const response = await axios.get("/api/admin-info", {
        withCredentials: true,
      });
      setRoleId(response.data.data.role_id);
    };
    getAdminData();
  }, []);

  useEffect(() => {
    const fetchLeadsStatus = async () => {
      try {
        const response = await axios.get("/api/leads/status/get");
        setLeadsStatus(response.data.data);
      } catch (error) {
        console.error("Error fetching leads status:", error);
      }
    };
    fetchLeadsStatus();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Add the note
      const noteResponse = await fetch("/api/notes/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          P_REL_ID: leadId,
          P_REL_TYPE: "Lead",
          P_DESCRIPTION: formData.description,
          P_DATE_CONTACTED: formData.dateContacted,
          P_ADDEDFROM: roleId,
        }),
      });

      if (!noteResponse.ok) {
        throw new Error("Failed to add Note");
      }

      toast.success("Note added successfully");
      fetchNotes();

      // Update lead status if selected
      if (formData.leadStatus) {
        const statusResponse = await fetch("/api/leads/update-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId: leadId,
            statusId: formData.leadStatus,
          }),
        });

        if (!statusResponse.ok) {
          throw new Error("Failed to update lead status");
        }
      }

      // Reset form
      setFormData({
        description: "",
        dateContacted: "",
        addedFrom: "",
        leadStatus: "",
      });
      setShowForm(false);
    } catch (err) {
      console.error("Error adding note or updating status:", err);
      toast.error("Failed to add note or update status: " + err.message);
    }
  };

  return (
    <div className="p-6  bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-teal-700">Notes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
        >
          {showForm ? "Cancel" : "Add Note"}
        </button>
      </div>

      {/* Add Note Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 p-4 border rounded-md bg-gray-50"
        >
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Date Contacted
            </label>
            <input
              type="date"
              name="dateContacted"
              value={formData.dateContacted}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Lead Status
            </label>
            <select
              name="leadStatus"
              value={formData.leadStatus}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-lg p-2 w-full"
            >
              <option value="">Select a status</option>
              {leadsStatus?.map((status, i) => (
                <option key={i} value={status.ID}>
                  {status.NAME}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
          >
            Submit Note
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading notes...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : data.length > 0 ? (
        <>
          {/* Table for larger screens */}
          <div className="hidden md:block overflow-x-auto">
            <p className="text-sm text-gray-500 mt-4">Lead ID: {leadId}</p>
            <table className="w-full border border-teal-300 rounded-md">
              <thead>
                <tr className="bg-teal-600 text-white">
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Date Contacted</th>
                  <th className="px-4 py-2">Added From</th>
                  <th className="px-4 py-2">Date Added</th>
                  <th className="px-4 py-2">SYNCED</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-teal-50" : "bg-white"}
                  >
                    <td className="px-4 py-2 border">{item.P_DESCRIPTION}</td>
                    <td className="px-4 py-2 border">
                      {formatDate(item.P_DATE_CONTACTED)}
                    </td>
                    <td className="px-4 py-2 border">{item.P_ADDEDFROM}</td>
                    <td className="px-4 py-2 border">
                      {formatDate(item.P_DATEADDED)}
                    </td>
                    <td className="px-4 py-2 border">
                      {item.SYNCED ? "✔️" : "❌"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards for mobile screens */}
          <div className="md:hidden space-y-4">
            {data.map((item, index) => (
              <div
                key={index}
                className="p-4 border"
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium text-teal-700">
                    Description:{" "}
                    <span className="font-normal">{item.P_DESCRIPTION}</span>
                  </p>
                  <p className="text-sm font-medium text-teal-700">
                    Date Contacted:{" "}
                    <span className="font-normal">
                      {formatDate(item.P_DATE_CONTACTED)}
                    </span>
                  </p>
                  <p className="text-sm font-medium text-teal-700">
                    Added From:{" "}
                    <span className="font-normal">{item.P_ADDEDFROM}</span>
                  </p>
                  <p className="text-sm font-medium text-teal-700">
                    Date Added:{" "}
                    <span className="font-normal">
                      {formatDate(item.P_DATEADDED)}
                    </span>
                  </p>
                  <p className="text-sm font-medium text-teal-700">
                    SYNCED:{" "}
                    <span className="font-normal">
                      {item.SYNCED ? "✔️" : "❌"}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">No notes available.</p>
      )}
    </div>
  );
};

export default Notes;