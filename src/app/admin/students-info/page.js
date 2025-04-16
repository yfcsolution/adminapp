"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../admin_dashboard_layout/layout";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Link from "next/link";

const StudentsData = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [visibleFields, setVisibleFields] = useState({});
  const [passwordInput, setPasswordInput] = useState("");
  const [selectedField, setSelectedField] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchStudentsData = async (page) => {
    try {
      const response = await axios.get(`/api/fetch-stds-info?page=${page}`, {
        withCredentials: true,
      });
      setStudentsData(response.data?.studentInfo);
      setTotalPages(response.data?.pagination.totalPages);
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to fetch student data.");
    }
  };

  useEffect(() => {
    fetchStudentsData(currentPage);
  }, [currentPage]);

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const openPasswordModal = (userId, field) => {
    setSelectedLeadId(userId);
    setSelectedField(field);
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = () => {
    fetchContacts(selectedLeadId, selectedField, passwordInput);
    setShowPasswordModal(false);
    setPasswordInput("");
  };

  const toggleVisibility = (leadId, field) => {
    if (!visibleFields[leadId]?.[field]) {
      openPasswordModal(leadId, field);
    } else {
      setVisibleFields((prev) => ({
        ...prev,
        [leadId]: {
          ...prev[leadId],
          [field]: !prev[leadId][field],
        },
      }));
    }
  };

  const fetchContacts = async (userId, field, password) => {
    try {
      const response = await axios.post("/api/fetch-stds-info/contacts", {
        id: userId,
        [field]: true,
        CONTACT_SECRETE: password,
      });
      const data = response.data.data;
      setVisibleFields((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [field]: data[field] || "N/A",
        },
      }));
      toast.success(`${field} fetched successfully.`);
    } catch (error) {
      console.error(`Error fetching ${field}`, error);
      toast.error(`Failed to fetch ${field}.`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Invoice link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy invoice link");
      });
  };

  const handleSelectChange = (event, _id, userid) => {
    const action = event.target.value;

    if (action === "payment") {
      const urlParams = new URLSearchParams();
      urlParams.append("_id", _id);
      urlParams.append("userid", userid);
      router.push(`/admin/student-payment?${urlParams.toString()}`);
    } else if (action === "invoice") {
      const invoiceLink = `http://localhost:3000/student/invoice/${_id}`;
      copyToClipboard(invoiceLink);
      // Reset the select value
      event.target.value = "";
    }
  };

  return (
    <>
      <title>ilmulQuran Student Info</title>

      <DashboardLayout>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Leads Data
          </h2>
          <div className="flex justify-between items-center mb-6">
            <label className="ml-4">
              <Link
                href="/admin/students-info/search"
                className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 font-semibold text-lg transition-colors duration-300 ease-in-out cursor-pointer shadow-md hover:shadow-lg"
              >
                Search Students
              </Link>
            </label>
          </div>
          {showPasswordModal && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg p-6 w-80 sm:w-96 md:w-1/3">
                <h3 className="text-lg font-semibold text-center mb-4">
                  Enter code
                </h3>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full border border-teal-500 rounded-lg p-2 mb-4"
                  placeholder="Enter code"
                  autoComplete="off"
                />
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handlePasswordSubmit}
                    className="bg-teal-600 text-white p-2 rounded-lg"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="bg-gray-300 text-gray-700 p-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Responsive Card Layout for Mobile and Tablet */}
          <div className="block md:hidden">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {studentsData.map((student, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl"
                >
                  <div className="border-t border-gray-300 pt-2">
                    <p className="text-gray-700">
                      <strong>Id:</strong> {student.id}
                    </p>
                    <p className="text-gray-700">
                      <strong>User Id:</strong> {student.userid}
                    </p>
                    <p className="text-gray-700">
                      <strong>Name:</strong>{" "}
                      {`${student.firstname} ${student.lastname}`}
                    </p>
                    <p className="text-gray-700">
                      <strong>Email:</strong>{" "}
                      {visibleFields[student.id]?.email || "***********"}
                      <button
                        onClick={() => toggleVisibility(student.id, "email")}
                        className="ml-2"
                      >
                        {visibleFields[student.id]?.email ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    </p>
                    <p className="text-gray-700">
                      <strong>Phone:</strong>{" "}
                      {visibleFields[student.id]?.phonenumber || "***********"}
                      <button
                        onClick={() =>
                          toggleVisibility(student.id, "phonenumber")
                        }
                        className="ml-2"
                      >
                        {visibleFields[student.id]?.phonenumber ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Layout for Large Screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-200">
                <tr className="text-left">
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Id
                  </th>
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    User Id
                  </th>
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Name
                  </th>
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Email
                  </th>
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Phone
                  </th>
                  <th className="py-3 px-2 md:px-4 border border-gray-300 text-sm font-bold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentsData.map((student, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">
                      {student.id}
                    </td>
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">
                      {student.userid}
                    </td>
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">{`${student.firstname} ${student.lastname}`}</td>
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">
                      {visibleFields[student.id]?.email || "***********"}
                      <button
                        onClick={() => toggleVisibility(student.id, "email")}
                        className="ml-2"
                      >
                        {visibleFields[student.id]?.email ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    </td>
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">
                      {visibleFields[student.id]?.phonenumber || "***********"}
                      <button
                        onClick={() =>
                          toggleVisibility(student.id, "phonenumber")
                        }
                        className="ml-2"
                      >
                        {visibleFields[student.id]?.phonenumber ? (
                          <FaEyeSlash />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                    </td>
                    <td className="py-2 px-2 md:px-4 border border-gray-300 text-sm text-gray-700">
                      <div className="flex space-x-2">
                        <select
                          onChange={(e) =>
                            handleSelectChange(e, student._id, student.userid)
                          }
                          className="p-2 w-full border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Select Action</option>
                          <option value="payment" className="text-green-600">
                            Make Payment
                          </option>
                          <option value="invoice" className="text-green-600">
                            Copy Payment Link
                          </option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between mt-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-500 text-white rounded-md disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="self-center text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-500 text-white rounded-md disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentsData;
