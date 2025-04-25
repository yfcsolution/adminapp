import EmailComposer from "@/components/EmailComposer";
import EmailInbox from "@/components/EmailInbox";
import DashboardLayout from "../../admin_dashboard_layout/layout";

export default function Dashboard() {
  return (
    <main>
      <DashboardLayout>
        <h1>Email Dashboard</h1>
        <EmailComposer />
        <EmailInbox />
      </DashboardLayout>
    </main>
  );
}
