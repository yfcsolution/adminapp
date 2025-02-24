"use client";

import { useEffect, useState,useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../../admin_dashboard_layout/layout";

const BlogList = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("blog"); // "blog" or "page"
  const router = useRouter();

  // Fetch data based on selectedType (either "blog" or "page")
  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = selectedType === "blog" ? "/api/blog/fetch" : "/api/page/fetch-all";
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not valid JSON");
        }
        const result = await response.json();
        setData(result.blogs || [] );
      } catch (err) {
        console.error(`Error fetching ${selectedType}s:`, err.message);
        setError(err.message);
      }
    };

    fetchData();
  }, [selectedType]);

  // Fetch categories for blogs
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/blog/category/fetch");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not valid JSON");
        }
        const result = await response.json();
        const extractedCategories = result.categories.map((cat) =>
          typeof cat === "object" ? cat.category : cat
        );
        setCategories([...extractedCategories]);
      } catch (err) {
        console.error("Error fetching categories:", err.message);
        setError(err.message);
      }
    };

    fetchCategories();
  }, []);

  const handleBlogClick = useCallback(
    (slug) => {
      router.push(`/admin/blog/edit/${slug}`);
    },
    [router]
  );

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date)
      ? "Invalid Date"
      : date.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
  };

  const filteredData =
    selectedCategory === "all"
      ? data
      : data.filter(
          (item) =>
            item.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800">
              All {selectedType === "blog" ? "Blogs" : "Pages"}
            </h1>
            <button
              onClick={() => router.push(`/admin/blog/create`)}
              className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition"
            >
              Create New {selectedType === "blog" ? "Blog" : "Page"}
            </button>
          </div>

          <div className="mb-6">
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="bg-white text-gray-700 p-2 rounded border border-gray-300 mr-4"
            >
              <option value="blog">Blogs</option>
              <option value="page">Pages</option>
            </select>

            {selectedType === "blog" && (
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="bg-white text-gray-700 p-2 rounded border border-gray-300"
              >
                <option value="all">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.length === 0 ? (
                <p className="text-center text-gray-500">
                  Loading {selectedType === "blog" ? "blogs" : "pages"}...
                </p>
              ) : (
                filteredData.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg cursor-pointer shadow-md hover:shadow-lg overflow-hidden transition-shadow"
                    onClick={() => handleBlogClick(item.slug)}
                  >
                    <img
                      src={item.image || "/default-image.jpg"}
                      alt={item.image_alt_text || `${selectedType === "blog" ? "Blog" : "Page"} Image`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-800">
                        {item.title}
                      </h2>
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-500">
                          {item.author || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlogList;
