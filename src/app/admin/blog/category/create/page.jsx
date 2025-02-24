"use client";

import { useState } from "react";
import DashboardLayout from "../../../../admin_dashboard_layout/layout";
import axios from "axios";
import { toast } from "react-toastify";

export default function CreateCategory() {
  const [category, setCategory] = useState("");

  const handleCreateCategory = async () => {
    try {
      // Convert category to lowercase before sending
      const categoryToSend = category.toLowerCase();

      // Form data to send to the API
      const formData = new FormData();
      formData.append("category", categoryToSend);

      // Send the data to the backend API using axios
      const response = await axios.post("/api/blog/category/create", formData);

      if (response.status === 201) {
        toast.success("Category created successfully!");
      } else {
        toast.error("Failed to create category!");
      }
    } catch (error) {
      toast.error("Error creating category: " + error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 border rounded-lg bg-white shadow-md">
        {/* Category Input Field */}
        <div>
          <label htmlFor="category" className="block mb-1 font-medium">
            Category:
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter category name"
          />
        </div>

        {/* Create Category Button */}
        <button
          onClick={handleCreateCategory}
          className="w-full bg-teal-500 text-white rounded-md px-3 py-2 mt-4 hover:bg-teal-600 focus:outline-none"
        >
          Create Category
        </button>
      </div>
    </DashboardLayout>
  );
}
