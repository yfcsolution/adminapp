"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
const CoursesData = () => {
  const [coursesData, setCoursesData] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseData, setCourseData] = useState({
    COURSE_ID_PK: "",
    COURSE_CATEGORY_ID_FK: "",
    COURSE_NAME: "",
    COURSE_SHORT_NAME: "",
    STATUS: "",
    LANGUAGE_ID: "",
    COURSE_FEE: "",
    COURSE_DURATION: "",
    USER_FILE_NAME: "",
    INTERNAL_FILE_NAME: "",
    CREATED_BY: "",
    CREATED_DATE: "",
    UPDATED_BY: "",
    UPDATED_DATE: "",
    COURSE_GENDER: "",
    SORTING: "",
    COURSE_ADDED: false,
    IMAGE_LINK: "",
    COURSE_DESCRIPTION: "",
    CLASS_START_DATE: "",
    COURSE_STATUS: "",
  });

  // Fetch all courses on mount
  const fetchCoursesData = async () => {
    try {
      const response = await axios.get("/api/courses/get-all-courses");
      setCoursesData(response.data.courses);
      setFilteredCourses(response.data.courses); // Show all courses initially
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch courses data.");
    }
  };

  useEffect(() => {
    fetchCoursesData();
  }, []);

  // Update the filtered courses based on selected filter
  const handleFilterChange = (category) => {
    setFilter(category);
    if (category === "all") {
      setFilteredCourses(coursesData); // Show all courses
    } else {
      const categoryId = {
        islamic: 2,
        science: 1,
        language: 3,
      }[category];
      setFilteredCourses(
        coursesData.filter(
          (course) => course.COURSE_CATEGORY_ID_FK === categoryId
        )
      );
    }
  };

  // Open/Close Modal
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData({
      ...courseData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Submit Course Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/courses/insertData", courseData);
      toast.success("Course added successfully!");
      setIsModalOpen(false); // Close the modal on success
      fetchCoursesData(); // Refresh course list
      setCourseData({}); // Clear the form
      fetchCoursesData();
    } catch (error) {
      toast.error("Failed to add course.");
      console.error("Error adding course:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 bg-white border border-teal-600 rounded-lg max-w-6xl mx-auto">
        {/* Header with Title and Add New Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-semibold text-teal-800">Courses</h2>
          {/* Add New Course Button */}
          <button
            onClick={toggleModal}
            className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-teal-700 transition duration-300"
          >
            <FaPlus className="mr-2" />
            Add New
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-4 justify-center mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="categoryFilter"
              value="all"
              checked={filter === "all"}
              onChange={() => handleFilterChange("all")}
              className="mr-2 accent-teal-600"
            />
            All
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="categoryFilter"
              value="islamic"
              checked={filter === "islamic"}
              onChange={() => handleFilterChange("islamic")}
              className="mr-2 accent-teal-600"
            />
            Islamic Courses
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="categoryFilter"
              value="science"
              checked={filter === "science"}
              onChange={() => handleFilterChange("science")}
              className="mr-2 accent-teal-600"
            />
            Science Courses
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="categoryFilter"
              value="language"
              checked={filter === "language"}
              onChange={() => handleFilterChange("language")}
              className="mr-2 accent-teal-600"
            />
            Language Courses
          </label>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white border border-teal-500">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="py-4 px-6 text-left font-semibold text-sm md:text-base">
                  Course ID
                </th>
                <th className="py-4 px-6 text-left font-semibold text-sm md:text-base">
                  Category ID
                </th>
                <th className="py-4 px-6 text-left font-semibold text-sm md:text-base">
                  Course Name
                </th>
                <th className="py-4 px-6 text-left font-semibold text-sm md:text-base">
                  Status
                </th>
                <th className="py-4 px-6 text-left font-semibold text-sm md:text-base">
                  Created By
                </th>
                <th className="py-4 px-6 text-left font-semibold text-sm md:text-base">
                  Gender
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr
                  key={course.COURSE_ID_PK}
                  className="border-b hover:bg-teal-50 transition-colors duration-200"
                >
                  <td className="py-4 px-6 text-sm md:text-base text-gray-700">
                    {course.COURSE_ID_PK}
                  </td>
                  <td className="py-4 px-6 text-sm md:text-base text-gray-700">
                    {course.COURSE_CATEGORY_ID_FK}
                  </td>
                  <td className="py-4 px-6 text-sm md:text-base text-gray-700">
                    {course.COURSE_NAME}
                  </td>
                  <td className="py-4 px-6 text-sm md:text-base text-gray-700">
                    {course.STATUS}
                  </td>
                  <td className="py-4 px-6 text-sm md:text-base text-gray-700">
                    {course.CREATED_BY}
                  </td>
                  <td className="py-4 px-6 text-sm md:text-base text-gray-700">
                    {course.COURSE_GENDER}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-11/12 md:w-9/12 lg:w-8/12 xl:w-7/12 max-h-[90vh] overflow-y-auto p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-teal-800 mb-4">
                Add New Course
              </h3>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Form Fields */}
                <input
                  type="number"
                  name="COURSE_ID_PK"
                  placeholder="Course ID"
                  value={courseData.COURSE_ID_PK}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="number"
                  name="COURSE_CATEGORY_ID_FK"
                  placeholder="Category ID"
                  value={courseData.COURSE_CATEGORY_ID_FK}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  name="COURSE_NAME"
                  placeholder="Course Name"
                  value={courseData.COURSE_NAME}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  name="COURSE_SHORT_NAME"
                  placeholder="Course Short Name"
                  value={courseData.COURSE_SHORT_NAME}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="STATUS"
                  placeholder="Status"
                  value={courseData.STATUS}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  name="LANGUAGE_ID"
                  placeholder="Language ID"
                  value={courseData.LANGUAGE_ID}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  name="COURSE_FEE"
                  placeholder="Course Fee"
                  value={courseData.COURSE_FEE}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="COURSE_DURATION"
                  placeholder="Course Duration"
                  value={courseData.COURSE_DURATION}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="USER_FILE_NAME"
                  placeholder="User File Name"
                  value={courseData.USER_FILE_NAME}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="INTERNAL_FILE_NAME"
                  placeholder="Internal File Name"
                  value={courseData.INTERNAL_FILE_NAME}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="CREATED_BY"
                  placeholder="Created By"
                  value={courseData.CREATED_BY}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="date"
                  name="CREATED_DATE"
                  placeholder="Created Date"
                  value={courseData.CREATED_DATE}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="UPDATED_BY"
                  placeholder="Updated By"
                  value={courseData.UPDATED_BY}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="date"
                  name="UPDATED_DATE"
                  placeholder="Updated Date"
                  value={courseData.UPDATED_DATE}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="COURSE_GENDER"
                  placeholder="Course Gender"
                  value={courseData.COURSE_GENDER}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="number"
                  name="SORTING"
                  placeholder="Sorting"
                  value={courseData.SORTING}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="COURSE_ADDED"
                    checked={courseData.COURSE_ADDED}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label>Course Added</label>
                </div>
                <input
                  type="text"
                  name="IMAGE_LINK"
                  placeholder="Image Link"
                  value={courseData.IMAGE_LINK}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <textarea
                  name="COURSE_DESCRIPTION"
                  placeholder="Course Description"
                  value={courseData.COURSE_DESCRIPTION}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                ></textarea>
                <input
                  type="date"
                  name="CLASS_START_DATE"
                  placeholder="Class Start Date"
                  value={courseData.CLASS_START_DATE}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  name="COURSE_STATUS"
                  placeholder="Course Status"
                  value={courseData.COURSE_STATUS}
                  onChange={handleChange}
                  className="p-2 border border-gray-300 rounded"
                />

                {/* Submit and Cancel Buttons */}
                <button
                  type="submit"
                  className="col-span-2 bg-teal-600 text-white py-2 px-4 rounded mt-4 hover:bg-teal-700 transition"
                >
                  Add Course
                </button>
                <button
                  type="button"
                  onClick={toggleModal}
                  className="col-span-2 bg-gray-300 text-gray-800 py-2 px-4 rounded mt-4 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoursesData;
