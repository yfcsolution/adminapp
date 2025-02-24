import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
const LeadsAddInfoForm = ({ id, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    LEAD_ID: "",
    EMAIL: "",
    PHONE_NO: "",
    CONTACT_TIME: "",
    CONTACT_METHOD: "",
    STUDENT_NAME: "",
    STUDENT_GENDER: "",
    STUDENT_AGE: "",
    PREFERRED_COURSES: [],
    CLASS_TIMING: "",
    SPECIAL_REQUIREMENTS: "",
  });

  const [courses, setCourses] = useState([]);
  const [showCourses, setShowCourses] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const handleMessage = async (data) => {
    try {
      // Send message asynchronously
      await axios.post("/api/second-response", data);
      console.log("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await axios.post("/api/leads/single-lead", { id });
        setFormData((prevData) => ({
          ...prevData,
          EMAIL: response.data.data.EMAIL || "",
          PHONE_NO: response.data.data.PHONE_NO || "",
          LEAD_ID: response.data.data.LEAD_ID || "",
        }));
      } catch (error) {
        console.error("Error fetching lead data", error);
      }
    };

    if (id) fetchLead();
  }, [id]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("/api/courses/get-data");
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCourseSelection = (courseName) => {
    setFormData((prevData) => {
      const isSelected = prevData.PREFERRED_COURSES.includes(courseName);
      return {
        ...prevData,
        PREFERRED_COURSES: isSelected
          ? prevData.PREFERRED_COURSES.filter((c) => c !== courseName)
          : [...prevData.PREFERRED_COURSES, courseName],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Form data:", formData);

      const response = await axios.post("/api/leads-additional-info", {
        id,
        ...formData,
      });

      // ✅ Call `handleMessage` in the background without blocking the main request
      setTimeout(() => handleMessage(response.data.updatedData), 0); // Non-blocking execution
      router.push(`/leads/students?id=${id}`);
      // console.log("Success:", response.data);
      // ✅ Close the modal after successful submission
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      alert.error("Failed to update lead.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-teal-600 text-center">
        To ensure the best learning experience, please share a few more
        preferences below.
      </h2>
      <form
        className="mt-8 text-left max-w-[90%] md:max-w-[70%] mx-auto"
        onSubmit={handleSubmit}
      >
        {/* Email & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2  gap-4 ">
          <div>
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              name="EMAIL"
              className="w-full p-3 border rounded-md"
              value={formData.EMAIL}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Phone</label>
            <input
              type="tel"
              name="PHONE_NO"
              className="w-full p-3 border rounded-md"
              value={formData.PHONE_NO}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2  gap-4 mt-4">
          {/* Contact Time */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Preferred Contact Time
            </label>
            <input
              type="datetime-local"
              name="CONTACT_TIME"
              className="w-full p-3 border rounded-md"
              value={formData.CONTACT_TIME}
              onChange={handleInputChange}
            />
          </div>

          {/* Contact Method */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Preferred Contact Method
            </label>
            <select
              name="CONTACT_METHOD"
              className="w-full p-3 border rounded-md"
              value={formData.CONTACT_METHOD}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Phone Call">Phone Call</option>
              <option value="Email">Email</option>
            </select>
          </div>
        </div>

        {/* Student Info */}
        <div className="grid grid-cols-1 md:grid-cols-2  gap-4 mt-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Student Name
            </label>
            <input
              type="text"
              name="STUDENT_NAME"
              className="w-full p-3 border rounded-md"
              value={formData.STUDENT_NAME}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Student Gender
            </label>
            <select
              name="STUDENT_GENDER"
              className="w-full p-3 border rounded-md"
              value={formData.STUDENT_GENDER}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2  gap-4 mt-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Student Age
            </label>
            <input
              type="text"
              name="STUDENT_AGE"
              className="w-full p-3 border rounded-md"
              value={formData.STUDENT_AGE}
              onChange={handleInputChange}
            />
          </div>
          {/* Class Timing */}
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Class Timing
            </label>
            <select
              name="CLASS_TIMING"
              className="w-full p-3 border rounded-md"
              value={formData.CLASS_TIMING}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>

          {/* Special Requirements */}
        </div>
        <div className="mt-4">
          <label className="text-sm font-semibold text-gray-700">
            Special Requirements
          </label>
          <textarea
            name="SPECIAL_REQUIREMENTS"
            className="w-full p-3 border rounded-md"
            rows="1"
            value={formData.SPECIAL_REQUIREMENTS}
            onChange={handleInputChange}
          />
        </div>
        {/* Preferred Courses */}
        <div className="mt-4">
          <label className="text-sm font-semibold text-gray-700">
            Preferred Courses
          </label>
          <button
            type="button"
            onClick={() => setShowCourses(!showCourses)}
            className="w-full border text-gray-700 p-3 rounded-md"
          >
            {showCourses ? "Hide Courses" : "Select Courses"}
          </button>

          {showCourses && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {courses.map((course) => (
                <label key={course.COURSE_NAME} className="flex items-center">
                  <input
                    type="checkbox"
                    value={course.COURSE_NAME}
                    checked={formData.PREFERRED_COURSES.includes(
                      course.COURSE_NAME
                    )}
                    onChange={() => handleCourseSelection(course.COURSE_NAME)}
                    className="w-4 h-4"
                  />
                  <span>{course.COURSE_NAME}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-teal-500 text-white p-3 rounded-md w-full mt-4"
        >
          {loading ? "Updating..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default LeadsAddInfoForm;
