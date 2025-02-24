"use client";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useAuth } from "@/app/common/auth-context";
import { toast } from "../../../components/ToastProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const { accessToken, setAccessToken } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role_id: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get("/api/roles/get");
        setRoles(response.data.data || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "role_id" ? parseInt(e.target.value) : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("form data is", formData);

      const response = await axios.post("/api/login", formData);

      setAccessToken(response.data.accessToken);

      toast.success("Login successful!", {
        autoClose: 3000,
        closeOnClick: true,
        closeButton: true,
      });

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Please check your credentials and try again.";
      toast.error(errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <title>ilmulQuran Login</title>
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-r from-teal-100 via-teal-50 to-teal-100 font-poppins">
        <div className="bg-white shadow-2xl rounded-lg p-8 max-w-md w-full border border-teal-300">
          <div className="flex justify-center mb-6">
            <img
              src="/Images/Logo/updated-logo.webp"
              alt="Logo"
              className="w-52 h-24 object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold text-teal-600 text-center mb-8 tracking-wide">
            ilmulQuran Login
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-teal-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div>
              <label
                htmlFor="role_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select Role
              </label>
              <select
                name="role_id"
                id="role_id"
                value={formData.role_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="" disabled>
                  Select a role
                </option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-300 shadow-lg"
            >
              Login
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link
              className="text-teal-600 hover:text-teal-700 text-sm"
              href="/admin/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
