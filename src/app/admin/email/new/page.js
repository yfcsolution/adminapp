"use client";
import EmailComposer from "@/components/EmailComposer";
import DashboardLayout from "../../admin_dashboard_layout/layout";

export default function NewEmailPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <EmailComposer />
      </div>
    </DashboardLayout>
  );
}
