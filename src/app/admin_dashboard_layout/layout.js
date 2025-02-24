// src/app/dashboard/layout.js
"use client";
import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import withAuth from '../common/withAuth';

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  return (
    <div className="flex h-screen  overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto  rounded-tl-xl  bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}

// Wrap DashboardLayout with withAuth HOC
export default withAuth(DashboardLayout);
