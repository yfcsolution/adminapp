"use client";
import { useState } from "react";
import {
  FaLock,
  FaKey,
  FaEdit,
  FaQuestionCircle,
  FaUnlock,
  FaUsers,
} from "react-icons/fa"; // Added FaUsers icon for Roles
import Link from "next/link";
import DashboardLayout from "../../admin_dashboard_layout/layout";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("changePassword"); // default active tab

  return (
    <DashboardLayout>
      <div className="container mx-auto px-6 py-12">
        {/* Settings Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-teal-900 mb-2">
            Admin Settings
          </h1>
          <p className="text-lg text-teal-600">
            Manage your account, security settings, and payment methods.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-6 justify-center mb-12">
          <Link href="/admin/settings/change-password" passHref>
            <Tab
              title="Change Password"
              icon={<FaLock />}
              isActive={activeTab === "changePassword"}
              onClick={() => setActiveTab("changePassword")}
            />
          </Link>
          <Link href="/admin/settings/secret-code/add" passHref>
            <Tab
              title="Add Secret Code"
              icon={<FaKey />}
              isActive={activeTab === "addSecretCode"}
              onClick={() => setActiveTab("addSecretCode")}
            />
          </Link>
          <Link href="/admin/settings/secret-code/update" passHref>
            <Tab
              title="Update Secret Code"
              icon={<FaEdit />}
              isActive={activeTab === "updateSecretCode"}
              onClick={() => setActiveTab("updateSecretCode")}
            />
          </Link>
          <Link href="/admin/settings/secret-code/forgot" passHref>
            <Tab
              title="Forgot Secret Code"
              icon={<FaUnlock />}
              isActive={activeTab === "forgotSecretCode"}
              onClick={() => setActiveTab("forgotSecretCode")}
            />
          </Link>
          <Link href="/admin/settings/payments" passHref>
            <Tab
              title="Manage Payments"
              icon={<FaQuestionCircle />}
              isActive={activeTab === "payments"}
              onClick={() => setActiveTab("payments")}
            />
          </Link>
          <Link href="/admin/settings/roles" passHref>
            <Tab
              title="Roles"
              icon={<FaUsers />}
              isActive={activeTab === "roles"}
              onClick={() => setActiveTab("roles")}
            />
          </Link>
        </div>

        {/* Content based on active tab */}
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-300">
          <h2 className="text-2xl font-semibold text-teal-800 mb-4">
            {activeTab === "changePassword" && "Change Your Password"}
            {activeTab === "addSecretCode" && "Add a New Secret Code"}
            {activeTab === "updateSecretCode" && "Update Your Secret Code"}
            {activeTab === "forgotSecretCode" && "Forgot Your Secret Code?"}
            {activeTab === "payments" && "Manage Payment Methods"}
            {activeTab === "roles" && "Manage User Roles"}
          </h2>
          <p className="text-teal-700">
            {activeTab === "changePassword" && "Here you can change your password."}
            {activeTab === "addSecretCode" && "Add a new secret code for added security."}
            {activeTab === "updateSecretCode" && "Update your existing secret code."}
            {activeTab === "forgotSecretCode" && "Reset your forgotten secret code."}
            {activeTab === "payments" && "Manage your payment methods and settings."}
            {activeTab === "roles" && "Assign and manage user roles."}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Tab Component
const Tab = ({ title, icon, isActive, onClick }) => {
  return (
    <button
      className={`flex items-center space-x-3 px-6 py-3 rounded-lg text-base font-medium transition duration-300 ${
        isActive
          ? "bg-teal-600 text-white shadow-xl"
          : "text-teal-800 hover:bg-teal-100 hover:text-teal-900"
      }`}
      onClick={onClick}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="font-medium">{title}</span>
    </button>
  );
};
