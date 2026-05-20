import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function AddContractTemplateModal({ onClose }) {
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState("probation");
  const [templateContent, setTemplateContent] = useState("");
  const [placeholders, setPlaceholders] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!templateName.trim()) { setError("Template name is required."); return; }
    if (!templateContent.trim()) { setError("Template content is required."); return; }
    
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/hradmin/contract-templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          templateName,
          templateType,
          templateContent,
          placeholders: placeholders || null,
          isActive: true,
        }),
      });
      const json = await res.json();
      if (json.status === "success") {
        onClose();
      } else {
        setError(json.message || "Failed to create template.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-[600px] rounded-xl shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7edf3]">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#0d141b]">
            <span className="material-symbols-outlined text-primary">description</span>
            Add Contract Template
          </h2>
          <button onClick={onClose} className="text-[#4c739a] hover:text-[#0d141b]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* TEMPLATE NAME */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#0d141b]">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Standard Employment Contract"
              className="w-full px-4 py-2.5 rounded-lg border border-[#cfdbe7] focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* TEMPLATE TYPE */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#0d141b]">
              Contract Type <span className="text-red-500">*</span>
            </label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#cfdbe7] focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="probation">Probation</option>
              <option value="permanent">Permanent</option>
              <option value="fixed_term">Fixed-term</option>
              <option value="internship">Internship</option>
              <option value="part_time">Part-time</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          {/* TEMPLATE CONTENT */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#0d141b]">
              Template Content <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={8}
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              placeholder="Enter contract template content with placeholders like {{employeeName}}, {{startDate}}, etc."
              className="w-full px-4 py-2.5 rounded-lg border border-[#cfdbe7] focus:ring-2 focus:ring-primary focus:outline-none resize-none text-sm"
            />
            <p className="text-xs text-slate-500">
              Use placeholders in format: {`{{placeholderName}}`}
            </p>
          </div>

          {/* PLACEHOLDERS */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-[#0d141b]">
              Placeholders (JSON)
            </label>
            <textarea
              rows={3}
              value={placeholders}
              onChange={(e) => setPlaceholders(e.target.value)}
              placeholder='{"employeeName": "Employee Name", "startDate": "Start Date"}'
              className="w-full px-4 py-2.5 rounded-lg border border-[#cfdbe7] focus:ring-2 focus:ring-primary focus:outline-none resize-none text-sm font-mono"
            />
            <p className="text-xs text-slate-500">
              Optional: JSON format describing placeholders used in the template
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-[#e7edf3] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-[#0d141b] hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating…" : "Create Template"}
            <span className="material-symbols-outlined text-sm">check_circle</span>
          </button>
        </div>
      </div>
    </div>
  );
}
