"use client";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Layout from "@/app/admin_dashboard_layout/layout";

const CreateEmailTemplate = () => {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = {
      name,
      subject,
      html,
    };

    try {
      const response = await axios.post("/api/create-email-template", formData);
      if (response.status === 201) {
        toast.success("Email template created successfully!");
        setName("");
        setSubject("");
        setHtml("");
      }
    } catch (error) {
      toast.error("Failed Creation:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-teal-600 mb-6">
          Create Email Template
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-lg font-medium text-gray-700"
            >
              Template Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g., Course Registration Confirmation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label
              htmlFor="subject"
              className="block text-lg font-medium text-gray-700"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              placeholder="e.g., Thank You for Registering for [Course Name]"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label
              htmlFor="html"
              className="block text-lg font-medium text-gray-700"
            >
              HTML Content
            </label>
            <textarea
              id="html"
              name="html"
              placeholder="Enter your HTML content here"
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              required
              rows="6"
              className="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 bg-teal-600 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Create Template"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateEmailTemplate;
