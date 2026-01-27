"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DashboardLayout from "../../../admin_dashboard_layout/layout";

export default function WhatsAppConfigPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [whatsappConfig, setWhatsappConfig] = useState({
    enabled: false,
    templateName: "",
    templateId: "",
    exampleArr: [],
    mediaUri: "",
    token: "",
  });

  const [emailConfig, setEmailConfig] = useState({
    enabled: false,
    subject: "",
    body: "",
  });

  const [exampleInput, setExampleInput] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [tplRes, waRes, emailRes] = await Promise.all([
          axios.get("/api/whatsapp/templates?isActive=true"),
          axios.get("/api/autosend/config?type=whatsapp"),
          axios.get("/api/autosend/config?type=email"),
        ]);

        setTemplates(tplRes.data.data || []);

        const waCfg = waRes.data.data?.[0];
        if (waCfg) {
          setWhatsappConfig({
            enabled: !!waCfg.enabled,
            templateName: waCfg.templateName || "",
            templateId: waCfg.templateId || "",
            exampleArr: waCfg.exampleArr || [],
            mediaUri: waCfg.mediaUri || "",
            token: waCfg.token || "",
          });
        }

        const emCfg = emailRes.data.data?.[0];
        if (emCfg) {
          setEmailConfig({
            enabled: !!emCfg.enabled,
            subject: emCfg.subject || "",
            body: emCfg.body || "",
          });
        }
      } catch (error) {
        console.error("Failed to load auto-send config", error);
        toast.error("Failed to load WhatsApp / Email configuration");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleTemplateChange = (templateName) => {
    const tpl = templates.find((t) => t.templateName === templateName);
    setWhatsappConfig((prev) => ({
      ...prev,
      templateName,
      templateId: tpl?.templateId || "",
      exampleArr: tpl?.exampleArr || [],
      mediaUri: tpl?.mediaUri || "",
    }));
  };

  const addExample = () => {
    if (!exampleInput.trim()) return;
    setWhatsappConfig((prev) => ({
      ...prev,
      exampleArr: [...prev.exampleArr, exampleInput.trim()],
    }));
    setExampleInput("");
  };

  const removeExample = (index) => {
    setWhatsappConfig((prev) => ({
      ...prev,
      exampleArr: prev.exampleArr.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await Promise.all([
        axios.post("/api/autosend/config", {
          type: "whatsapp",
          enabled: whatsappConfig.enabled,
          templateName: whatsappConfig.templateName || null,
          templateId: whatsappConfig.templateId || null,
          exampleArr: whatsappConfig.exampleArr,
          mediaUri: whatsappConfig.mediaUri || null,
          token: whatsappConfig.token || null,
        }),
        axios.post("/api/autosend/config", {
          type: "email",
          enabled: emailConfig.enabled,
          subject: emailConfig.subject || null,
          body: emailConfig.body || null,
        }),
      ]);

      toast.success("Auto-send configuration saved");
    } catch (error) {
      console.error("Failed to save auto-send config", error);
      toast.error(
        error.response?.data?.error || "Failed to save auto-send configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          WhatsApp & Email Auto-Send Configuration
        </h1>

        {loading ? (
          <div className="py-8 text-center text-gray-600">Loading...</div>
        ) : (
          <>
            {/* WhatsApp section */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">WhatsApp (WACRM)</h2>

              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={whatsappConfig.enabled}
                  onChange={(e) =>
                    setWhatsappConfig((prev) => ({
                      ...prev,
                      enabled: e.target.checked,
                    }))
                  }
                />
                Enable automatic WhatsApp sending for new leads
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Template
                  </label>
                  <select
                    value={whatsappConfig.templateName}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select template</option>
                    {templates.map((tpl) => (
                      <option
                        key={tpl._id}
                        value={tpl.templateName}
                      >{`${tpl.templateName} (${tpl.templateId})`}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WACRM API Token *
                  </label>
                  <input
                    type="text"
                    value={whatsappConfig.token}
                    onChange={(e) =>
                      setWhatsappConfig((prev) => ({
                        ...prev,
                        token: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Paste your WACRM API key"
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Media URI (optional)
                  </label>
                  <input
                    type="text"
                    value={whatsappConfig.mediaUri}
                    onChange={(e) =>
                      setWhatsappConfig((prev) => ({
                        ...prev,
                        mediaUri: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Example Variables
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={exampleInput}
                      onChange={(e) => setExampleInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addExample())
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter example value"
                    />
                    <button
                      type="button"
                      onClick={addExample}
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {whatsappConfig.exampleArr.map((ex, idx) => (
                      <span
                        key={idx}
                        className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full flex items-center gap-2 text-xs"
                      >
                        {ex}
                        <button
                          type="button"
                          onClick={() => removeExample(idx)}
                          className="text-teal-600 hover:text-teal-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Email section */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Email Auto-Send</h2>

              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={emailConfig.enabled}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      enabled: e.target.checked,
                    }))
                  }
                />
                Enable automatic email sending for new leads
              </label>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Subject
                </label>
                <input
                  type="text"
                  value={emailConfig.subject}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Body (HTML allowed)
                </label>
                <textarea
                  rows={6}
                  value={emailConfig.body}
                  onChange={(e) =>
                    setEmailConfig((prev) => ({
                      ...prev,
                      body: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

