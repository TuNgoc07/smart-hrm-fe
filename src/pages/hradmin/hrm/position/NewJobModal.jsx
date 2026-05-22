import { useState, useEffect } from "react";

export default function NewJobModal({ job, onClose, onSaved }) {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("token");
  const isEdit = !!job;

  const [form, setForm] = useState({
    jobCode: "",
    jobName: "",
    description: "",
    requiredSkills: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      setForm({
        jobCode: job.jobCode || "",
        jobName: job.jobName || "",
        description: job.description || "",
        requiredSkills: job.requiredSkills || "",
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "jobCode" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.jobName.trim()) { setError("Job name is required."); return; }

    setLoading(true);
    try {
      const url = isEdit
        ? `${API_BASE_URL}/api/hradmin/jobs/${job.jobId}`
        : `${API_BASE_URL}/api/hradmin/jobs`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === "success") {
        onSaved();
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-black">{isEdit ? "Edit Job" : "New Job Template"}</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Job Name *
            </label>
            <input
              name="jobName"
              value={form.jobName}
              onChange={handleChange}
              placeholder="e.g. Backend Developer"
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Job Code
            </label>
            <input
              name="jobCode"
              value={form.jobCode}
              onChange={handleChange}
              placeholder="e.g. BE-DEV"
              className="w-full px-3 py-2.5 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the role responsibilities..."
              className="w-full px-3 py-2.5 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Required Skills
            </label>
            <input
              name="requiredSkills"
              value={form.requiredSkills}
              onChange={handleChange}
              placeholder="e.g. Java, Spring Boot, React"
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
