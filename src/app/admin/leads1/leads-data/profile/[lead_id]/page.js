"use client";
import React, { useState } from "react";
import DashboardLayout from "../../../../../admin_dashboard_layout/layout";
import { useParams } from "next/navigation";
import Reminders from "@/components/Reminders";
import Notices from "@/components/Notices";
const Page = () => {
  const [activeSection, setActiveSection] = useState("Reminders");
  const { lead_id } = useParams(); // Extract lead_id from URL params
  const data = {
    Reminders: [
      "Meeting at 10 AM",
      "Submit report by Friday",
      "Doctor appointment",
    ],
    Notices: ["Office closed on Friday", "New company policy updated"],
  };
  return (
    <DashboardLayout>
      <div className="p-5">
        <div className="flex space-x-4 mb-5">
          {["Reminders", "Notices"].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-md text-white ${
                activeSection === section ? "bg-teal-600" : "bg-teal-400"
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        {activeSection === "Reminders" && (
          <Reminders data={data} leadId={lead_id} />
        )}
        {activeSection === "Notices" && (
          <Notices data={data} leadId={lead_id} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Page;
