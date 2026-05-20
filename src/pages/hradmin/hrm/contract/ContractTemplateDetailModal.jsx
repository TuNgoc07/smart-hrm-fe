import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function ContractTemplateDetailModal({ template, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    templateName: template.templateName,
    templateType: template.templateType,
    templateContent: template.templateContent,
    placeholders: template.placeholders,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    if (!editData.templateName.trim()) { setError("Template name is required."); return; }
    if (!editData.templateContent.trim()) { setError("Template content is required."); return; }
    
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/hradmin/contract-templates/${template.templateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editData),
      });
      const json = await res.json();
      if (json.status === "success") {
        setIsEditing(false);
        onClose();
      } else {
        setError(json.message || "Failed to update template.");
      }
    } catch (e) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const typeColors = {
    probation: "bg-purple-100 text-purple-700",
    permanent: "bg-emerald-100 text-emerald-700",
    fixed_term: "bg-blue-100 text-blue-700",
    internship: "bg-amber-100 text-amber-700",
    part_time: "bg-slate-100 text-slate-700",
    freelance: "bg-orange-100 text-orange-700",
  };

  if (!template) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-[800px] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7edf3] sticky top-0 bg-white z-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#0d141b]">
            <span className="material-symbols-outlined text-primary">description</span>
            Template Details
          </h2>
          <div className="flex gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#4c739a] hover:text-primary"
                title="Edit"
              >
                <span className="material-symbols-outlined text-xl">edit</span>
              </button>
            )}
            <button onClick={onClose} className="text-[#4c739a] hover:text-[#0d141b]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {isEditing ? (
            <>
              {/* EDIT MODE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0d141b]">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editData.templateName}
                  onChange={(e) => setEditData({ ...editData, templateName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#cfdbe7] focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0d141b]">
                  Contract Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={editData.templateType}
                  onChange={(e) => setEditData({ ...editData, templateType: e.target.value })}
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

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0d141b]">
                  Template Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  value={editData.templateContent}
                  onChange={(e) => setEditData({ ...editData, templateContent: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#cfdbe7] focus:ring-2 focus:ring-primary focus:outline-none resize-none text-sm font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0d141b]">
                  Placeholders (JSON)
                </label>
                <textarea
                  rows={3}
                  value={editData.placeholders || ""}
                  onChange={(e) => setEditData({ ...editData, placeholders: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-[#cfdbe7] focus:ring-2 focus:ring-primary focus:outline-none resize-none text-sm font-mono"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold text-[#0d141b] hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* VIEW MODE */}
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[template.templateType] || "bg-slate-100 text-slate-700"}`}>
                  {template.templateType?.replace(/_/g, " ").toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${template.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                  {template.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Template ID</p>
                  <p className="text-sm font-bold text-[#0d141b]">{template.templateId}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Created At</p>
                  <p className="text-sm text-[#0d141b]">{new Date(template.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Last Updated</p>
                  <p className="text-sm text-[#0d141b]">{new Date(template.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Template Name</p>
                <p className="text-lg font-bold text-[#0d141b]">{template.templateName}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Template Content</p>
                <div className="bg-slate-50 rounded-lg p-4 border">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">{template.templateContent || "No content"}</pre>
                </div>
              </div>

              {template.placeholders && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Placeholders</p>
                  <div className="bg-slate-50 rounded-lg p-4 border">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">{template.placeholders}</pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
