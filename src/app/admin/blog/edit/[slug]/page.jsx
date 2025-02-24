"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../../../admin_dashboard_layout/layout";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
export default function BlogDetail({ params }) {
  const { slug } = params;
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState([]); // To store fetched categories
  const router = useRouter();
  useEffect(() => {
    // Fetch categories from the API
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/blog/category/fetch");
        if (response.status === 200) {
          setCategories(response.data.categories); // Set categories from the API response
        } else {
          toast.error("Failed to fetch categories");
        }
      } catch (error) {
        toast.error("Error fetching categories: " + error.message);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setBlog({ ...blog, category: selectedCategory });
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.post("/api/blog/single-blog", { slug });

        if (response.status === 200) {
          setBlog(response.data.blog);
        } else {
          setError("Blog not found.");
        }
      } catch (err) {
        setError("Failed to fetch the blog details.");
      }
    };
    fetchBlog();
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date)
      ? "Invalid Date"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };
  const handleAuthorChange = (e) => {
    setBlog({ ...blog, author: e.target.value }); // Update the author in state
  };
  const renderVideo = () => {
    if (blog?.["video"]) {
      const videoId = extractVideoId(blog["video"]);
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return (
          <div className="mb-6">
            <iframe
              src={embedUrl}
              title="Blog Video"
              className="w-full h-64 md:h-96"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      }
    }
    return null;
  };

  const extractVideoId = (url) => {
    const regex =
      /(?:https?:\/\/(?:www\.)?youtube\.com(?:\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=))|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("id", blog._id);
      formData.append("title", blog.title);
      formData.append("slug", blog.slug);
      formData.append("image", newImage || blog.image);
      formData.append("image_alt_text", blog.image_alt_text);
      formData.append("video", blog.video);
      formData.append("video_position", blog.video_position);
      formData.append("category", blog.category);
      formData.append("author", blog.author); // Ensure this field is updated properly
      formData.append("content", blog.content);
      formData.append("isPage", blog.isPage);
      formData.append("meta_description", blog.meta_description);
      formData.append("meta_keywords", JSON.stringify(blog.meta_keywords));
      formData.append("tags", JSON.stringify(blog.tags));

      const response = await axios.post("/api/blog/edit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Blog updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update blog.");
      }
    } catch (err) {
      console.error("Error saving blog:", err);
      toast.error("An error occurred while saving the blog.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const formData = new FormData();
      formData.append("id", blog._id);

      const response = await axios.post("/api/blog/delete", formData);

      if (response.status === 200) {
        toast.success("Blog deleted successfully!");
        setIsDeleting(false);
        router.push("/admin/blog/fetch");
      } else {
        toast.error("Failed to delete blog.");
      }
    } catch (err) {
      console.error("Error deleting blog:", err);
      toast.error("An error occurred while deleting the blog.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
    }
  };

  const handleSlugChange = (e) => {
    const newSlug = e.target.value
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .toLowerCase(); // Ensure the slug is lowercase
    setBlog({ ...blog, slug: newSlug });
  };

  const handleVideoChange = (e) => {
    const videoUrl = e.target.value;
    setBlog({ ...blog, video: videoUrl });
  };

  const handleFieldChange = (field, value) => {
    setBlog({ ...blog, [field]: value });
  };

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-teal-50">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-teal-50">
        <p className="text-gray-500 text-lg">Loading blog details...</p>
      </div>
    );
  }

  return (
    <>
      <DashboardLayout>
        <head>
          <title>{`${blog?.title || ""} | ilmulQuran Online Academy`}</title>
          <meta
            name="description"
            content={`${blog?.meta_description || ""}`}
          />
          <meta
            name="keywords"
            content={`${blog?.meta_keywords?.join(", ") || ""}`}
          />
          <link
            rel="canonical"
            href={`https://ilmulquran.com/blog/${blog?.slug}`}
          />
          <meta
            property="og:title"
            content={`${blog?.title || ""} | ilmulQuran Online Academy`}
          />
          <meta
            property="og:description"
            content={`${blog?.meta_description || ""}`}
          />
          <meta
            property="og:url"
            content={`https://ilmulquran.com/blog/${blog?.slug}`}
          />
          <meta property="og:type" content="website" />
        </head>

        <div className="min-h-screen bg-white py-8">
          <div className="container max-w-screen-lg mx-auto px-6">
            <div className="flex w-full justify-between items-center">
              <button
                onClick={() => history.back()}
                className="text-teal-600 hover:underline mb-6 inline-block"
              >
                &larr; Back
              </button>

              {/* <button
                onClick={isEditing ? handleSave : handleEditToggle}
                className="bg-teal-600 text-white px-4 py-2 rounded"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : isEditing ? "Save" : "Edit"}
              </button> */}
              {/* <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button> */}
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={newImage ? URL.createObjectURL(newImage) : blog["image"]}
                  alt={blog["image_alt_text"] || blog.Title}
                  className={`w-full h-72 object-cover ${
                    isEditing ? "cursor-pointer" : ""
                  }`}
                  contentEditable={isEditing}
                  onClick={() =>
                    isEditing && document.getElementById("imageInput").click()
                  }
                />
                {isEditing && (
                  <input
                    type="file"
                    id="imageInput"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                )}
              </div>
              <div className="p-8">
                <h1
                  className={`text-4xl font-bold text-gray-800 mb-4 ${
                    isEditing ? "border-b border-gray-300" : ""
                  }`}
                  contentEditable={isEditing}
                  onBlur={(e) =>
                    setBlog({ ...blog, title: e.target.innerText })
                  }
                >
                  {blog.title}
                </h1>

                <div className="flex justify-between items-center text-gray-600 mb-8">
                  <p
                    className="text-sm font-medium"
                    contentEditable={isEditing}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        value={blog.author || ""}
                        onChange={handleAuthorChange} // Handle author changes
                        className="border-b border-gray-300 p-1"
                      />
                    ) : (
                      blog.author || "Unknown Author"
                    )}
                  </p>
                  <p className="text-sm">{formatDate(blog["createdAt"])}</p>
                </div>

                {isEditing && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Slug (URL)
                    </label>
                    <input
                      type="text"
                      value={blog.slug || ""}
                      onChange={handleSlugChange} // Handle slug changes
                      className="border-b border-gray-300 p-1 w-full"
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Video URL
                    </label>
                    <input
                      type="text"
                      value={blog.video || ""}
                      onChange={handleVideoChange} // Handle video URL changes
                      className="border-b border-gray-300 p-1 w-full"
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={blog.image_alt_text || ""}
                      onChange={(e) =>
                        handleFieldChange("image_alt_text", e.target.value)
                      }
                      className="border-b border-gray-300 p-1 w-full"
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Video Position
                    </label>
                    <select
                      value={blog.video_position || ""}
                      onChange={(e) =>
                        handleFieldChange("video_position", e.target.value)
                      }
                      className="border-b border-gray-300 p-1 w-full"
                    >
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </div>
                )}

                {isEditing && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      value={blog.category}
                      onChange={handleCategoryChange}
                      className="border-b border-gray-300 p-1 w-full"
                    >
                      {categories.map((category) => (
                        <option key={category._id} value={category.category}>
                          {category.category}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {isEditing && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Is Page
                    </label>
                    <select
                      value={blog.isPage ? "true" : "false"}
                      onChange={(e) =>
                        handleFieldChange("isPage", e.target.value === "true")
                      }
                      className="border-b border-gray-300 p-1 w-full"
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                )}
                {isEditing && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Meta Description
                    </label>
                    <input
                      type="text"
                      value={blog.meta_description || ""}
                      onChange={(e) =>
                        handleFieldChange("meta_description", e.target.value)
                      }
                      className="border-b border-gray-300 p-1 w-full"
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Keywords (use comma for seperation)
                    </label>
                    <input
                      type="text"
                      value={blog.meta_keywords || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s+/g, ""); // Remove spaces
                        handleFieldChange("meta_keywords", value);
                      }}
                      className="border-b border-gray-300 p-1 w-full"
                    />
                  </div>
                )}

                {isEditing && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Tags (use comma for seperation)
                    </label>
                    <input
                      type="text"
                      value={blog.tags || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s+/g, ""); // Remove spaces
                        handleFieldChange("tags", value);
                      }}
                      placeholder="Comma-separated tags"
                      className="border-b border-gray-300 p-1 w-full"
                    />
                  </div>
                )}

                {blog["video_position"] === "top" && renderVideo()}

                <div
                  className={`content ${
                    isEditing ? "border-b border-gray-300" : ""
                  }`}
                  contentEditable={isEditing}
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                  onBlur={(e) =>
                    setBlog({ ...blog, content: e.target.innerHTML })
                  }
                />

                {blog["video_position"] === "bottom" && renderVideo()}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
