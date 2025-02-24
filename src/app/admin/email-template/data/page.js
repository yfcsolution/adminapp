"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import axios from "axios";
import { toast } from "react-toastify";
import Link from "next/link";

const StudentsData = () => {
  const [emailTemplate, setEmailTemplate] = useState([]);
  const [isEditing, setIsEditing] = useState(null); // To track the editing state of a template
  const [editableTemplate, setEditableTemplate] = useState({}); // To store the editable template data

  // Fetch email template data
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

  // Handle updating the template
  const handleUpdateClick = (template) => {
    setIsEditing(template.id); // Enable edit mode for the clicked template
    setEditableTemplate(template); // Set the template data for editing
  };

  // Handle save action
  const handleSaveClick = async () => {
    try {
      console.log("editable template is ", editableTemplate);

      await axios.post("/api/edit-email-template", editableTemplate, {
        withCredentials: true,
      });
      toast.success("Template updated successfully!");
      setIsEditing(null); // Disable edit mode
      fetchEmailTemplate(); // Refresh the template data
    } catch (error) {
      toast.error("Failed to update template.");
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setEditableTemplate({
      ...editableTemplate,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <title>ilmulQuran Student Info</title>
      <DashboardLayout>
        <div className="flex justify-start">
          <Link
            href="/admin/email-template/create"
            className="bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-700 transition-colors duration-300 mb-2"
          >
            Create
          </Link>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Email Template
          </h2>

          {/* Table Layout for Large Screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-200">
                <tr className="text-left">
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Template Id
                  </th>
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Name
                  </th>
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Subject
                  </th>
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    HTML
                  </th>
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {emailTemplate.map((template, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">
                      {template.template_id}
                    </td>
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">
                      {isEditing === template.id ? (
                        <input
                          type="text"
                          name="name"
                          value={editableTemplate.name}
                          onChange={handleInputChange}
                          className="border border-gray-300 p-2 w-full"
                        />
                      ) : (
                        template.name
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">
                      {isEditing === template.id ? (
                        <input
                          type="text"
                          name="subject"
                          value={editableTemplate.subject}
                          onChange={handleInputChange}
                          className="border border-gray-300 p-2 w-full"
                        />
                      ) : (
                        template.subject
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">
                      {isEditing === template.id ? (
                        <textarea
                          name="html"
                          value={editableTemplate.html}
                          onChange={handleInputChange}
                          className="border border-gray-300 p-2 w-full h-32"
                        />
                      ) : (
                        template.html
                      )}
                    </td>
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">
                      {isEditing === template.id ? (
                        <button
                          onClick={handleSaveClick}
                          className="bg-teal-600 text-white px-4 py-2 rounded mt-2"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateClick(template)}
                          className="bg-teal-600 text-white px-4 py-2 rounded mt-2"
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentsData;
