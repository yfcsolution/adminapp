"use client";
import { Suspense } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../../admin_dashboard_layout/layout";

// UpdateLeadPage component
const UpdateLeadPage = () => {
  const searchParams = useSearchParams(); // This replaces router.query
  const [leadId, setLeadId] = useState(null);
  const [leadData, setLeadData] = useState(null); // To store the fetched lead data
  const [formData, setFormData] = useState({}); // To handle form data
  const router = useRouter();

  // Function to fetch the lead data by ID
  const getSingleLeadData = async () => {
    try {
      const response = await axios.post("/api/leads/single-lead", {
        id: leadId,
      });
      setLeadData(response.data.data); // Store the fetched lead data
      setFormData(response.data.data); // Pre-fill the form with fetched data
    } catch (error) {
      console.error("Error fetching lead data:", error);
    }
  };

  // When the `leadId` changes, call getSingleLeadData to fetch the lead's details
  useEffect(() => {
    const id = searchParams.get("id"); // Retrieve the 'id' query parameter
    if (id) {
      setLeadId(id); // Set the leadId state with the query parameter value
    }
  }, [searchParams]); // Re-run when searchParams change

  // Fetch the lead data if leadId is available
  useEffect(() => {
    if (leadId) {
      getSingleLeadData(); // Call the function to fetch the lead data
    }
  }, [leadId]); // Only run when leadId is set or updated

  // Handle input changes for editable fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
      id: leadId,
    }));
  };

  // Handle form submission (update the lead)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("/api/leads/update", formData);
      console.log(response);
      toast.success("Lead updated successfully!");
      setTimeout(() => {
        router.push("/admin/leads1/leads-data");
      }, 3000);
    } catch (error) {
      console.error("Error updating lead data:", error);
      alert("Failed to update lead.");
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <h2 className="text-3xl font-semibold text-center text-teal-600 mb-6">
            Update Lead
          </h2>

          {/* Display the fetched lead data in editable form */}
          {leadData ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="FULL_NAME"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="FULL_NAME"
                    name="FULL_NAME"
                    value={formData.FULL_NAME || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Full Name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="EMAIL"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="EMAIL"
                    name="EMAIL"
                    value={formData.EMAIL || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Email"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="PHONE_NO"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="PHONE_NO"
                    name="PHONE_NO"
                    value={formData.PHONE_NO || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Phone Number"
                  />
                </div>

                {/* Remarks */}
                <div>
                  <label
                    htmlFor="REMARKS"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Remarks
                  </label>
                  <textarea
                    id="REMARKS"
                    name="REMARKS"
                    value={formData.REMARKS || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Remarks"
                  />
                </div>

                {/* Country */}
                <div>
                  <label
                    htmlFor="COUNTRY"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="COUNTRY"
                    name="COUNTRY"
                    value={formData.COUNTRY || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Country"
                  />
                </div>

                {/* State */}
                <div>
                  <label
                    htmlFor="STATE"
                    className="block text-sm font-medium text-gray-700"
                  >
                    State
                  </label>
                  <input
                    type="text"
                    id="STATE"
                    name="STATE"
                    value={formData.STATE || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter State"
                  />
                </div>

                {/* Lead IP */}
                <div>
                  <label
                    htmlFor="LEAD_IP"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Lead IP
                  </label>
                  <input
                    type="text"
                    id="LEAD_IP"
                    name="LEAD_IP"
                    value={formData.LEAD_IP || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Lead IP"
                  />
                </div>

                {/* Request Form */}
                <div>
                  <label
                    htmlFor="REQUEST_FORM"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Request Form
                  </label>
                  <input
                    type="text"
                    id="REQUEST_FORM"
                    name="REQUEST_FORM"
                    value={formData.REQUEST_FORM || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Request Form"
                  />
                </div>

                {/* Contact Method */}
                <div>
                  <label
                    htmlFor="CONTACT_METHOD"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contact Method
                  </label>
                  <input
                    type="text"
                    id="CONTACT_METHOD"
                    name="CONTACT_METHOD"
                    value={formData.CONTACT_METHOD || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Contact Method"
                  />
                </div>

                {/* Student Name */}
                <div>
                  <label
                    htmlFor="STUDENT_NAME"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Student Name
                  </label>
                  <input
                    type="text"
                    id="STUDENT_NAME"
                    name="STUDENT_NAME"
                    value={formData.STUDENT_NAME || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Student Name"
                  />
                </div>

                {/* Student Gender */}
                <div>
                  <label
                    htmlFor="STUDENT_GENDER"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Student Gender
                  </label>
                  <input
                    type="text"
                    id="STUDENT_GENDER"
                    name="STUDENT_GENDER"
                    value={formData.STUDENT_GENDER || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Student Gender"
                  />
                </div>

                {/* Student Age */}
                <div>
                  <label
                    htmlFor="STUDENT_AGE"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Student Age
                  </label>
                  <input
                    type="number"
                    id="STUDENT_AGE"
                    name="STUDENT_AGE"
                    value={formData.STUDENT_AGE || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Student Age"
                  />
                </div>

                {/* Preferred Courses */}
                <div>
                  <label
                    htmlFor="PREFERRED_COURSES"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Preferred Courses
                  </label>
                  <input
                    type="text"
                    id="PREFERRED_COURSES"
                    name="PREFERRED_COURSES"
                    value={formData.PREFERRED_COURSES || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Preferred Courses"
                  />
                </div>

                {/* Class Timing */}
                <div>
                  <label
                    htmlFor="CLASS_TIMING"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Class Timing
                  </label>
                  <input
                    type="text"
                    id="CLASS_TIMING"
                    name="CLASS_TIMING"
                    value={formData.CLASS_TIMING || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Class Timing"
                  />
                </div>

                {/* Special Requirements */}
                <div>
                  <label
                    htmlFor="SPECIAL_REQUIREMENTS"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Special Requirements
                  </label>
                  <input
                    type="text"
                    id="SPECIAL_REQUIREMENTS"
                    name="SPECIAL_REQUIREMENTS"
                    value={formData.SPECIAL_REQUIREMENTS || ""}
                    onChange={handleInputChange}
                    className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter Special Requirements"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="mt-6 w-full py-3 px-6 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
                >
                  Update Lead
                </button>
              </div>
            </form>
          ) : (
            <p>Loading lead data...</p> // If lead data is not fetched yet
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Wrapping the UpdateLeadPage component in Suspense to handle async loading
const UpdateLeadPageWithSuspense = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdateLeadPage />
    </Suspense>
  );
};

export default UpdateLeadPageWithSuspense;
