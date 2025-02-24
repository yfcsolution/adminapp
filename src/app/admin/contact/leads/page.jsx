"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  FaTrashAlt,
  FaPen,
  FaEllipsisH,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
import { toast } from "react-toastify";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import Modal from "@/components/Modal";

const LeadsData = () => {
  const [leadsData, setLeadsData] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalLeads, setTotalLeads] = useState(0);
  const [emailTemplate, setEmailTemplate] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(""); // For storing selected template ID
  const [selectedLead, setSelectedLead] = useState(null); // Selected lead data
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [appKey, setAppKey] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const fetchLeadsData = async () => {
    try {
      const response = await axios.get(
        `/api/leads/data?page=${page}&pageSize=${pageSize}`
      );
      console.log(response.data.data);
      setLeadsData(response.data.data.data);
      setTotalLeads(response.data.data.total);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch leads data.");
    }
  };

  const sendEmail = async (leadID) => {
    if (!selectedTemplateId) {
      toast.error("Please select a template before sending the email.");
      return;
    }

    try {
      const response = await axios.post("/api/emails/leads", {
        LEAD_ID: leadID,
        TEMPLATE_ID: selectedTemplateId, // Send selected template ID to the backend
      });

      // Log the response (you can do something else with the response here)
      console.log("Email sent successfully:", response.data);
      toast.success("Email sent successfully!");
    } catch (error) {
      // More detailed error handling
      if (error.response) {
        console.error("Error:", error.response.data);
        toast.error("Failed to send email.");
      } else {
        console.error("Error:", error.message);
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleTemplateChange = (e) => {
    setSelectedTemplateId(e.target.value); // Update selected template ID
  };

  // Open WhatsApp Modal
  const handleWhatsAppClick = (lead) => {
    setSelectedLead(lead); // Set the selected lead data
    setIsModalOpen(true); // Open the modal
  };

  const handleSendMessage = async () => {
    if (!appKey || !message) {
      toast.error("App Key and Message cannot be empty!");
      return;
    }

    try {
      const response = await axios.post(
        "/api/messages/whatsapp/custom-message",
        {
          lead_id: selectedLead.LEAD_ID, // Send Lead ID
          appkey: appKey, // Send App Key
          message: message, // Send Message
        }
      );

      // Handle success
      toast.success("Message sent successfully!");
      console.log("Response:", response.data);
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      // Handle errors
      console.error("Error sending message:", error);
      toast.error("Failed to send the message. Please try again.");
    }
  };

  useEffect(() => {
    fetchLeadsData();
  }, [page, pageSize]);

  // Handle Pagination
  const totalPages = Math.ceil(totalLeads / pageSize);
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const fetchEmailTemplate = async () => {
    try {
      const response = await axios.get(`/api/fetch-email-template`, {
        withCredentials: true,
      });
      setEmailTemplate(response.data.template);
    } catch (error) {
      console.error("Error fetching Template:", error);
      toast.error("Failed to fetch email template.");
    }
  };
  useEffect(() => {
    fetchEmailTemplate();
  }, []);

  return (
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Contact </h2>

        <div className="mb-5">
          <label
            htmlFor="templateId"
            className="font-semibold text-lg text-teal-700"
          >
            Select Email Template:{" "}
          </label>
          <select
            id="templateId"
            className="mt-2 px-4 py-2 rounded-lg border border-teal-300 bg-teal-50 text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={selectedTemplateId}
            onChange={handleTemplateChange}
          >
            <option value="" className="text-gray-500">
              -- Select Template --
            </option>
            {emailTemplate.map((template) => (
              <option key={template.template_id} value={template.template_id}>
                Template {template.template_id}
              </option>
            ))}
          </select>
        </div>

        {/* Table Layout */}
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="text-left text-gray-600 bg-teal-500">
              <th className="px-4 py-2">Lead ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Remarks</th>
              <th className="px-4 text-center py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leadsData.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{lead.LEAD_ID}</td>
                <td className="px-4 py-2">{lead.FULL_NAME}</td>
                <td className="px-4 py-2">
                  {new Date(lead.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>{" "}
                <td className="px-4 py-2">{lead.REMARKS}</td>
                <td className="px-4 py-2 text-center">
                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => handleWhatsAppClick(lead)}
                      className="bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition duration-200"
                      aria-label="WhatsApp Lead"
                    >
                      <FaWhatsapp className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => sendEmail(lead.LEAD_ID)}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition duration-200"
                      aria-label="Delete Lead"
                    >
                      <FaEnvelope className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            disabled={page === 1}
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>

        {/* WhatsApp Modal */}
        {isModalOpen && selectedLead && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            {/* Modal Header */}
            <div className="flex flex-col items-center mb-6">
              <h2 className="text-2xl font-bold text-teal-700">
                WhatsApp Message
              </h2>
              <div className="mt-2 bg-teal-100 p-4 rounded-lg shadow">
                <p className="text-lg">
                  <span className="font-semibold text-teal-800">Lead ID:</span>{" "}
                  <span className="text-gray-700">{selectedLead.LEAD_ID}</span>
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-teal-800">Name:</span>{" "}
                  <span className="text-gray-700">
                    {selectedLead.FULL_NAME}
                  </span>
                </p>
              </div>
            </div>

            {/* App Key Input */}
            <div className="mb-4">
              <label
                htmlFor="appKey"
                className="block text-sm font-semibold text-teal-800 mb-2"
              >
                Enter App Key:
              </label>
              <input
                type="text"
                id="appKey"
                value={appKey}
                onChange={(e) => setAppKey(e.target.value)}
                placeholder="Enter your App Key..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* WhatsApp Message Textarea */}
            <div className="mb-4">
              <label
                htmlFor="whatsappMessage"
                className="block text-sm font-semibold text-teal-800 mb-2"
              >
                Message:
              </label>
              <textarea
                id="whatsappMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="6"
                placeholder="Type your WhatsApp message here..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500"
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 text-white bg-teal-600 rounded-lg hover:bg-teal-700"
              >
                Send
              </button>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeadsData;
