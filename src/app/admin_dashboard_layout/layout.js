"use client";
import { useState, useEffect } from "react"; // Added useEffect import
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import withAuth from "../common/withAuth";
import axios from "axios";
import { useRouter } from "next/navigation";

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getAdminData = async () => {
      const response = await axios.get("/api/admin-info", {
        withCredentials: true,
      });
      if (response.status !== 200) {
        router.push("/admin/login");
      }
    };
    getAdminData();
  }, []);

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
        <main className="flex-1 p-6 overflow-y-auto rounded-tl-xl bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
// Wrap DashboardLayout with withAuth HOC
export default withAuth(DashboardLayout);
