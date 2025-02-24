"use client";
import React from "react";
import DashboardLayout from "../../admin_dashboard_layout/layout";

const HomePage = () => {
  return (
    <DashboardLayout>
      <div className="p-8 rounded-lg max-w-6xl mx-auto ">
        <h2 className="text-6xl font-bold text-black mb-6 text-center drop-shadow-lg">
          بسم الله الرحمن الرحيم
        </h2>
      </div>
    </DashboardLayout>
  );
};

export default HomePage;
