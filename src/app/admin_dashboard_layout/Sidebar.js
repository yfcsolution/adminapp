"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FaHome,
  FaCreditCard,
  FaUserPlus,
  FaDatabase,
  FaUsers,
  FaListAlt,
  FaUserShield,
  FaWhatsapp,
  FaEdit,
  FaEnvelope,
  FaCog,
  FaChevronDown,
  FaChevronRight,
  FaFileAlt,
  FaSearch,
  FaHistory,
  FaServer,
  FaKey,
  FaLock,
  FaShieldAlt,
  FaPaperPlane,
  FaInbox,
  FaAddressBook,
  FaChartLine,
} from "react-icons/fa";
import { useAuth } from "../common/auth-context";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { handleLogout } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    whatsapp: false,
    email: false,
    leads: false,
    settings: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside
      className={`fixed z-20 top-0 h-full bg-gradient-to-b from-teal-50 to-white text-teal-900 shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0 md:w-72 w-64`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
          <div className="flex items-center space-x-3">
            <Image
              src="/Images/Logo/updated-logo.webp"
              width={120}
              height={30}
              alt="ilmulQuran logo"
              className="object-contain"
            />
          </div>
          <button
            className="md:hidden text-white text-2xl hover:text-teal-200 transition-colors"
            onClick={toggleSidebar}
          >
            ×
          </button>
        </div>

        {/* Navigation Links with scrolling */}
        <nav className="mt-2 px-3 flex-1 overflow-y-auto custom-scrollbar pb-4">
          <ul className="space-y-1">
            {/* Dashboard */}
            <SidebarLink
              href="/admin/dashboard"
              icon={<FaHome />}
              label="Dashboard"
              exact
            />

            {/* Leads Section */}
            <MenuSection
              label="Leads Management"
              icon={<FaListAlt />}
              isExpanded={expandedSections.leads}
              onToggle={() => toggleSection("leads")}
            >
              <SidebarLink
                href="/admin/leads1/leads-data"
                icon={<FaListAlt />}
                label="All Leads"
                indent
              />
              <SidebarLink
                href="/admin/leads1/search-leads"
                icon={<FaSearch />}
                label="Search Leads"
                indent
              />
              <SidebarLink
                href="/admin/leads1/duplicate"
                icon={<FaFileAlt />}
                label="Duplicate Leads"
                indent
              />
              <SidebarLink
                href="/admin/leads1/update"
                icon={<FaEdit />}
                label="Update Lead"
                indent
              />
            </MenuSection>

            {/* Contacts */}
            <SidebarLink
              href="/admin/students-info"
              icon={<FaUsers />}
              label="Family Contacts"
            />


            {/* WhatsApp Section */}
            <MenuSection
              label="WhatsApp"
              icon={<FaWhatsapp />}
              isExpanded={expandedSections.whatsapp}
              onToggle={() => toggleSection("whatsapp")}
            >
              <SidebarLink
                href="/admin/conversations/whatsapp/chat"
                icon={<FaInbox />}
                label="Conversations"
                indent
              />
              <SidebarLink
                href="/admin/conversations/whatsapp/chat/unknown"
                icon={<FaUserShield />}
                label="Unknown Contacts"
                indent
              />
              <SidebarLink
                href="/admin/conversations/whatsapp/new"
                icon={<FaPaperPlane />}
                label="New Conversation"
                indent
              />
              <SidebarLink
                href="/admin/whatsapp/templates"
                icon={<FaFileAlt />}
                label="Templates"
                indent
              />
              <SidebarLink
                href="/admin/whatsapp/config"
                icon={<FaCog />}
                label="Configuration"
                indent
              />
              <SidebarLink
                href="/admin/whatsapp/logs"
                icon={<FaHistory />}
                label="Message Logs"
                indent
              />
              <SidebarLink
                href="/admin/baileys"
                icon={<FaWhatsapp />}
                label="Baileys"
                indent
              />
            </MenuSection>

            {/* Email Section */}
            <MenuSection
              label="Email"
              icon={<FaEnvelope />}
              isExpanded={expandedSections.email}
              onToggle={() => toggleSection("email")}
            >
              <SidebarLink
                href="/admin/email"
                icon={<FaInbox />}
                label="Email Inbox"
                indent
              />
              <SidebarLink
                href="/admin/email/new"
                icon={<FaPaperPlane />}
                label="Compose Email"
                indent
              />
              <SidebarLink
                href="/admin/conversations/emails/get"
                icon={<FaHistory />}
                label="Email Conversations"
                indent
              />
              <SidebarLink
                href="/admin/email-template/data"
                icon={<FaFileAlt />}
                label="Email Templates"
                indent
              />
              <SidebarLink
                href="/admin/email-template/create"
                icon={<FaEdit />}
                label="Create Template"
                indent
              />
              <SidebarLink
                href="/admin/email/config"
                icon={<FaCog />}
                label="Email Configuration"
                indent
              />
              <SidebarLink
                href="/admin/email/logs"
                icon={<FaHistory />}
                label="Email Logs"
                indent
              />
            </MenuSection>


            {/* Login Attempts */}
            <MenuSection
              label="Security"
              icon={<FaShieldAlt />}
              isExpanded={expandedSections.settings}
              onToggle={() => toggleSection("settings")}
            >
              <SidebarLink
                href="/admin/login/details/staff"
                icon={<FaUserShield />}
                label="Staff Login Attempts"
                indent
              />
              <SidebarLink
                href="/admin/login/details/student"
                icon={<FaUserShield />}
                label="Student Login Attempts"
                indent
              />
            </MenuSection>

            {/* User Management */}
            <SidebarLink
              href="/admin/register"
              icon={<FaUserPlus />}
              label="Register User"
            />


            {/* Settings Section */}
            <MenuSection
              label="Settings"
              icon={<FaCog />}
              isExpanded={expandedSections.settings}
              onToggle={() => toggleSection("settings")}
            >
              <SidebarLink
                href="/admin/settings"
                icon={<FaCog />}
                label="General Settings"
                indent
              />
              <SidebarLink
                href="/admin/settings/change-password"
                icon={<FaLock />}
                label="Change Password"
                indent
              />
              <SidebarLink
                href="/admin/settings/roles"
                icon={<FaUserShield />}
                label="Roles Management"
                indent
              />
              <SidebarLink
                href="/admin/settings/payments"
                icon={<FaCreditCard />}
                label="Payment Settings"
                indent
              />
              <SidebarLink
                href="/admin/settings/payments/invoice/footer-info"
                icon={<FaFileAlt />}
                label="Invoice Footer"
                indent
              />
              <SidebarLink
                href="/admin/settings/secret-code/add"
                icon={<FaKey />}
                label="Add Secret Code"
                indent
              />
              <SidebarLink
                href="/admin/settings/secret-code/update"
                icon={<FaKey />}
                label="Update Secret Code"
                indent
              />
              <SidebarLink
                href="/admin/settings/mongodb/backup"
                icon={<FaServer />}
                label="Database Backup"
                indent
              />
            </MenuSection>
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-teal-200 bg-teal-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 font-medium"
          >
            <FaEdit />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ href, icon, label, indent = false, exact = false }) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname.startsWith(href) && href !== "/admin/dashboard";

  return (
    <li className={`${indent ? "ml-6" : ""}`}>
      <Link
        href={href}
        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
          isActive
            ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md"
            : "text-teal-800 hover:bg-teal-100 hover:text-teal-900"
        }`}
      >
        <div
          className={`w-5 h-5 flex items-center justify-center ${
            isActive ? "text-white" : "text-teal-600 group-hover:text-teal-700"
          }`}
        >
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
}

function MenuSection({ label, icon, isExpanded, onToggle, children }) {
  return (
    <li className="mb-1">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-teal-800 hover:bg-teal-100 transition-colors duration-200 group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 flex items-center justify-center text-teal-600 group-hover:text-teal-700">
            {icon}
          </div>
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <div className="text-teal-600 group-hover:text-teal-700">
          {isExpanded ? (
            <FaChevronDown className="w-3 h-3" />
          ) : (
            <FaChevronRight className="w-3 h-3" />
          )}
        </div>
      </button>
      {isExpanded && (
        <ul className="mt-1 space-y-1 animate-fadeIn">{children}</ul>
      )}
    </li>
  );
}
