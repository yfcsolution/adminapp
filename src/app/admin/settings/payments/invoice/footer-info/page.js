"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../../../admin_dashboard_layout/layout";
import { toast } from "react-toastify";
import { FiArrowLeft, FiEdit, FiSave, FiX, FiPlus } from "react-icons/fi";
import {
  FaUniversity,
  FaFileContract,
  FaEnvelope,
  FaPhone,
  FaGlobe,
} from "react-icons/fa";

export default function FooterManager() {
  const [footerData, setFooterData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFooterData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoice/footer");
      const data = await res.json();
      if (data && Object.keys(data).length > 0) {
        // Ensure phone object structure exists
        if (data.contact && typeof data.contact.phone === 'string') {
          data.contact.phone = {
            uk: data.contact.phone,
            au: '',
            us: ''
          };
        }
        setFooterData(data);
      } else {
        setFooterData(null);
      }
    } catch (err) {
      console.error("Error fetching footer:", err);
      toast.error("Failed to load footer data");
      setFooterData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    setFooterData((prevData) => {
      const updated = { ...prevData };
      if (keys.length === 3) {
        // For nested objects like contact.phone.uk
        if (!updated[keys[0]][keys[1]]) updated[keys[0]][keys[1]] = {};
        updated[keys[0]][keys[1]][keys[2]] = value;
      } else if (keys.length === 2) {
        updated[keys[0]][keys[1]] = value;
      } else {
        updated[name] = value;
      }
      return updated;
    });
  };

  const handleTermsChange = (e) => {
    setFooterData((prevData) => ({
      ...prevData,
      terms: e.target.value.split("\n"),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const method = footerData?._id ? "PUT" : "POST";
      const res = await fetch("/api/invoice/footer", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(footerData),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Footer saved successfully!");
        setIsEditing(false);
        await fetchFooterData(); // Refresh data after successful save
      } else {
        toast.error(result.message || "Failed to save footer");
      }
    } catch (error) {
      console.error("Error saving footer:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Invoice Footer Settings
          </h1>
          {!isEditing && (
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-teal-600 hover:text-teal-800"
            >
              <FiArrowLeft className="mr-2" />
              Back
            </button>
          )}
        </div>

        {!footerData && !isEditing ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FiPlus className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Footer Configuration Found
            </h3>
            <p className="text-gray-500 mb-6">
              Create a new footer configuration for your invoices
            </p>
            <button
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center mx-auto"
              onClick={() => {
                setFooterData({
                  bank: {
                    accountName: "",
                    bankName: "",
                    sortCode: "",
                    accountNumber: "",
                  },
                  terms: [],
                  contact: { 
                    email: "", 
                    phone: {
                      uk: "",
                      au: "",
                      us: ""
                    }, 
                    website: "" 
                  },
                  footerText: { thankYouMessage: "", signatureMessage: "" },
                });
                setIsEditing(true);
              }}
            >
              <FiPlus className="mr-2" />
              Create Footer
            </button>
          </div>
        ) : !isEditing ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Footer Preview
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-teal-600 hover:text-teal-800"
              >
                <FiEdit className="mr-2" />
                Edit
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Bank Info */}
              <div>
                <div className="flex items-center mb-3">
                  <FaUniversity className="text-teal-500 mr-2" />
                  <h4 className="text-md font-medium text-gray-700">
                    Bank Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Account Name</p>
                    <p className="font-medium">
                      {footerData.bank.accountName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bank Name</p>
                    <p className="font-medium">
                      {footerData.bank.bankName || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sort Code</p>
                    <p className="font-medium">
                      {footerData.bank.sortCode || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Account Number</p>
                    <p className="font-medium">
                      {footerData.bank.accountNumber || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div>
                <div className="flex items-center mb-3">
                  <FaFileContract className="text-teal-500 mr-2" />
                  <h4 className="text-md font-medium text-gray-700">
                    Terms & Conditions
                  </h4>
                </div>
                <ul className="space-y-2">
                  {footerData.terms.length > 0 ? (
                    footerData.terms.map((term, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-teal-500 mr-2">•</span>
                        <span>{term}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-400">No terms specified</p>
                  )}
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <div className="flex items-center mb-3">
                  <FaEnvelope className="text-teal-500 mr-2" />
                  <h4 className="text-md font-medium text-gray-700">
                    Contact Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center">
                      <FaEnvelope className="text-gray-400 mr-2 text-sm" />
                      <p className="text-sm text-gray-500">Email</p>
                    </div>
                    <p className="font-medium mt-1">
                      {footerData.contact.email || "-"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center mb-1">
                      <FaPhone className="text-gray-400 mr-2 text-sm" />
                      <p className="text-sm text-gray-500">Phone Numbers</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">UK</p>
                        <p className="font-medium mt-1">
                          {footerData.contact.phone?.uk || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Australia</p>
                        <p className="font-medium mt-1">
                          {footerData.contact.phone?.au || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">USA</p>
                        <p className="font-medium mt-1">
                          {footerData.contact.phone?.us || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="flex items-center">
                      <FaGlobe className="text-gray-400 mr-2 text-sm" />
                      <p className="text-sm text-gray-500">Website</p>
                    </div>
                    <p className="font-medium mt-1">
                      {footerData.contact.website || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Text */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  {footerData.footerText.thankYouMessage}
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                  {footerData.footerText.signatureMessage}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {footerData._id ? "Edit Footer" : "Create New Footer"}
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Bank Info */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaUniversity className="text-teal-500 mr-2" />
                  <h4 className="text-md font-medium text-gray-700">
                    Bank Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["accountName", "bankName", "sortCode", "accountNumber"].map(
                    (field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </label>
                        <input
                          type="text"
                          name={`bank.${field}`}
                          value={footerData.bank[field]}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Terms */}
              <div>
                <div className="flex items-center mb-1">
                  <FaFileContract className="text-teal-500 mr-2" />
                  <label className="block text-sm font-medium text-gray-700">
                    Terms & Conditions (one per line)
                  </label>
                </div>
                <textarea
                  name="terms"
                  value={footerData.terms.join("\n")}
                  onChange={handleTermsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                  rows={5}
                />
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaEnvelope className="text-teal-500 mr-2" />
                  <h4 className="text-md font-medium text-gray-700">
                    Contact Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="text"
                      name="contact.email"
                      value={footerData.contact.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Numbers
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          UK
                        </label>
                        <input
                          type="text"
                          name="contact.phone.uk"
                          value={footerData.contact.phone?.uk || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          placeholder="+447862067920"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Australia
                        </label>
                        <input
                          type="text"
                          name="contact.phone.au"
                          value={footerData.contact.phone?.au || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          placeholder="+61480050048"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          USA
                        </label>
                        <input
                          type="text"
                          name="contact.phone.us"
                          value={footerData.contact.phone?.us || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                          placeholder="+19142791693"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="text"
                      name="contact.website"
                      value={footerData.contact.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* Footer Text */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">
                  Footer Text
                </h4>
                {["thankYouMessage", "signatureMessage"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </label>
                    <input
                      type="text"
                      name={`footerText.${field}`}
                      value={footerData.footerText[field]}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-between">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                <FiX className="mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}