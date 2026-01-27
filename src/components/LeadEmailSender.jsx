"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaEnvelope, FaTimes, FaPaperPlane } from "react-icons/fa";
import EmailComposer from "./EmailWrite";

export default function LeadEmailSender({ leadId, leadEmail, leadName, onEmailSent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [templateContent, setTemplateContent] = useState({ subject: "", body: "" });
  const [useTemplate, setUseTemplate] = useState(false);
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchEmailTemplates();
    }
  }, [isOpen]);

  const fetchEmailTemplates = async () => {
    try {
      const response = await axios.get("/api/fetch-email-template");
      setEmailTemplates(response.data.template || []);
    } catch (error) {
      console.error("Failed to fetch email templates:", error);
      toast.error("Failed to load email templates");
    }
  };

  const handleTemplateSelect = async (templateId) => {
    setSelectedTemplate(templateId);
    if (templateId) {
      try {
        const response = await axios.get(`/api/fetch-email-template`);
        const template = response.data.template?.find(t => t.template_id === templateId);
        if (template) {
          setTemplateContent({
            subject: template.subject || "",
            body: template.body || "",
          });
          setUseTemplate(true);
        }
      } catch (error) {
        console.error("Failed to load template:", error);
        toast.error("Failed to load template content");
      }
    } else {
      setUseTemplate(false);
      setTemplateContent({ subject: "", body: "" });
    }
  };

  const handleSendTemplate = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    try {
      const response = await axios.post("/api/emails/leads", {
        LEAD_ID: leadId,
        TEMPLATE_ID: selectedTemplate,
      });

      if (response.data.success) {
        toast.success("Email sent successfully!");
        setIsOpen(false);
        if (onEmailSent) onEmailSent();
      } else {
        toast.error(response.data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending template email:", error);
      toast.error(error.response?.data?.message || "Failed to send email");
    }
  };

  const handleCustomEmail = () => {
    setShowComposer(true);
    setUseTemplate(false);
  };

  const handleEmailSent = () => {
    setShowComposer(false);
    setIsOpen(false);
    if (onEmailSent) onEmailSent();
  };

  if (!isOpen && !showComposer) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
      >
        <FaEnvelope /> Send Email
      </button>
    );
  }

  if (showComposer) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Send Email to {leadName}</h3>
            <button
              onClick={() => {
                setShowComposer(false);
                setIsOpen(false);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          <div className="p-4">
            <EmailComposer
              leadId={leadId}
              onClose={() => {
                setShowComposer(false);
                setIsOpen(false);
              }}
              onEmailSent={handleEmailSent}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              Send Email to {leadName}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Email Template (Optional)
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">-- Select Template or Send Custom Email --</option>
              {emailTemplates.map((template) => (
                <option key={template.template_id} value={template.template_id}>
                  Template {template.template_id}: {template.subject || "No Subject"}
                </option>
              ))}
            </select>
          </div>

          {useTemplate && templateContent.subject && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Subject:</p>
              <p className="text-gray-900">{templateContent.subject}</p>
              <p className="text-sm font-medium text-gray-700 mb-1 mt-3">Body Preview:</p>
              <div
                className="text-gray-700 text-sm max-h-32 overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: templateContent.body?.substring(0, 200) + "...",
                }}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCustomEmail}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <FaEnvelope /> Custom Email
            </button>
            {selectedTemplate && (
              <button
                onClick={handleSendTemplate}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaPaperPlane /> Send Template
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
