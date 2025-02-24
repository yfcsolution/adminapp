"use client";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Reminders = ({ leadId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchReminders = async () => {
      if (!leadId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/reminders/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ P_REL_ID: leadId, P_REL_TYPE: "Lead" }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reminders");
        }

        const result = await response.json();
        console.log("Response JSON:", result);

        if (result && result.reminders && Array.isArray(result.reminders)) {
          setData(result.reminders);
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

    fetchReminders();
  }, [leadId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const reminderData = {
      P_REL_ID: leadId,
      P_REL_TYPE: "Lead",
      P_DESCRIPTION: formData.get("P_DESCRIPTION"),
      P_DATE: formData.get("P_DATE"),
      P_ISNOTIFIED: formData.get("P_ISNOTIFIED") === "Yes" ? 1 : 0, // Map "Yes" to 1 and "No" to 0
      P_STAFF: formData.get("P_STAFF"),
      P_NOTIFY_BY_EMAIL: formData.get("P_NOTIFY_BY_EMAIL") === "Yes" ? 1 : 0, // Map "Yes" to 1 and "No" to 0
      P_CREATOR: formData.get("P_CREATOR"),
      P_CUSTOMER: formData.get("P_CUSTOMER"),
      P_CONTACT: formData.get("P_CONTACT"),
      P_ASSIGNED_TO: formData.get("P_ASSIGNED_TO"),
    };

    try {
      const response = await fetch("/api/reminders/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reminderData),
      });

      if (!response.ok) {
        throw new Error("Failed to save reminder");
      }

      const result = await response.json();
      toast.success("Reminder added sucessfully");
      // Optionally, you can refetch the reminders or update the state directly
      setShowForm(false);
      // Refetch reminders
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 border border-teal-300 rounded-lg bg-white shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-teal-700">Reminders</h2>
        <button
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
          onClick={() => setShowForm(true)}
        >
          Add Reminder
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-4 border border-gray-300 rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Add New Reminder</h3>
          <form onSubmit={handleSubmit}>
            {/* Hidden Fields for P_REL_ID and P_REL_TYPE */}
            <input type="hidden" name="P_REL_ID" value={leadId} />
            <input type="hidden" name="P_REL_TYPE" value="Lead" />

            {/* Description */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="P_DESCRIPTION"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Date */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                name="P_DATE"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Is Notified */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Notified
              </label>
              <select
                name="P_ISNOTIFIED"
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Staff */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Staff
              </label>
              <input
                type="text"
                name="P_STAFF"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Notify by Email */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Notify by Email
              </label>
              <select
                name="P_NOTIFY_BY_EMAIL"
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Creator */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Creator
              </label>
              <input
                type="text"
                name="P_CREATOR"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Customer */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Customer
              </label>
              <input
                type="text"
                name="P_CUSTOMER"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Contact */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Contact
              </label>
              <input
                type="text"
                name="P_CONTACT"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Assigned To */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Assigned To
              </label>
              <input
                type="text"
                name="P_ASSIGNED_TO"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="flex items-center mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                Save Reminder
              </button>
              <button
                type="button"
                className="ml-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading reminders...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : data.length > 0 ? (
        <div className="overflow-x-auto">
          <p className="text-sm text-gray-500 mt-4">Lead ID: {leadId}</p>
          <table className="w-full border border-teal-300 rounded-md">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Notified</th>
                <th className="px-4 py-2">Staff</th>
                <th className="px-4 py-2">Email Notify</th>
                <th className="px-4 py-2">Creator</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Contact</th>
                <th className="px-4 py-2">Assigned To</th>
                <th className="px-4 py-2">Synced</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-teal-50" : "bg-white"}
                >
                  <td className="px-4 py-2 border">{item.P_DESCRIPTION}</td>
                  <td className="px-4 py-2 border">{item.P_DATE}</td>
                  <td className="px-4 py-2 border">
                    {item.P_ISNOTIFIED ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 border">{item.P_STAFF}</td>
                  <td className="px-4 py-2 border">
                    {item.P_NOTIFY_BY_EMAIL ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 border">{item.P_CREATOR}</td>
                  <td className="px-4 py-2 border">{item.P_CUSTOMER}</td>
                  <td className="px-4 py-2 border">{item.P_CONTACT}</td>
                  <td className="px-4 py-2 border">{item.P_ASSIGNED_TO}</td>
                  <td className="px-4 py-2 border">
                    {item.SYNCED ? "✔️" : "❌"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500">No reminders available.</p>
      )}
    </div>
  );
};

export default Reminders;
