"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../../../admin_dashboard_layout/layout";
import { useParams } from "next/navigation";
import Reminders from "@/components/Reminders";
import Notes from "@/components/Notes";
import LeadProfile from "@/components/LeadProfile";
import DuplicateLeads from "@/components/DuplicateLeads";
import LeadsStudents from "@/components/LeadsStudents";
import { FaWhatsapp, FaEnvelope, FaEdit } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import EditLeadModal from "@/components/EditLead";

const Page = () => {
  const [activeSection, setActiveSection] = useState("Profile");
  const { lead_id } = useParams(); // Extract lead_id from URL params
  const [leadData, setLeadData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await axios.post("/api/leads/single-lead", {
          leadId: lead_id,
        });
        setLeadData(response.data.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while fetching lead data."
        );
      }
    };
    fetchLead();
  }, [lead_id]);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = async (updatedLead) => {
    setIsEditModalOpen(false);
    toast.success("Lead updated successfully!");
  };

  return (
    <DashboardLayout>
      <div className="p-5">
        <button
          onClick={() => router.back()}
          className="mb-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Back
        </button>
        <div className="bg-white shadow-md rounded-lg p-5 mb-5 flex items-center justify-between">
          {/* Profile Info */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-teal-500 text-white flex items-center justify-center rounded-full text-xl font-semibold">
              {leadData?.FULL_NAME.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {leadData?.FULL_NAME}
              </h2>
              <p className="text-gray-500">Lead ID: {leadData?.LEAD_ID}</p>
            </div>
          </div>
          {/* Contact Icons */}
          <div className="flex space-x-4">
            <button
              onClick={handleEdit}
              className="text-teal-500 hover:text-teal-700 text-2xl"
            >
              <FaEdit />
            </button>
            <a
              href={`https://wa.me/${leadData?.PHONE_NO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:text-teal-700 text-2xl"
            >
              <FaWhatsapp />
            </a>
            <a
              href={`mailto:${leadData?.EMAIL}`}
              className="text-teal-500 hover:text-teal-700 text-2xl"
            >
              <FaEnvelope />
            </a>
          </div>
        </div>
        {/* Section Tabs */}
        <div className="flex space-x-4 mb-5">
          {[
            "Profile",
            "Reminders",
            "Notes",
            "Email Activity",
            "Classes",
            "Activity Log",
            "Duplicate Leads",
          ].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-md text-white ${
                activeSection === section ? "bg-teal-600" : "bg-teal-400"
              }`}
            >
              {section}
            </button>
          ))}
        </div>
        {/* Section Content */}
        {activeSection === "Reminders" && <Reminders leadId={lead_id} />}
        {activeSection === "Notes" && <Notes leadId={lead_id} />}
        {activeSection === "Profile" && <LeadProfile leadId={lead_id} />}
        {activeSection === "Email Activity" && (
          <p>Email Activity will be here</p>
        )}
        {activeSection === "Classes" && <LeadsStudents leadId={lead_id} />}
        {activeSection === "Activity Log" && <p>Activity Log will be here</p>}
        {activeSection === "Duplicate Leads" && (
          <DuplicateLeads leadId={lead_id} />
        )}
        {/* Edit Lead Modal */}
        {isEditModalOpen && (
          <EditLeadModal
            lead={leadData}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleSave}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Page;
