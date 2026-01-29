// src/app/dashboard/Navbar.js

import { useEffect, useState } from "react";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../common/auth-context";
import axios from "axios";
import { useRouter } from "next/navigation";
export default function Navbar({ toggleSidebar }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, getAdminData } = useAuth();
  const [adminName, setAdminName] = useState("");
  const router = useRouter();
  useEffect(() => {
    let isMounted = true;
    
    const getAdminData = async () => {
      try {
        const response = await axios.get("/api/admin-info", {
          withCredentials: true,
          timeout: 5000, // 5 second timeout for faster failure
        });

        if (isMounted && response.status === 200) {
          setAdminName(response.data.data?.firstname || "Admin");
        } else if (isMounted) {
          router.push("/admin/login");
        }
      } catch (error) {
        if (isMounted) {
          console.error("Failed to fetch admin data:", error);
          if (error.response?.status === 401 || error.code === "ECONNABORTED") {
            router.push("/admin/login");
          }
        }
      }
    };
    
    getAdminData();
    
    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <header className="bg-white p-4 flex items-center justify-between md:justify-start relative">
      {/* Sidebar Toggle Button for Mobile */}
      <button className="md:hidden p-2 text-gray-700" onClick={toggleSidebar}>
        <FaBars className="h-6 w-6" />
      </button>

      {/* Dashboard Title */}

      {/* User Info and Dropdown Menu */}
      <div className="flex items-center ml-auto space-x-4">
        <span className="text-gray-700 hidden md:block">
          Welcome{" "}
          {adminName
            ? adminName.charAt(0).toUpperCase() + adminName.slice(1)
            : "Admin"}
        </span>

        <div className="relative">
          {/* User Icon */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            <FaUserCircle className="h-8 w-8 text-teal-700" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
              <a className="block px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100 transition-colors duration-150">
                Profile
              </a>
              <a
                href="/admin/settings"
                className="block px-4 py-2 text-gray-800 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
              >
                Settings
              </a>
              <a
                onClick={handleLogout}
                className="block px-4 py-2 cursor-pointer text-red-600 hover:bg-gray-100 transition-colors duration-150"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
