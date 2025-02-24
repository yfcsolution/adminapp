"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
const Notices = ({ leadId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    dateContacted: "",
    addedFrom: "",
  });

  useEffect(() => {
    const fetchNotices = async () => {
      if (!leadId) return; // Ensure leadId exists before making the request

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/notices/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ P_REL_ID: leadId, P_REL_TYPE: "Lead" }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notices");
        }

        const result = await response.json();
        console.log("Response JSON:", result); // Debugging response structure

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

    fetchNotices();
  }, [leadId]);

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase(); // Converts "19 Feb 2025" to "19 FEB 2025"
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/notices/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          P_REL_ID: leadId,
          P_REL_TYPE: "Lead",
          P_DESCRIPTION: formData.description,
          P_DATE_CONTACTED: formData.dateContacted,
          P_ADDEDFROM: formData.addedFrom,
        }),
      });
      toast.success("Notice added sucessfully");
      setShowForm(false);
      if (!response.ok) {
        throw new Error("Failed to add notice");
      }

      // Refresh data after successful submission
      const newNotice = await response.json();
      setData([...data, newNotice]);
      setShowForm(false);
      setFormData({ description: "", dateContacted: "", addedFrom: "" }); // Reset form
    } catch (err) {
      console.error("Error adding notice:", err);
    }
  };

  return (
    <div className="p-6 border border-teal-300 rounded-lg bg-white shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-teal-700">Notices</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
        >
          {showForm ? "Cancel" : "Add Notice"}
        </button>
      </div>

      {/* Add Notice Form */}
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
              Added From
            </label>
            <input
              type="text"
              name="addedFrom"
              value={formData.addedFrom}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>
          <button
            type="submit"
            className="mt-2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
          >
            Submit Notice
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading notices...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : data.length > 0 ? (
        <div className="overflow-x-auto">
          <p className="text-sm text-gray-500 mt-4">Lead ID: {leadId}</p>
          <table className="w-full border border-teal-300 rounded-md">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Date Contacted</th>
                <th className="px-4 py-2">Added From</th>
                <th className="px-4 py-2">Date Added</th>{" "}
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
                  {item.SYNCED ? "✔️" : "❌"}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No notices available.</p>
      )}
    </div>
  );
};

export default Notices;
