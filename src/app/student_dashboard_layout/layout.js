// src/app/dashboard/layout.js
"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import stdAuth from "../common/stdAuth";
import { useAuth } from "../common/auth-context";
import axios from "axios";
function StudentDashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { studentInfo } = useAuth();
  useEffect(() => {
    const updateStudentData = async () => {
      try {
        // Check if update has already been sent today
        const lastUpdate = localStorage.getItem("lastStudentUpdate");
        const today = new Date().toISOString().split("T")[0]; // Get today's date as YYYY-MM-DD

        if (lastUpdate === today) {
          console.log("Update already sent today.");
          return;
        }

        // Send the update request
        const response = await axios.post("/api/student/oracle_data/update", {
          id: studentInfo?.id,
          userid: studentInfo?.userid,
        });

        if (response.status == 200) {
          localStorage.setItem("lastStudentUpdate", today);
        }

        // Store today's date in local storage
      } catch (error) {
        console.error(
          "Error updating data:",
          error.message,
          error.response?.data || error
        );
      }
    };

    // Only trigger the update if studentInfo exists
    if (studentInfo) {
      updateStudentData();
    }
  }, [studentInfo]); // Dependency ensures this runs when `studentInfo` changes

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-100 rounded-2xl custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

// Wrap DashboardLayout with withAuth HOC
export default stdAuth(StudentDashboardLayout);
