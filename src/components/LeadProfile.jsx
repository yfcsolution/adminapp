"use client";
import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const LeadProfile = ({ leadId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedField, setSelectedField] = useState(null);
  const [visibleFields, setVisibleFields] = useState({});

  useEffect(() => {
    const fetchLead = async () => {
      if (!leadId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/leads/single-lead-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || "Failed to fetch lead data");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err.message || "An error occurred while fetching lead data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId]);

  const fetchContacts = async () => {
    if (!selectedField || !password) {
      toast.error("Please enter the password.");
      return;
    }

    try {
      const response = await axios.post("/api/leads/contact", {
        LEAD_ID: leadId,
        [selectedField]: true,
        CONTACT_SECRETE: password,
      });

      const fetchedData = response.data.data;

      setVisibleFields((prev) => ({
        ...prev,
        [selectedField]: fetchedData[selectedField] || "N/A",
      }));

      toast.success(`${selectedField} unlocked successfully!`);
      setIsModalOpen(false);
      setPassword("");
    } catch (error) {
      console.error(`Error fetching ${selectedField}`, error);
      toast.error(`Failed to fetch ${selectedField}.`);
    }
  };

  const toggleVisibility = (field) => {
    setVisibleFields((prev) => ({
      ...prev,
      [field]: prev[field] ? null : data[field], // Toggle visibility
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-4 sm:p-10">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl border border-gray-300 p-6 sm:p-10">
        {data ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-4">
                <ProfileField label="Name" value={data.FULL_NAME} />
                <ProfileField
                  label="Email"
                  value={visibleFields.EMAIL || "••••••••"}
                  isSensitive
                  isVisible={!!visibleFields.EMAIL}
                  onUnlock={() => {
                    if (visibleFields.EMAIL) {
                      toggleVisibility("EMAIL");
                    } else {
                      setSelectedField("EMAIL");
                      setIsModalOpen(true);
                    }
                  }}
                />
                <ProfileField
                  label="Phone"
                  value={visibleFields.PHONE_NO || "••••••••"}
                  isSensitive
                  isVisible={!!visibleFields.PHONE_NO}
                  onUnlock={() => {
                    if (visibleFields.PHONE_NO) {
                      toggleVisibility("PHONE_NO");
                    } else {
                      setSelectedField("PHONE_NO");
                      setIsModalOpen(true);
                    }
                  }}
                />
                <ProfileField label="Country" value={data.COUNTRY} />
              </div>

              <div className="space-y-4">
                <ProfileField label="State" value={data.STATE} />
                <ProfileField label="Time Zone" value={data.TIME_ZONE} />
                <ProfileField label="Currency" value={data.CURRENCY} />
                <ProfileField label="Remarks" value={data.REMARKS} />
              </div>

              <div className="space-y-4">
                <ProfileField label="Current Status" value={data.P_STATUS} />
                <ProfileField
                  label="WhatsApp Status"
                  value={data.WHATSAPP_STATUS}
                />
                <ProfileField label="Lead IP" value={data.LEAD_IP} />
                <ProfileField label="Request Form" value={data.REQUEST_FORM} />
              </div>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">No data available.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold text-center mb-4">
              Enter Code to Unlock{" "}
              {selectedField === "EMAIL" ? "Email" : "Phone"}
            </h3>
            <input
              type="password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter code"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded mr-2"
                onClick={() => {
                  setIsModalOpen(false);
                  setPassword("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-teal-600 text-white px-4 py-2 rounded"
                onClick={fetchContacts}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfileField = ({
  label,
  value,
  isSensitive = false,
  isVisible,
  onUnlock,
}) => (
  <div>
    <p className="text-gray-800 font-bold text-sm uppercase">{label}</p>
    <div className="flex items-center gap-2">
      <p className={`text-gray-700 ${isSensitive ? "text-teal-600" : ""}`}>
        {value || "N/A"}
      </p>
      {isSensitive &&
        (isVisible ? (
          <FaEyeSlash
            className="text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={onUnlock}
          />
        ) : (
          <FaEye
            className="text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={onUnlock}
          />
        ))}
    </div>
  </div>
);

export default LeadProfile;
