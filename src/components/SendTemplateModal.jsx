"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaTimes, FaPaperPlane } from "react-icons/fa";

export default function SendTemplateModal({ isOpen, onClose, leadId, userId, phoneNumber, email }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [exampleArr, setExampleArr] = useState([]);
  const [exampleInput, setExampleInput] = useState("");
  const [token, setToken] = useState("");
  const [mediaUri, setMediaUri] = useState("");
  const [sending, setSending] = useState(false);
  const [messageType, setMessageType] = useState("whatsapp"); // whatsapp or email
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [daysAfter, setDaysAfter] = useState(0);
  const [scheduleMode, setScheduleMode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      fetchAutoSendConfig();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get("/api/whatsapp/templates?isActive=true");
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  };

  const fetchAutoSendConfig = async () => {
    try {
      const response = await axios.get("/api/autosend/config?type=whatsapp");
      const config = response.data.data?.[0];
      if (config?.token) {
        setToken(config.token);
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    }
  };

  const handleAddExample = () => {
    if (exampleInput.trim()) {
      setExampleArr([...exampleArr, exampleInput.trim()]);
      setExampleInput("");
    }
  };

  const handleRemoveExample = (index) => {
    setExampleArr(exampleArr.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (messageType === "whatsapp") {
      if (!selectedTemplate || !token) {
        toast.error("Please select a template and provide API token");
        return;
      }
    } else {
      if (!emailSubject || !emailBody) {
        toast.error("Please provide email subject and body");
        return;
      }
    }

    setSending(true);
    try {
      if (scheduleMode && daysAfter > 0) {
        // Schedule the message
        await axios.post("/api/whatsapp/schedule", {
          leadId,
          userId,
          templateName: selectedTemplate,
          daysAfter,
          exampleArr,
          mediaUri: mediaUri || null,
          messageType,
          emailSubject: messageType === "email" ? emailSubject : null,
          emailBody: messageType === "email" ? emailBody : null,
        });
        toast.success(`Message scheduled for ${daysAfter} days from now`);
      } else {
        // Send immediately
        if (messageType === "whatsapp") {
          await axios.post("/api/whatsapp/send", {
            leadId,
            userId,
            sendTo: phoneNumber,
            templateName: selectedTemplate,
            exampleArr,
            token,
            mediaUri: mediaUri || null,
            type: "manual",
          });
          toast.success("WhatsApp template sent successfully");
        } else {
          await axios.post("/api/email/send-template", {
            leadId,
            userId,
            to: email,
            subject: emailSubject,
            body: emailBody,
            type: "manual",
          });
          toast.success("Email sent successfully");
        }
      }
      onClose();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate("");
    setExampleArr([]);
    setExampleInput("");
    setMediaUri("");
    setEmailSubject("");
    setEmailBody("");
    setDaysAfter(0);
    setScheduleMode(false);
    setMessageType("whatsapp");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Send Template</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="whatsapp"
                checked={messageType === "whatsapp"}
                onChange={(e) => setMessageType(e.target.value)}
                className="mr-2"
              />
              WhatsApp
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="email"
                checked={messageType === "email"}
                onChange={(e) => setMessageType(e.target.value)}
                className="mr-2"
              />
              Email
            </label>
          </div>
        </div>

        {messageType === "whatsapp" ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Template *
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a template</option>
                {templates.map((template) => (
                  <option key={template._id} value={template.templateName}>
                    {template.templateName} ({template.templateId})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Token *
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                placeholder="Enter WACRM API token"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Example Variables
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={exampleInput}
                  onChange={(e) => setExampleInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddExample())
                  }
                  placeholder="Enter example value"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  onClick={handleAddExample}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {exampleArr.map((ex, idx) => (
                  <span
                    key={idx}
                    className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {ex}
                    <button
                      type="button"
                      onClick={() => handleRemoveExample(idx)}
                      className="text-teal-600 hover:text-teal-800"
                    >
                      <FaTimes />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Media URI (Optional)
              </label>
              <input
                type="text"
                value={mediaUri}
                onChange={(e) => setMediaUri(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Subject *
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Body *
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="6"
                required
              />
            </div>
          </>
        )}

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={scheduleMode}
              onChange={(e) => setScheduleMode(e.target.checked)}
              className="mr-2"
            />
            Schedule this message
          </label>
        </div>

        {scheduleMode && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Send after (days)
            </label>
            <input
              type="number"
              min="0"
              value={daysAfter}
              onChange={(e) => setDaysAfter(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
          >
            <FaPaperPlane />
            {sending ? "Sending..." : scheduleMode ? "Schedule" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
