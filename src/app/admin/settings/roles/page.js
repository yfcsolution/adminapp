"use client";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Roles = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [roleId, setRoleId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get("/api/roles/get");
        setRoles(response.data.data);
      } catch (error) {
        toast.error("Failed to fetch roles. Try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleAddOrUpdateRole = async () => {
    if (!roleId.trim() || !roleName.trim()) {
      toast.error("Both Role ID and Role Name are required.");
      return;
    }

    const roleData = {
      role_id: parseInt(roleId, 10),
      role_name: roleName,
    };

    try {
      if (isEditMode) {
        await axios.patch(`/api/roles/update`, roleData); // Sending data in body
        setRoles(
          roles.map((role) =>
            role.role_id === parseInt(roleId, 10) ? roleData : role
          )
        );
        toast.success("Role updated successfully!");
      } else {
        await axios.post("/api/roles/add", roleData);
        setRoles([...roles, roleData]);
        toast.success("Role added successfully!");
      }

      setIsModalOpen(false);
      setRoleId("");
      setRoleName("");
      setIsEditMode(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Operation failed. Try again."
      );
    }
  };

  const handleEditRole = (role) => {
    setRoleId(role.role_id.toString());
    setRoleName(role.role_name);
    setIsEditMode(true);
    setIsModalOpen(true);
  };
  // Function to handle deleting a role
  const handleDeleteRole = async (id) => {
    // try {
    //   await axios.delete(`/api/roles/delete/`, {
    //     data: { role_id: id }, // Send role_id in the body
    //   });
    //   setRoles(roles.filter((role) => role.role_id !== id)); // Remove role from UI
    //   toast.success("Role deleted successfully!");
    // } catch (error) {
    //   toast.error("Failed to delete role. Try again.");
    // }
  };

  return (
    <DashboardLayout>
      <div className="p-6 flex flex-col items-center">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="w-full max-w-2xl flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-teal-700">Manage Roles</h2>
          <button
            onClick={() => {
              setIsModalOpen(true);
              setIsEditMode(false);
              setRoleId("");
              setRoleName("");
            }}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
          >
            <FaPlus /> Add New
          </button>
        </div>

        <div className="w-full max-w-2xl">
          {loading ? (
            <p className="text-teal-700 text-center">Loading roles...</p>
          ) : (
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Role ID</th>
                  <th className="py-3 px-4 text-left">Role Name</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <tr
                      key={role.role_id}
                      className="border-b hover:bg-teal-50"
                    >
                      <td className="py-3 px-4">{role.role_id}</td>
                      <td className="py-3 px-4">{role.role_name}</td>
                      <td className="py-3 px-4 flex gap-5">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="text-blue-600 hover:underline"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteRole(role.role_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-600">
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h3 className="text-lg font-semibold mb-4">
                {isEditMode ? "Update Role" : "Add New Role"}
              </h3>

              <label className="block text-sm font-medium text-gray-700">
                Role ID
              </label>
              <input
                type="number"
                placeholder="Enter Role ID"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={isEditMode}
              />

              <label className="block text-sm font-medium text-gray-700">
                Role Name
              </label>
              <input
                type="text"
                placeholder="Enter Role Name"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOrUpdateRole}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
                >
                  {isEditMode ? "Update Role" : "Add Role"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Roles;
