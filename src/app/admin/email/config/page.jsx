"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardLayout from "../../../admin_dashboard_layout/layout";

export default function EmailConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [config, setConfig] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPassword: "",
    tlsRejectUnauthorized: false,
    isActive: true,
  });

  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/email/config");
        if (response.data.success && response.data.data) {
          setConfig(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load email config", error);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate required fields
      if (!config.smtpHost || !config.smtpUser || !config.smtpPassword) {
        toast.error("Please fill in all required fields (Host, User, Password)");
        return;
      }

      const response = await axios.post("/api/email/config", config);
      if (response.data.success) {
        toast.success("Email configuration saved successfully");
      }
    } catch (error) {
      console.error("Failed to save email config", error);
      toast.error(
        error.response?.data?.error || "Failed to save email configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    try {
      setTesting(true);
      const response = await axios.post("/api/email/config/test", {
        testEmail,
        config,
      });

      if (response.data.success) {
        toast.success("Test email sent successfully! Check your inbox.");
      } else {
        toast.error(response.data.error || "Failed to send test email");
      }
    } catch (error) {
      console.error("Failed to send test email", error);
      toast.error(
        error.response?.data?.error || "Failed to send test email"
      );
    } finally {
      setTesting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Email Configuration
        </h1>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host *
                </label>
                <input
                  type="text"
                  value={config.smtpHost}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, smtpHost: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="mail.example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port *
                </label>
                <input
                  type="number"
                  value={config.smtpPort}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      smtpPort: parseInt(e.target.value) || 587,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="587"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usually 587 (TLS) or 465 (SSL)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP User (Email) *
                </label>
                <input
                  type="email"
                  value={config.smtpUser}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, smtpUser: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="sender@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Password *
                </label>
                <input
                  type="password"
                  value={config.smtpPassword}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      smtpPassword: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Your email password"
                  required
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.smtpSecure}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      smtpSecure: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                Use SSL (check this if port is 465)
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.tlsRejectUnauthorized}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      tlsRejectUnauthorized: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                Reject unauthorized TLS certificates (enable in production)
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.isActive}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      isActive: e.target.checked,
                    }))
                  }
                  className="mr-2"
                />
                Active (use this configuration)
              </label>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <h3 className="font-semibold mb-2">Test Email Configuration</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="test@example.com"
                />
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {testing ? "Sending..." : "Send Test Email"}
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
