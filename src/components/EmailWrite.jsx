"use client";
import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import axios from "axios";
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
  FiX,
} from "react-icons/fi";

export default function EmailComposer({ leadId, onClose, onEmailSent }) {
  const [form, setForm] = useState({
    subject: "",
  });
  const [status, setStatus] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const htmlContent = editorRef.current?.getHTML() || "";
      const response = await axios.post("/api/email/send", {
        leadId,
        subject: form.subject,
        body: htmlContent,
        isHtml: true,
      });
      if (response.data.success) {
        onEmailSent(); // This will close the composer and refresh the list
      }
      setStatus("Sent successfully!");
      setForm({ subject: "" });
      editorRef.current?.commands.clearContent();
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || err.message}`);
    }
  };

  if (!editor) {
    return <div className="p-4 text-center">Loading editor...</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            New Email to Lead #{leadId}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center space-x-1 p-2 border border-gray-300 rounded-t-md bg-gray-50">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-200 ${
                editor.isActive("bold") ? "bg-gray-200" : ""
              }`}
            >
              <FiBold />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-200 ${
                editor.isActive("italic") ? "bg-gray-200" : ""
              }`}
            >
              <FiItalic />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-200 ${
                editor.isActive("underline") ? "bg-gray-200" : ""
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
                editor.isActive("link") ? "bg-gray-200" : ""
              }`}
            >
              <FiLink />
            </button>
            <div className="border-l border-gray-300 h-6 mx-2"></div>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`p-2 rounded hover:bg-gray-200 ${
                editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
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
                editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
              }`}
            >
              <FiAlignCenter />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`p-2 rounded hover:bg-gray-200 ${
                editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
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
                editor.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""
              }`}
            >
              <FiAlignJustify />
            </button>
          </div>
          <div className="border border-t-0 border-gray-300 rounded-b-md overflow-hidden">
            <div className="min-h-[300px] p-4">
              <EditorContent
                editor={editor}
                className="outline-none min-h-[100%]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
          >
            <FiSend className="mr-2" /> Send Email
          </button>
          {status && (
            <p
              className={`text-sm p-2 rounded-md ${
                status.includes("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {status}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
