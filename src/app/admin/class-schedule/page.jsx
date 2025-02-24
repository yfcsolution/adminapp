"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardLayout from "../../admin_dashboard_layout/layout";

const StudentClassSchedule = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [userId, setUserId] = useState(""); // Store the input userId
  const [searchResult, setSearchResult] = useState([]); // Store the filtered data based on search

  useEffect(() => {
    fetchClassesSchedule(); // Fetch default data when the component mounts
  }, []);

  const fetchClassesSchedule = async (searchUserId = "") => {
    try {
      let url = "/api/student/class-schedule/data"; // Default API for all data

      if (searchUserId) {
        // Use search API if userId is provided
        url = `/api/student/class-schedule/search?userId=${searchUserId}`;
      }

      // Make the request
      const response = await axios.get(url);
      console.log("Class Schedule Response:", response.data);

      if (searchUserId) {
        // If userId is provided, update searchResult
        setSearchResult(response.data?.students || []);
      } else {
        // Otherwise, update studentsData with the default data
        setStudentsData(response.data?.students || []);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Data not found...");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (userId) {
      fetchClassesSchedule(userId); // Fetch data for the specific userId
    } else {
      fetchClassesSchedule(); // Fetch all data if no userId is entered
    }
  };

  return (
    <DashboardLayout>
      <div className="overflow-x-auto p-4">
        {/* Title with professional style */}
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Student Class Schedule
        </h2>

        {/* Search functionality */}
        <div className="mb-6 text-center">
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter User ID"
            className="p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleSearch}
            className="ml-4 p-2 bg-teal-600 text-white rounded"
          >
            Search
          </button>
        </div>

        {/* Table for large screens */}
        <div className="hidden lg:block">
          <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                  Student ID
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                  Registration Date
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                  Course Name
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                  Teacher
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                  Supervisor
                </th>
                <th className="py-3 px-4 text-left text-sm font-medium text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {(searchResult.length > 0 ? searchResult : studentsData).map(
                (student, index) =>
                  student.class_schedule.length > 0 &&
                  student.class_schedule.map((schedule, i) => (
                    <tr
                      key={`${index}-${i}`}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-3 px-4 border text-sm text-gray-700">
                        {schedule.student_id}
                      </td>
                      <td className="py-3 px-4 border text-sm text-gray-700">
                        {schedule.student_name}
                      </td>
                      <td className="py-3 px-4 border text-sm text-gray-700">
                        {new Date(
                          schedule.registration_date
                        ).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 border text-sm text-gray-700">
                        {schedule.course_name}
                      </td>
                      <td className="py-3 px-4 border text-sm text-gray-700">
                        {schedule.teacher_name}
                      </td>
                      <td className="py-3 px-4 border text-sm text-gray-700">
                        {schedule.supervisor_name}
                      </td>
                      <td className="py-3 px-4 border text-sm text-gray-700">
                        {schedule.class_status}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        {/* Card layout for mobile screens */}
        <div className="lg:hidden">
          {(searchResult.length > 0 ? searchResult : studentsData).map(
            (student, index) =>
              student.class_schedule.length > 0 &&
              student.class_schedule.map((schedule, i) => (
                <div
                  key={`${index}-${i}`}
                  className="bg-white shadow-lg rounded-lg mb-4 p-4"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {schedule.student_name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Student ID:</strong> {schedule.student_id}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Registration Date:</strong>{" "}
                    {new Date(schedule.registration_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Course Name:</strong> {schedule.course_name}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Teacher:</strong> {schedule.teacher_name}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Supervisor:</strong> {schedule.supervisor_name}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Status:</strong> {schedule.class_status}
                  </p>
                </div>
              ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentClassSchedule;
