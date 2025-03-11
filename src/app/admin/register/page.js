"use client";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaEdit, FaTrash } from "react-icons/fa";
import DashboardLayout from "../../admin_dashboard_layout/layout";
import { toast } from "../../../components/ToastProvider";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    staffid: "",
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    phonenumber: "",
    role_id: "",
    secreteCode: "",
    canViewSensitiveData: false,
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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

      setShowModal(false); // Close modal after submission
      setEditMode(false);
      setEditingUserId(null);
      setFormData({
        staffid: "",
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        phonenumber: "",
        role_id: "",
        secreteCode: "",
        canViewSensitiveData: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      staffid: user.staffid,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phonenumber: user.phonenumber,
      role_id: user.role_id,
      secreteCode: "", // Empty by default for update form
      canViewSensitiveData: user.canViewSensitiveData || false,
    });
    setEditingUserId(user._id);
    setEditMode(true);
    setShowModal(true); // Open modal in edit mode
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
              setShowModal(true); // Open modal
              setEditMode(false);
              setEditingUserId(null);
              setFormData({
                staffid: "",
                firstname: "",
                lastname: "",
                email: "",
                password: "",
                phonenumber: "",
                role_id: "",
                secreteCode: "",
                canViewSensitiveData: false,
              });
            }}
            className="mb-4 px-4 py-2 bg-teal-600 text-white rounded-md shadow-md hover:bg-teal-700 transition"
          >
            Add New User
          </button>

          {/* Modal for Register/Edit User */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white shadow-lg rounded-2xl p-6 border border-teal-200 w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-semibold text-teal-600 text-center mb-4">
                  {editMode ? "Edit User" : "Register User"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Staff ID
                      </label>
                      <input
                        type="number"
                        name="staffid"
                        placeholder="Staff ID"
                        value={formData.staffid}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstname"
                        placeholder="First Name"
                        value={formData.firstname}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastname"
                        placeholder="Last Name"
                        value={formData.lastname}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    {editMode ? (
                      ""
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Password
                        </label>
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
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phonenumber"
                        placeholder="Phone Number"
                        value={formData.phonenumber}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Secrete Code
                      </label>
                      <input
                        type="text"
                        name="secreteCode"
                        placeholder="Secrete Code"
                        value={formData.secreteCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div className="flex items-center col-span-2">
                      <input
                        type="checkbox"
                        name="canViewSensitiveData"
                        checked={formData.canViewSensitiveData}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Can View Sensitive Data
                      </label>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
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
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                  >
                    {editMode ? "Update User" : "Register"}
                  </button>
                </form>
                <button
                  onClick={() => setShowModal(false)} // Close modal
                  className="mt-4 w-full py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="bg-white shadow-lg rounded-lg p-4 border">
            <h2 className="text-xl font-semibold text-teal-700 mb-4">
              Registered Users
            </h2>
            <table className="w-full border-collapse border border-teal-300">
              <thead>
                <tr className="bg-teal-600 text-white">
                  <th className="p-2 border">Staff ID</th>
                  <th className="p-2 border">First Name</th>
                  <th className="p-2 border">Last Name</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Phone Number</th>
                  <th className="p-2 border">Role</th>
                  <th className="p-2 border">Can View Sensitive Data</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="text-center">
                      <td className="p-2 border">{user.staffid}</td>
                      <td className="p-2 border">{user.firstname}</td>
                      <td className="p-2 border">{user.lastname}</td>
                      <td className="p-2 border">{user.email}</td>
                      <td className="p-2 border">{user.phonenumber}</td>
                      <td className="p-2 border">
                        {user.role_name || "Unknown"}
                      </td>
                      <td className="p-2 border">
                        {user.canViewSensitiveData ? "Yes" : "No"}
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
                    <td colSpan="9" className="p-4 text-center text-gray-500">
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