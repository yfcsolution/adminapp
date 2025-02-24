import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  FaBlog,
  FaCalendarAlt, // Icon for Class Schedule
} from "react-icons/fa";
import { useAuth } from "../common/auth-context";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { handleLogout } = useAuth();
  return (
    <aside
      className={`fixed z-20 top-0 h-full bg-white text-teal-900 rounded-tr-3xl  transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0 md:w-64 w-40`} 
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-center px-2 py-4 text-white rounded-tr-3xl">
          <Image
            src="/Images/Logo/updated-logo.webp"
            width={130}
            height={30}
            alt="ilmulQuran logo"
          />
          <button
            className="md:hidden text-black text-2xl"
            onClick={toggleSidebar}
          >
            ×
          </button>
        </div>

        {/* Navigation Links with scrolling */}
        <nav className="mt-6 px-4 flex-1 overflow-y-auto custom-scrollbar">
          <ul>
            <SidebarLink
              href="/admin/dashboard"
              icon={<FaHome />}
              label="Home"
            />
            <SidebarLink
              href="/admin/leads1/leads-data"
              icon={<FaListAlt />}
              label="Leads"
            />
            <SidebarLink
              href="/admin/students-info"
              icon={<FaUsers />}
              label="Family Contacts"
            />
            <SidebarLink
              href="/admin/class-schedule"
              icon={<FaCalendarAlt />}
              label="Classes"
            />
            <SidebarLink
              href="/admin/student-payment/data"
              icon={<FaCreditCard />}
              label="Payments"
            />
            <SidebarLink
              href="/admin/conversations/whatsapp/chat"
              icon={<FaWhatsapp />}
              label="Whatsapp"
            />
            <SidebarLink
              href="/admin/blog/fetch"
              icon={<FaBlog />}
              label="Blog"
            />
            <li className="mb-3 relative group">
              <div className="flex items-center p-3 space-x-4 rounded-md transition-colors duration-200 cursor-pointer text-teal-800 hover:bg-teal-100 hover:text-teal-900">
                <div className="w-6 h-6 flex items-center justify-center">
                  <FaUserShield />
                </div>
                <span className="text-base font-medium">Login Attempts</span>
              </div>
              <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-md rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto z-10">
                <Link
                  href="/admin/login/details/staff"
                  className="block px-4 py-2 hover:bg-teal-100"
                >
                  Staff Login Attempts
                </Link>
                <Link
                  href="/admin/login/details/student"
                  className="block px-4 py-2 hover:bg-teal-100"
                >
                  Student Login Attempts
                </Link>
              </div>
            </li>

            <SidebarLink
              href="/admin/contact/leads"
              icon={<FaEnvelope />}
              label="Email Service"
            />
            <SidebarLink
              href="/admin/email-template/data"
              icon={<FaEnvelope />}
              label="Email Template"
            />
            <SidebarLink
              href="/admin/register"
              icon={<FaUserPlus />}
              label="Register"
            />
            <SidebarLink
              href="/admin/courses/get-data"
              icon={<FaDatabase />}
              label="Courses"
            />
            <SidebarLink
              href="/admin/settings"
              icon={<FaEdit />}
              label="Settings"
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
        className={`flex items-center p-2 space-x-2 rounded-md transition-colors duration-200 ${
          isActive
            ? "bg-teal-600 text-white shadow-md"
            : "text-teal-800 hover:bg-teal-100 hover:text-teal-900"
        }`}
      >
        <div className="w-4 h-6 flex items-center justify-center">{icon}</div>
        <span className="text-base font-medium">{label}</span>
      </Link>
    </li>
  );
}
