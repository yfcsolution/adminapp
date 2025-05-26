"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardLayout from "../../../admin_dashboard_layout/layout";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiLink,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiSend,
} from "react-icons/fi";

const PaymentMethodsPage = () => {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    active: true,
  });
  const [editingId, setEditingId] = useState(null);
  const editorRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
  });

  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
    }
  }, [editor]);

  // Fetching payment methods on page load
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get("/api/payment_methods/get");
        setPaymentMethods(response.data.data);
      } catch (error) {
        console.error("Error fetching payment methods:", error);
        toast.error("Failed to load payment methods.");
      }
    };

    fetchPaymentMethods();
  }, []);

  // Update availability status of a payment method
  const handleCheckboxChange = async (id, active) => {
    try {
      const updatedPaymentMethods = paymentMethods.map((method) =>
        method.id === id ? { ...method, active } : method
      );
      setPaymentMethods(updatedPaymentMethods);

      await axios.post("/api/payment_methods/update", {
        id,
        active,
      });

      toast.success("Payment method status updated!");
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast.error("Failed to update payment method.");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle adding/updating a payment method
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Method name cannot be empty.");
      return;
    }

    const description = editorRef.current?.getHTML() || "";

    try {
      if (editingId) {
        // Update existing method
        await axios.post("/api/payment_methods/update", {
          id: formData.id,
          name: formData.name,
          description,
          active: formData.active,
        });
        toast.success("Payment method updated successfully!");
      } else {
        // Add new method
        await axios.post("/api/payment_methods/add", {
          id: formData.id,
          name: formData.name,
          description,
          active: formData.active,
        });
        toast.success("Payment method added successfully!");
      }

      // Refresh the list
      const response = await axios.get("/api/payment_methods/get");
      setPaymentMethods(response.data.data);

      // Reset form
      setIsModalOpen(false);
      setFormData({
        id: null,
        name: "",
        active: true,
      });
      setEditingId(null);
      editorRef.current?.commands.clearContent();
    } catch (error) {
      console.error("Error saving payment method:", error);
      toast.error("Failed to save payment method.");
    }
  };

  // Edit a payment method
  const handleEdit = (method) => {
    setFormData({
      id: method.id,
      name: method.name,
      active: method.active,
    });
    setEditingId(method.id);
    editorRef.current?.commands.setContent(method.description || "");
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-semibold text-center text-teal-700 mb-6">
          Manage Payment Methods
        </h2>
        <button
          onClick={() => {
            setFormData({
              id: "",
              name: "",
              active: true,
            });
            setEditingId(null);
            editorRef.current?.commands.clearContent();
            setIsModalOpen(true);
          }}
          className="mb-6 bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 transition"
        >
          Add New Payment Method
        </button>
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-300">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-teal-700 text-white text-left text-sm uppercase">
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">
                    <span className="font-medium">ID</span>
                  </th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">
                    <span className="font-medium">Payment Method</span>
                  </th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">
                    <span className="font-medium">Description</span>
                  </th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">
                    <span className="font-medium">Active</span>
                  </th>
                  <th className="px-6 py-4 font-semibold border-b border-gray-300">
                    <span className="font-medium">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {paymentMethods.map((method, index) => (
                  <tr
                    key={method.id}
                    className={`hover:bg-teal-50 transition-colors duration-200 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="px-6 py-4 text-gray-600 border-b border-gray-300 font-medium">
                      {method.id}
                    </td>
                    <td className="px-6 py-4 text-gray-600 border-b border-gray-300 font-medium">
                      {method.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 border-b border-gray-300">
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: method.description || "",
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 border-b border-gray-300">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={method.active}
                          onChange={(e) =>
                            handleCheckboxChange(method.id, e.target.checked)
                          }
                          className="form-checkbox text-teal-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 border-b border-gray-300">
                      <button
                        onClick={() => handleEdit(method)}
                        className="text-teal-600 hover:text-teal-800 mr-3"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for adding/editing payment method */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h3 className="text-xl font-semibold text-teal-700 mb-4">
              {editingId ? "Edit Payment Method" : "Add Payment Method"}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID
                  </label>
                  <input
                    type="number"
                    name="id"
                    placeholder="Enter ID"
                    value={formData.id}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter Method Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    name="active"
                    id="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="form-checkbox h-4 w-4 text-teal-600 transition duration-150 ease-in-out"
                  />
                  <label
                    htmlFor="active"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Active
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>

                {/* Toolbar */}
                <div className="flex items-center space-x-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${
                      editor?.isActive("bold") ? "bg-gray-200" : ""
                    }`}
                  >
                    <FiBold />
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${
                      editor?.isActive("italic") ? "bg-gray-200" : ""
                    }`}
                  >
                    <FiItalic />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().toggleUnderline().run()
                    }
                    className={`p-2 rounded hover:bg-gray-200 ${
                      editor?.isActive("underline") ? "bg-gray-200" : ""
                    }`}
                  >
                    <FiUnderline />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const previousUrl = editor.getAttributes("link").href;
                      const url = window.prompt("URL", previousUrl);
                      if (url === null) return;
                      if (url === "") {
                        editor
                          .chain()
                          .focus()
                          .extendMarkRange("link")
                          .unsetLink()
                          .run();
                        return;
                      }
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .setLink({ href: url })
                        .run();
                    }}
                    className={`p-2 rounded hover:bg-gray-200 ${
                      editor?.isActive("link") ? "bg-gray-200" : ""
                    }`}
                  >
                    <FiLink />
                  </button>

                  <div className="border-l border-gray-300 h-6 mx-2"></div>

                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().setTextAlign("left").run()
                    }
                    className={`p-2 rounded hover:bg-gray-200 ${
                      editor?.isActive({ textAlign: "left" })
                        ? "bg-gray-200"
                        : ""
                    }`}
                  >
                    <FiAlignLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().setTextAlign("center").run()
                    }
                    className={`p-2 rounded hover:bg-gray-200 ${
                      editor?.isActive({ textAlign: "center" })
                        ? "bg-gray-200"
                        : ""
                    }`}
                  >
                    <FiAlignCenter />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().setTextAlign("right").run()
                    }
                    className={`p-2 rounded hover:bg-gray-200 ${
                      editor?.isActive({ textAlign: "right" })
                        ? "bg-gray-200"
                        : ""
                    }`}
                  >
                    <FiAlignRight />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.chain().focus().setTextAlign("justify").run()
                    }
                    className={`p-2 rounded hover:bg-gray-200 ${
                      editor?.isActive({ textAlign: "justify" })
                        ? "bg-gray-200"
                        : ""
                    }`}
                  >
                    <FiAlignJustify />
                  </button>
                </div>

                {/* Editor content area */}
                <div className="border border-t-0 border-gray-300 rounded-b-md overflow-hidden">
                  <div className="min-h-[200px] p-4">
                    <EditorContent
                      editor={editor}
                      className="outline-none min-h-[100%]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                  }}
                  className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-teal-700 text-white font-medium rounded-md hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 flex items-center"
                >
                  <FiSend className="mr-2" />
                  {editingId ? "Update" : "Add"} Method
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PaymentMethodsPage;
