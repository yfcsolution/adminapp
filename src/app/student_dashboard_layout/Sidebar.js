// src/app/dashboard/Sidebar.js
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaCalendarAlt,
  FaFileInvoice,
  FaHistory,
  FaCreditCard,
  FaTimes,
  FaBook,
} from "react-icons/fa";
import { useAuth } from "../common/auth-context";
import { useState } from "react";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { handleLogout } = useAuth();

  return (
    <aside
      className={`fixed z-20 top-0 h-full bg-white text-teal-900 rounded-br-3xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0 md:w-64 w-3/4 sm:w-80`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-around p-6  text-black rounded-tr-3xl">
          <Image
            src="/Images/Logo/updated-logo.webp"
            width={150}
            height={40}
            alt="IlmulQuran logo"
          />
          <button className="md:hidden text-2xl" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 px-4">
          <ul>
            <SidebarLink
              href="/student/dashboard"
              icon={<FaHome />}
              label="Dashboard"
            />
            <SidebarLink
              href="/student/class-schedule"
              icon={<FaCalendarAlt />}
              label="Class Schedule"
            />
            <SidebarLink
              href="/student/class-history"
              icon={<FaCalendarAlt />}
              label="Class History"
            />
            <SidebarLink
              href="/student/invoice-info"
              icon={<FaFileInvoice />}
              label="Invoice Information"
            />
            <SidebarLink
              href="/student/payment-history"
              icon={<FaHistory />}
              label="Payment History"
            />
            <SidebarLink
              href="/student/payment"
              icon={<FaCreditCard />}
              label="Make a Payment"
            />
            <SidebarLink
              href="/student/courses"
              icon={<FaBook />}
              label="Courses"
            />
          </ul>
        </nav>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, label }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li className="mb-3">
      <Link
        href={href}
        className={`flex items-center p-3 space-x-4 rounded-md transition-colors duration-200 ${
          isActive
            ? "bg-teal-600 text-white shadow-md"
            : "text-teal-800 hover:bg-teal-100 hover:text-teal-900"
        }`}
      >
        <div className="w-6 h-6 flex items-center justify-center">{icon}</div>
        <span className="text-base font-medium">{label}</span>
      </Link>
    </li>
  );
}
