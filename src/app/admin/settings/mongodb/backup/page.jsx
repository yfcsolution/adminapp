"use client";
import { useState, useEffect } from "react";
import { FiRefreshCw, FiDownload, FiTrash2 } from "react-icons/fi";
import DashboardLayout from "./../../../../admin_dashboard_layout/layout";

export default function BackupManager() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backups/list");
      const data = await res.json();
      if (data.success) {
        setBackups(data.backups);
      } else {
        setError(data.error || "Failed to load backups");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async (fileId) => {
    if (!confirm("Are you sure? This will overwrite current data!")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/backups/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BACKUP_SECRET}`,
        },
        body: JSON.stringify({ fileId }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Database restored successfully");
      } else {
        setError(data.error || "Restoration failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Database Backups</h2>
          <button
            onClick={fetchBackups}
            disabled={loading}
            className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            {success}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(backup.createdTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={backup.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {backup.name}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => restoreBackup(backup.id)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      <FiDownload className="inline mr-1" /> Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
