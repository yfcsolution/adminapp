"use client";
import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
export default function EmailComposer() {
  const [form, setForm] = useState({
    to: "",
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
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
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

      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: form.to,
          subject: form.subject,
          body: htmlContent,
          isHtml: true,
        }),
      });

      const data = await res.json();
      setStatus(res.ok ? "Sent successfully!" : `Error: ${data.error}`);

      if (res.ok) {
        setForm({ to: "", subject: "" });
        editorRef.current?.commands.clearContent();
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="email-composer max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Send Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="recipient@example.com"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            required
          />
        </div>

        <div>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message
          </label>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive("bold") ? "bg-gray-200" : ""
                }`}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive("italic") ? "bg-gray-200" : ""
                }`}
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive("underline") ? "bg-gray-200" : ""
                }`}
              >
                <u>U</u>
              </button>
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""
                }`}
              >
                H1
              </button>
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
                }`}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive("bulletList") ? "bg-gray-200" : ""
                }`}
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive("orderedList") ? "bg-gray-200" : ""
                }`}
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().setTextAlign("left").run()
                }
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
                }`}
              >
                Left
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
                Center
              </button>
              <button
                type="button"
                onClick={() =>
                  editor.chain().focus().setTextAlign("right").run()
                }
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
                }`}
              >
                Right
              </button>
              <button
                type="button"
                onClick={() => {
                  const url = window.prompt("Enter the URL");
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`p-2 rounded hover:bg-gray-200 ${
                  editor.isActive("link") ? "bg-gray-200" : ""
                }`}
              >
                Link
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLink().run()}
                disabled={!editor.isActive("link")}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Unlink
              </button>
            </div>

            {/* Editor Content */}
            <div className="min-h-[200px] p-4">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Send Email
        </button>
      </form>

      {status && (
        <p
          className={`mt-4 p-3 rounded-md ${
            status.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}
