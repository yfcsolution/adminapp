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
    setError("");
    try {
      const res = await fetch("/api/backups/list", {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_BACKUP_SECRET}`,
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

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

  const restoreBackup = async (fileId, fileName) => {
    if (
      !confirm(
        `Are you sure you want to restore ${fileName}? This will overwrite current data!`
      )
    )
      return;

    setLoading(true);
    setError("");
    setSuccess("");
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
        setSuccess(
          `Successfully restored ${data.restoredCollections.length} collections with ${data.totalDocuments} total documents`
        );
      } else {
        setError(data.error || "Restoration failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      fetchBackups(); // Refresh the list after restoration
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 10000);
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
          <div className="flex gap-2">
            <button
              onClick={fetchBackups}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
            <p className="font-bold">Success</p>
            <p>{success}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          {backups.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              No backups found
            </div>
          ) : (
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
                    Size
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
                    <td className="px-6 py-4">
                      <a
                        href={backup.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {backup.name}
                      </a>
                      {backup.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {backup.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {backup.size
                        ? `${Math.round(backup.size / 1024)} KB`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => restoreBackup(backup.id, backup.name)}
                        disabled={loading}
                        className="flex items-center text-green-600 hover:text-green-900 mr-4 disabled:opacity-50"
                        title="Restore this backup"
                      >
                        <FiDownload className="mr-1" /> Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {loading && backups.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading backups...</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
