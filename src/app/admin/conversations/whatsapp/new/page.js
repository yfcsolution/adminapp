"use client";
import React, { useState } from "react";
import DashboardLayout from "../../../../admin_dashboard_layout/layout";
import { toast } from "react-toastify"; // Import toast for error messages
import axios from "axios"; // Import axios for API calls
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast
import { useRouter } from "next/navigation";

const NewConversation = () => {
  const [formData, setFormData] = useState({
    lead_id: "",
    family_id: "",
    message: "",
  });

  const [appKey, setAppKey] = useState("044d31bc-1666-4f72-8cc2-32be88c8a6d7"); // Default value for US AppKey
  const [isLeadIdActive, setIsLeadIdActive] = useState(true); // Track if Lead ID is active
  const [isFamilyIdActive, setIsFamilyIdActive] = useState(true); // Track if Family ID is active
  const [isSubmitting, setIsSubmitting] = useState(false); // Track if the form is submitting
  const router = useRouter();
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Disable Family ID if Lead ID is entered
    if (name === "lead_id" && value) {
      setIsFamilyIdActive(false);
    } else if (name === "lead_id" && !value) {
      setIsFamilyIdActive(true);
    }

    // Disable Lead ID if Family ID is entered
    if (name === "family_id" && value) {
      setIsLeadIdActive(false);
    } else if (name === "family_id" && !value) {
      setIsLeadIdActive(true);
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if either leadId or familyId is provided
    if (!formData.lead_id && !formData.family_id) {
      toast.error("Either Lead ID or Family ID must be provided.");
      return;
    }

    const dataToSubmit = {
      lead_id: formData.lead_id,
      family_id: formData.family_id,
      appkey: appKey, // Sending appKey as part of the data
      message: formData.message,
    };
    setIsSubmitting(true); // Set submitting to true when the form starts submitting

    try {
      console.log("data to submit is", dataToSubmit);

      const response = await axios.post(
        "/api/messages/whatsapp/custom-message",
        dataToSubmit
      );

      if (response.status === 200) {
        toast.success("Message sent successfully!");
        // Optionally, reset the form or perform other actions after successful submission
        setFormData({
          lead_id: "",
          family_id: "",
          message: "",
        });
        router.push("/admin/conversations/whatsapp/chat");
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while sending the message.");
    } finally {
      setIsSubmitting(false); // Reset submitting to false after the submission process ends
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-semibold text-teal-800 mb-4">
          New Conversation
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="leadId"
              className="block text-sm font-medium text-gray-700"
            >
              Lead ID
            </label>
            <input
              type="text"
              id="leadId"
              name="lead_id" // Adjusted name to match backend
              value={formData.lead_id}
              onChange={handleChange}
              placeholder="Enter Lead ID"
              className="mt-1 px-4 py-2 border rounded-md w-full"
              disabled={!isLeadIdActive}
            />
          </div>
          <div>
            <label
              htmlFor="familyId"
              className="block text-sm font-medium text-gray-700"
            >
              Family ID
            </label>
            <input
              type="text"
              id="familyId"
              name="family_id" // Adjusted name to match backend
              value={formData.family_id}
              onChange={handleChange}
              placeholder="Enter Family ID"
              className="mt-1 px-4 py-2 border rounded-md w-full"
              disabled={!isFamilyIdActive}
            />
          </div>
          <div>
            <label
              htmlFor="appKey"
              className="block text-sm font-medium text-gray-700"
            >
              App Key
            </label>
            <select
              id="appKey"
              value={appKey}
              onChange={(e) => setAppKey(e.target.value)}
              className="px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm w-1/4"
            >
              <option value="044d31bc-1666-4f72-8cc2-32be88c8a6d7">
                US AppKey
              </option>
              <option value="1fea0f8e-72f0-4ce4-8d3d-406b91b92e55">
                PK AppKey
              </option>
              <option value="3fa548ce-ec9b-4906-8c5a-f48b0ef69cc8">
                AU AppKey
              </option>
              <option value="be4f69af-d825-4e7f-a029-2a68c5f732c9">
                UK AppKey
              </option>
            </select>
          </div>
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter Message"
              className="mt-1 px-4 py-2 border rounded-md w-full"
              rows="4"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              disabled={isSubmitting} // Disable the button when the form is submitting
            >
              {isSubmitting ? "Sending..." : "Submit"}{" "}
              {/* Change button text when submitting */}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewConversation;
