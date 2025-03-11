"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const LeadsStudents = ({ leadId }) => {
  const [leadsData, setLeadsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!leadId) {
      router.push(`/admin/leads1/leads-data/profile/${leadId}`);
    } else {
      (async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/leads/single-lead", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ leadId }),
          });

          const data = await response.json();
          console.log("the data fetched is", data);

          if (response.ok) {
            setLeadsData(data.data.STUDENTS || []);
          } else {
            console.error("Error fetching leads:", data.error);
            setLeadsData([]);
          }
        } catch (error) {
          console.error("Error:", error);
          setLeadsData([]);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [leadId]);

  // Function to format dates in a human-readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-4 sm:p-10">
      <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl border border-gray-200 p-6 sm:p-10">
        {leadsData.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadsData.map((lead, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-6"
              >
                {/* Student Name */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {lead.STUDENT_NAME || "N/A"}
                </h3>

                {/* Gender */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Gender
                  </p>
                  <p className="text-sm text-teal-700 font-medium">
                    {lead.STUDENT_GENDER || "N/A"}
                  </p>
                </div>

                {/* Age */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Age
                  </p>
                  <p className="text-sm text-teal-700 font-medium">
                    {lead.STUDENT_AGE || "N/A"}
                  </p>
                </div>

                {/* Contact Time */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Contact Time
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {formatDate(lead.CONTACT_TIME) || "N/A"}
                  </p>
                </div>

                {/* Contact Method */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Contact Method
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {lead.CONTACT_METHOD || "N/A"}
                  </p>
                </div>

                {/* Class Timing */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Class Timing (Minutes)
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {lead.CLASS_TIMING || "N/A"}
                  </p>
                </div>

                {/* Special Requirements */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Special Requirements
                  </p>
                  <p className="text-sm text-gray-900 font-medium">
                    {lead.SPECIAL_REQUIREMENTS || "None"}
                  </p>
                </div>

                {/* Preferred Courses */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Preferred Courses
                  </p>
                  <ul className="text-sm text-gray-900 font-medium list-disc ml-5">
                    {Array.isArray(lead.PREFERRED_COURSES) &&
                    lead.PREFERRED_COURSES.length > 0 ? (
                      lead.PREFERRED_COURSES.map((course, idx) => (
                        <li key={idx}>{course}</li>
                      ))
                    ) : (
                      <li>No courses selected</li>
                    )}
                  </ul>
                </div>

                {/* Synced Status */}
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Synced
                  </p>
                  <p
                    className={`text-sm font-medium ${
                      lead.SYNCED ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {lead.SYNCED ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No student leads found.</p>
        )}
      </div>
    </div>
  );
};

export default LeadsStudents;
