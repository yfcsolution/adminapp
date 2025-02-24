"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation"; // Import useRouter from Next.js

const LeadsData = () => {
  const [leadsData, setLeadsData] = useState([]);
  const [dialogData, setDialogData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null); // To store the selected file
  const router = useRouter();

  const fetchLeadsData = async () => {
    const response = await axios.get("/api/fetch-leads");
    setLeadsData(response.data.data);
  };

  useEffect(() => {
    fetchLeadsData();
  }, []);

  const handleOpenDialog = (lead) => {
    setDialogData(lead);
    setIsModalOpen(true);
  };

  const handleCloseDialog = () => {
    setIsModalOpen(false);
    setDialogData(null);
  };

  // delete lead
  const deleteLead = async (id) => {
    try {
      const response = await axios.post("/api/leads/delete", { id });

      if (response.status === 200) {
        toast.success(response.data.message);
        setLeadsData((prevLeads) =>
          prevLeads.filter((lead) => lead._id !== id)
        );
      }
    } catch (error) {
      toast.error("Failed to delete lead");
      console.error(error);
    }
  };

  // update lead
  const handleUpdateLead = (lead) => {
    router.push(`/admin/leads1/update?id=${lead._id}`);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/leads/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Data imported successfully!");
        fetchLeadsData(); // Refresh the leads list after import
        setFile(null); // Clear the file input
      }
    } catch (error) {
      toast.error("Failed to import data");
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-white border border-teal-600 rounded-lg max-w-6xl mx-auto">
      <h2 className="text-3xl font-semibold text-teal-800 mb-6 text-center">
        Leads
      </h2>

      {/* Import Data Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <label
            htmlFor="file-upload"
            className="bg-teal-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-teal-700 transition duration-200"
          >
            Import Data (CSV or Excel)
          </label>
          <input
            type="file"
            id="file-upload"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <button
          onClick={handleFileUpload}
          className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition duration-200"
        >
          Upload File
        </button>
      </div>

      {/* Mobile Card Layout */}
      <div className="grid gap-4 md:hidden">
        {leadsData.map((lead, index) => (
          <div
            key={index}
            className="bg-white border border-teal-500 rounded-lg p-4 shadow-md hover:shadow-lg transition duration-300 ease-in-out"
          >
            <h3 className="text-lg font-bold text-teal-700 mb-2">
              {lead.FULL_NAME}
            </h3>
            <p>
              <strong>Phone No:</strong> {lead.PHONE_NO}
            </p>
            <p>
              <strong>Email:</strong> {lead.EMAIL}
            </p>
            <p>
              <strong>Request Form:</strong> {lead.REQUEST_FORM}
            </p>
            <p>
              <strong>Remarks:</strong> {lead.REMARKS}
            </p>
            <button
              className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition duration-200"
              onClick={() => deleteLead(lead._id)}
            >
              Delete
            </button>
            <button
              className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition duration-200"
              onClick={() => handleUpdateLead(lead)}
            >
              Update
            </button>
            <button
              className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition duration-200"
              onClick={() => handleOpenDialog(lead)}
            >
              More Info
            </button>
          </div>
        ))}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full rounded-lg border-collapse">
          <thead className="border-b border-teal-500">
            <tr>
              <th className="py-3 px-4 border-r border-teal-300 text-sm font-bold text-teal-800">
                Lead ID
              </th>
              <th className="py-3 px-4 border-r border-teal-300 text-sm font-bold text-teal-800">
                Full Name
              </th>
              <th className="py-3 px-4 border-r border-teal-300 text-sm font-bold text-teal-800">
                Phone No
              </th>
              <th className="py-3 px-4 border-r border-teal-300 text-sm font-bold text-teal-800">
                Email
              </th>
              <th className="py-3 px-4 border-r border-teal-300 text-sm font-bold text-teal-800">
                State
              </th>
              <th className="py-3 px-4 border-r border-teal-300 text-sm font-bold text-teal-800">
                Lead Ip
              </th>
              <th className="py-3 px-4 border-r border-teal-300 text-sm font-bold text-teal-800">
                Remarks
              </th>
              <th className="py-3 px-4 text-sm font-bold text-teal-800">
                More Info
              </th>
            </tr>
          </thead>
          <tbody>
            {leadsData.map((lead, index) => (
              <tr
                key={index}
                className="hover:bg-teal-100 transition-colors duration-200 border-b border-teal-300"
              >
                <td className="py-3 px-4 border-r border-teal-300 text-sm text-gray-700">
                  {lead.LEAD_ID}
                </td>
                <td className="py-3 px-4 border-r border-teal-300 text-sm text-gray-700">
                  {lead.FULL_NAME}
                </td>
                <td className="py-3 px-4 border-r border-teal-300 text-sm text-gray-700">
                  {lead.PHONE_NO}
                </td>
                <td className="py-3 px-4 border-r border-teal-300 text-sm text-gray-700">
                  {lead.EMAIL}
                </td>
                <td className="py-3 px-4 border-r border-teal-300 text-sm text-gray-700">
                  {lead.STATE}
                </td>
                <td className="py-3 px-4 border-r border-teal-300 text-sm text-gray-700">
                  {lead.LEAD_IP}
                </td>
                <td className="py-3 px-4 border-r border-teal-300 text-sm text-gray-700">
                  {lead.REMARKS}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => deleteLead(lead._id)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition duration-200"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleUpdateLead(lead)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition duration-200"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleOpenDialog(lead)}
                    className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition duration-200"
                  >
                    More
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Component */}
      {isModalOpen && dialogData && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white w-11/12 md:w-1/2 lg:w-1/3 p-8 rounded-xl shadow-xl transition-transform transform scale-100 hover:scale-105">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-teal-800">
                Lead Information
              </h2>
              <button
                onClick={handleCloseDialog}
                className="text-gray-500 hover:text-teal-600 transition duration-300"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-700">
                <strong>Student Name:</strong> {dialogData.STUDENT_NAME}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Age:</strong> {dialogData.STUDENT_AGE}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Gender:</strong> {dialogData.STUDENT_GENDER}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Preferred Courses:</strong>{" "}
                {dialogData.PREFERRED_COURSES.join(", ")}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Class Timing:</strong> {dialogData.CLASS_TIMING}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Contact Method:</strong> {dialogData.CONTACT_METHOD}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Special Requirements:</strong>{" "}
                {dialogData.SPECIAL_REQUIREMENTS}
              </p>
              <p className="text-sm text-gray-700">
                <strong>WhatsApp Status:</strong> {dialogData.WHATSAPP_STATUS}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseDialog}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsData;
