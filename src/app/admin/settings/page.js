"use client";
import { useState } from "react";
import {
  FaLock,
  FaKey,
  FaEdit,
  FaQuestionCircle,
  FaUnlock,
  FaUsers,
  FaChevronDown,
  FaCreditCard,
  FaFileInvoice,
  FaDatabase,
} from "react-icons/fa";
import Link from "next/link";
import DashboardLayout from "../../admin_dashboard_layout/layout";
import { toast } from "react-toastify";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("changePassword");
  const [openGroup, setOpenGroup] = useState(null);

  const toggleGroup = (groupName) => {
    setOpenGroup(openGroup === groupName ? null : groupName);
  };

  const settingsGroups = [
    {
      name: "password",
      title: "Password",
      icon: <FaLock />,
      items: [
        {
          title: "Change Password",
          tab: "changePassword",
          href: "/admin/settings/change-password",
        },
      ],
    },
    {
      name: "secretCode",
      title: "Secret Code",
      icon: <FaKey />,
      items: [
        {
          title: "Add Secret Code",
          tab: "addSecretCode",
          href: "/admin/settings/secret-code/add",
        },
        {
          title: "Update Secret Code",
          tab: "updateSecretCode",
          href: "/admin/settings/secret-code/update",
        },
        {
          title: "Forgot Secret Code",
          tab: "forgotSecretCode",
          href: "/admin/settings/secret-code/forgot",
        },
      ],
    },
    {
      name: "payments",
      title: "Payments",
      icon: <FaQuestionCircle />,
      items: [
        {
          title: "Payment Modes",
          tab: "paymentModes",
          href: "/admin/settings/payments",
          icon: <FaCreditCard className="mr-2" />,
        },
        {
          title: "Invoice Footer",
          tab: "invoices",
          href: "/admin/settings/payments/invoice/footer-info",
          icon: <FaFileInvoice className="mr-2" />,
        },
      ],
    },
    {
      name: "roles",
      title: "Roles",
      icon: <FaUsers />,
      items: [
        {
          title: "Roles",
          tab: "roles",
          href: "/admin/settings/roles",
        },
      ],
    },
    {
      name: "mongodb",
      title: "MongoDB",
      icon: <FaDatabase />,
      items: [
        {
          title: "Backup",
          tab: "mongodbBackup",
          href: "/admin/settings/mongodb/backup",
        },
      ],
    },
  ];

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

        {/* Grouped Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {settingsGroups.map((group) => (
            <div key={group.name} className="relative group">
              {group.items.length === 1 ? (
                <Link href={group.items[0].href} passHref>
                  <button
                    className={`flex items-center space-x-3 px-6 py-3 rounded-lg text-base font-medium transition duration-300 ${
                      activeTab === group.items[0].tab
                        ? "bg-teal-600 text-white shadow-xl"
                        : "text-teal-800 hover:bg-teal-100 hover:text-teal-900"
                    }`}
                    onClick={() => setActiveTab(group.items[0].tab)}
                  >
                    <div className="w-6 h-6">{group.icon}</div>
                    <span className="font-medium">{group.title}</span>
                  </button>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => toggleGroup(group.name)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-lg text-base font-medium transition duration-300 ${
                      group.items.some((item) => item.tab === activeTab)
                        ? "bg-teal-600 text-white shadow-xl"
                        : "text-teal-800 hover:bg-teal-100 hover:text-teal-900"
                    }`}
                  >
                    <div className="w-6 h-6">{group.icon}</div>
                    <span className="font-medium">{group.title}</span>
                    <FaChevronDown
                      className={`transition-transform duration-200 ${
                        openGroup === group.name ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 ${
                      openGroup === group.name
                        ? "opacity-100 visible"
                        : "opacity-0 invisible"
                    }`}
                  >
                    {group.items.map((item) => (
                      <Link href={item.href} passHref key={item.tab}>
                        <div
                          className={`flex items-center px-6 py-3 cursor-pointer transition duration-200 ${
                            activeTab === item.tab
                              ? "bg-teal-100 text-teal-900"
                              : "hover:bg-gray-100 text-gray-800"
                          }`}
                          onClick={() => setActiveTab(item.tab)}
                        >
                          {item.icon && (
                            <span className="mr-3">{item.icon}</span>
                          )}
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Content based on active tab */}
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-300">
          <h2 className="text-2xl font-semibold text-teal-800 mb-4">
            {activeTab === "changePassword" && "Change Your Password"}
            {activeTab === "addSecretCode" && "Add a New Secret Code"}
            {activeTab === "updateSecretCode" && "Update Your Secret Code"}
            {activeTab === "forgotSecretCode" && "Forgot Your Secret Code?"}
            {activeTab === "payments" && "Payment Settings"}
            {activeTab === "paymentModes" && "Payment Modes"}
            {activeTab === "invoices" && "Invoice Management"}
            {activeTab === "roles" && "Manage User Roles"}
            {activeTab === "mongodbBackup" && "MongoDB Backup"}
          </h2>
          <p className="text-teal-700">
            {activeTab === "changePassword" &&
              "Here you can change your password."}
            {activeTab === "addSecretCode" &&
              "Add a new secret code for added security."}
            {activeTab === "updateSecretCode" &&
              "Update your existing secret code."}
            {activeTab === "forgotSecretCode" &&
              "Reset your forgotten secret code."}
            {activeTab === "payments" &&
              "Manage your payment methods and settings."}
            {activeTab === "paymentModes" &&
              "Configure available payment methods and options."}
            {activeTab === "invoices" && "View and manage all invoice records."}
            {activeTab === "roles" && "Assign and manage user roles."}
            {activeTab === "mongodbBackup" &&
              "Manage your MongoDB database backups."}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
