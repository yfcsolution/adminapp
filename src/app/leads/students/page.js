"use client";
import React, { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { FaPlusCircle } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import LeadsAddInfoForm from "@/components/LeadsAddInfoForm";

const StudentsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchStudents = async () => {
    if (!id) return;
    try {
      const response = await axios.post("/api/leads/single-lead", { id });
      setStudents(response.data.data.STUDENTS.reverse());
    } catch (error) {
      console.error("Error fetching students data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      router.push("/");
      return;
    }
    fetchStudents();
  }, [id, router]);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-teal-600">All Students</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-700 transition duration-300"
        >
          <FaPlusCircle className="mr-2" /> Add New Student
        </button>
      </div>

      {loading ? (
        <div>Loading students...</div>
      ) : (
        <table className="min-w-full table-auto bg-white border-collapse border border-teal-600 rounded-lg">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="px-6 py-3 text-left">Student Name</th>
              <th className="px-6 py-3 text-left">Age</th>
              <th className="px-6 py-3 text-left">Gender</th>
              <th className="px-6 py-3 text-left">Courses</th>
              <th className="px-6 py-3 text-left">Class Timing</th>
              <th className="px-6 py-3 text-left">Contact Method</th>
              <th className="px-6 py-3 text-left">Contact Time</th>
              <th className="px-6 py-3 text-left">Special Requirements</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr key={index} className="border-b border-teal-100">
                <td className="px-6 py-4">{student.STUDENT_NAME}</td>
                <td className="px-6 py-4">{student.STUDENT_AGE}</td>
                <td className="px-6 py-4">{student.STUDENT_GENDER}</td>
                <td className="px-6 py-4">
                  {student.PREFERRED_COURSES.join(", ")}
                </td>
                <td className="px-6 py-4">{student.CLASS_TIMING}</td>
                <td className="px-6 py-4">{student.CONTACT_METHOD}</td>
                <td className="px-6 py-4">
                  {new Date(student.CONTACT_TIME).toLocaleString("en-US")}
                </td>
                <td className="px-6 py-4">{student.SPECIAL_REQUIREMENTS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="fixed z-50 inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
            >
              ✕
            </button>
            <LeadsAddInfoForm
              id={id}
              onSubmitSuccess={() => {
                setShowModal(false);
                fetchStudents();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default function StudentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentsPageContent />
    </Suspense>
  );
}
