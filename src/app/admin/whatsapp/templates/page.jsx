"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from "react-icons/fa";

export default function WhatsAppTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    templateName: "",
    templateId: "",
    description: "",
    exampleArr: [],
    mediaUri: "",
    isActive: true,
  });
  const [exampleInput, setExampleInput] = useState("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/whatsapp/templates");
      setTemplates(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch templates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await axios.put(`/api/whatsapp/templates/${editingTemplate._id}`, formData);
        toast.success("Template updated successfully");
      } else {
        await axios.post("/api/whatsapp/templates", formData);
        toast.success("Template created successfully");
      }
      setShowModal(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save template");
    }
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      templateName: template.templateName,
      templateId: template.templateId,
      description: template.description || "",
      exampleArr: template.exampleArr || [],
      mediaUri: template.mediaUri || "",
      isActive: template.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try {
      await axios.delete(`/api/whatsapp/templates/${id}`);
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const resetForm = () => {
    setFormData({
      templateName: "",
      templateId: "",
      description: "",
      exampleArr: [],
      mediaUri: "",
      isActive: true,
    });
    setExampleInput("");
  };

  const addExample = () => {
    if (exampleInput.trim()) {
      setFormData({
        ...formData,
        exampleArr: [...formData.exampleArr, exampleInput.trim()],
      });
      setExampleInput("");
    }
  };

  const removeExample = (index) => {
    setFormData({
      ...formData,
      exampleArr: formData.exampleArr.filter((_, i) => i !== index),
    });
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">WhatsApp Templates</h1>
          <button
            onClick={() => {
              resetForm();
              setEditingTemplate(null);
              setShowModal(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add Template
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No templates found. Create your first template.
                    </td>
                  </tr>
                ) : (
                  templates.map((template) => (
                    <tr key={template._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {template.templateName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template.templateId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {template.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            template.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {template.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-teal-600 hover:text-teal-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(template._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingTemplate ? "Edit Template" : "Add Template"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.templateName}
                    onChange={(e) =>
                      setFormData({ ...formData, templateName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.templateId}
                    onChange={(e) =>
                      setFormData({ ...formData, templateId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
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
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addExample())}
                      placeholder="Enter example value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={addExample}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.exampleArr.map((ex, idx) => (
                      <span
                        key={idx}
                        className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full flex items-center gap-2"
                      >
                        {ex}
                        <button
                          type="button"
                          onClick={() => removeExample(idx)}
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
                    value={formData.mediaUri}
                    onChange={(e) =>
                      setFormData({ ...formData, mediaUri: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Active
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                      setEditingTemplate(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    {editingTemplate ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
