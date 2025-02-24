"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Heading from "@tiptap/extension-heading";
import Link from "@tiptap/extension-link"; // Import the Link extension
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ToolBar from "../../../../components/ToolBar";
import { useState, useEffect } from "react";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
export default function RichTextEditor({ content, onChange }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false); // New state for button disable and text change
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [altText, setAltText] = useState("");
  const [videoPosition, setVideoPosition] = useState("top");
  const [authorName, setAuthorName] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]); // Store categories fetched from the API
  const [isModalOpen, setIsModalOpen] = useState(false); // Track if the modal is open
  const [newCategory, setNewCategory] = useState(""); // Track new category input
  const [isPage, setIsPage] = useState(false); // New state for "isPage"
  const [videoURL, setVideoURL] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState([]);
  const [tags, setTags] = useState([]);
  const embedURL = videoURL ? convertToEmbedURL(videoURL) : null;
  const router = useRouter();
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal ml-3",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc ml-3",
        },
      }),
      Highlight,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "min-h-[100px] border rounded-md bg-slate-50 py-2 px-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!isSlugTouched) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^[-]+|[-]+$/g, "");
      setSlug(generatedSlug);
    }
  }, [title, isSlugTouched]);

  useEffect(() => {
    // Fetch categories from the API on component mount
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFeaturedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSlugChange = (e) => {
    const inputValue = e.target.value;
    const formattedSlug = inputValue.replace(/\s+/g, "-"); // Replace spaces with hyphens
    setSlug(formattedSlug);
    setIsSlugTouched(true);
  };

  const handleCreateBlog = async () => {
    try {
      setIsCreating(true); // Disable the button and change text

      // Form data to send to the API
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);

      // Only append the image if it's selected
      if (featuredImage) {
        formData.append("image", featuredImage);
      }

      formData.append("image_alt_text", altText);
      formData.append("video", videoURL);
      formData.append("meta_description", metaDescription); // Add meta_description
      formData.append("meta_keywords", JSON.stringify(metaKeywords)); // Add meta_keywords
      formData.append("tags", JSON.stringify(tags)); // Add tags
      formData.append("video_position", videoPosition);
      formData.append("author", authorName);
      formData.append("category", category);
      formData.append("content", editor?.getHTML());
      formData.append("isPage", isPage); // Add the "isPage" field

      const response = await axios.post("/api/blog/create", formData);

      if (response.status === 201) {
        toast.success("Blog created successfully!");
        router.push("/admin/blog/fetch");
      } else {
        toast.error("Failed to create blog!", response.error);
      }
    } catch (error) {
      toast.error("Error creating blog: " + error.message);
    } finally {
      setIsCreating(false); // Re-enable the button after the process completes
    }
  };

  function convertToEmbedURL(videoURL) {
    try {
      const url = new URL(videoURL);
      let videoID = null;

      if (
        url.hostname === "www.youtube.com" ||
        url.hostname === "youtube.com"
      ) {
        videoID = url.searchParams.get("v"); // Extract 'v' parameter from query string
      } else if (url.hostname === "youtu.be") {
        videoID = url.pathname.slice(1); // Extract video ID from the path
      }

      if (videoID) {
        return `https://www.youtube.com/embed/${videoID}`;
      } else {
        throw new Error("Invalid YouTube URL");
      }
    } catch (error) {
      console.error("Error converting to embed URL:", error);
      return null;
    }
  }

  const handleAddCategory = async () => {
    try {
      const response = await axios.post("/api/blog/category/create", {
        category: newCategory,
      });

      if (response.status === 201) {
        toast.success("Category added successfully!");
        setCategories([...categories, { category: newCategory }]);
        setNewCategory(""); // Reset the new category input
        setIsModalOpen(false); // Close the modal
      } else {
        toast.error("Failed to add category");
      }
    } catch (error) {
      toast.error("Error adding category: " + error.message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 border rounded-lg bg-white shadow-md">
        {/* Add Category Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-4 px-4 py-2 bg-teal-600 text-white  rounded-md"
        >
          Add Category
        </button>

        {/* Title and Slug */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block mb-1 font-medium">
              Title:
            </label>
            <input
              type="text"
              id="title"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsSlugTouched(false);
              }}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter title here"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block mb-1 font-medium">
              Slug:
            </label>
            <input
              type="text"
              id="slug"
              required
              value={slug}
              onChange={handleSlugChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter slug here"
            />
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              id="isPage"
              checked={isPage}
              onChange={(e) => setIsPage(e.target.checked)}
              className="rounded h-6 w-6 cursor-pointer"
            />
            <label htmlFor="isPage" className="font-medium text-lg">
              Is Page
            </label>
          </div>
        </div>

        {/* Featured Image and Image Alt Text */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="featured-image" className="block mb-1 font-medium">
              Featured Image:
            </label>
            <input
              type="file"
              id="featured-image"
              onChange={handleImageChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
            {featuredImage && (
              <img
                src={featuredImage}
                alt={altText || "Featured"}
                className="mt-2 w-40 h-40 object-cover rounded-md"
              />
            )}
          </div>
          <div>
            <label htmlFor="alt-text" className="block mb-1 font-medium">
              Image Alt Text:
            </label>
            <input
              type="text"
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter image alt text"
            />
          </div>
        </div>

        {/* Video and Position */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="video-url" className="block mb-1 font-medium">
              Video URL:
            </label>
            <input
              type="text"
              id="video-url"
              value={videoURL}
              onChange={(e) => setVideoURL(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter YouTube URL"
            />
            {embedURL && (
              <iframe
                className="mt-2 w-full rounded-md"
                src={embedURL}
                allow="autoplay; fullscreen"
                frameBorder="0"
                allowFullScreen
                title="Embedded Video"
              ></iframe>
            )}
          </div>

          <div>
            <label htmlFor="video-position" className="block mb-1 font-medium">
              Video Position:
            </label>
            <select
              id="video-position"
              value={videoPosition}
              onChange={(e) => setVideoPosition(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
        </div>

        {/* Author Name and Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="author-name" className="block mb-1 font-medium">
              Author Name:
            </label>
            <input
              type="text"
              id="author-name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter author name"
            />
          </div>
          <div>
            <label htmlFor="category" className="block mb-1 font-medium">
              Category:
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="meta-description" className="block mb-1 font-medium">
            Meta Description:
          </label>
          <textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter meta description"
          />
        </div>
        <div>
          <label htmlFor="meta-keywords" className="block mb-1 font-medium">
            Meta Keywords (comma-separated):
          </label>
          <input
            type="text"
            id="meta-keywords"
            value={metaKeywords.join(", ")}
            onChange={(e) =>
              setMetaKeywords(e.target.value.split(",").map((k) => k.trim()))
            }
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter meta keywords"
          />
        </div>
        <div>
          <label htmlFor="tags" className="block mb-1 font-medium">
            Tags (comma-separated):
          </label>
          <input
            type="text"
            id="tags"
            value={tags.join(", ")}
            onChange={(e) =>
              setTags(e.target.value.split(",").map((t) => t.trim()))
            }
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter tags"
          />
        </div>
        {/* Rich Text Editor */}
        <div>
          <ToolBar editor={editor} />
          <EditorContent editor={editor} />
        </div>

        {/* Create Blog Button */}
        <button
          onClick={handleCreateBlog}
          disabled={isCreating} // Disable the button when creating
          className={`mt-4 px-4 py-2 text-white rounded-md ${
            isCreating ? "bg-gray-400" : "bg-teal-600 hover:bg-teal-700"
          }`}
        >
          {isCreating ? "Creating..." : "Create Blog"}
        </button>
      </div>

      {/* Modal to Add Category */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Add New Category</h3>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter new category"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-500 text-white rounded-md"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
