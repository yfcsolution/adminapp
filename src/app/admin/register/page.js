"use client";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaEdit, FaTrash } from "react-icons/fa";
import DashboardLayout from "../../admin_dashboard_layout/layout";
import { toast } from "../../../components/ToastProvider";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role_id: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const router = useRouter();

  // Fetch users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/users/get");
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users.");
      }
    };
    fetchUsers();
  }, []);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get("/api/roles/get");
        setRoles(response.data.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
        toast.error("Failed to fetch roles.");
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        // Update user
        await axios.put(`/api/users/update/`, {
          user_id: editingUserId,
          ...formData,
        });
        toast.success("User updated successfully!");
      } else {
        // Register new user
        await axios.post("/api/users/register", formData);
        toast.success("User registered successfully!");
      }

      // Refresh users list
      const updatedUsers = await axios.get("/api/users/get");
      setUsers(updatedUsers.data.users);

      setShowForm(false);
      setEditMode(false);
      setEditingUserId(null);
      setFormData({ name: "", email: "", password: "", role_id: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  const handleEdit = (user) => {
    // setFormData({
    //   name: user.name,
    //   email: user.email,
    //   password: "",
    //   role_id: user.role_id,
    // });
    // setEditingUserId(user._id);
    // setEditMode(true);
    // setShowForm(true);
  };

  const handleDelete = async (id) => {
    // try {
    //   await axios.delete(`/api/users/delete/`, {
    //     data: { user_id: id },
    //   });
    //   setUsers(users.filter((user) => user._id !== id)); // Remove user from UI
    //   toast.success("User deleted successfully!");
    // } catch (error) {
    //   toast.error("Failed to delete user. Try again.");
    // }
  };

  return (
    <>
      <title>ilmulQuran User Management</title>
      <DashboardLayout>
        <div className="p-6">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditMode(false);
              setEditingUserId(null);
              setFormData({ name: "", email: "", password: "", role_id: "" });
            }}
            className="mb-4 px-4 py-2 bg-teal-600 text-white rounded-md shadow-md hover:bg-teal-700 transition"
          >
            {showForm ? "Close Form" : "Add New User"}
          </button>

          {showForm && (
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-teal-200 mb-6">
              <h2 className="text-2xl font-semibold text-teal-600 text-center mb-4">
                {editMode ? "Edit User" : "Register User"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-teal-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">-- Select Role --</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  {editMode ? "Update User" : "Register"}
                </button>
              </form>
            </div>
          )}

          <div className="bg-white shadow-lg rounded-lg p-4 border">
            <h2 className="text-xl font-semibold text-teal-700 mb-4">
              Registered Users
            </h2>
            <table className="w-full border-collapse border border-teal-300">
              <thead>
                <tr className="bg-teal-600 text-white">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="text-center">
                      <td className="p-2 border">{user.name}</td>
                      <td className="p-2 border">{user.email}</td>
                      <td className="p-2 border">
                        {user.role_name || "Unknown"}
                      </td>
                      <td className="p-2 border flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
