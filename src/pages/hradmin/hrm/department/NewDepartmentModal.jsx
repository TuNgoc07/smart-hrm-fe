import { useState, useEffect } from "react";

export default function NewDepartmentModal({ department, onClose, onSaved }) {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("token");
  const isEdit = !!department;

  const [form, setForm] = useState({
    deptName: "",
    deptCode: "",
    managerId: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [managers, setManagers] = useState([]);

  // Prefill for edit
  useEffect(() => {
    if (isEdit) {
      setForm({
        deptName: department.deptName || "",
        deptCode: department.deptCode || "",
        managerId: "",
        description: "",
      });
    }
  }, [department]);

  // Fetch managers list
  useEffect(() => {
    const fetchManagers = async () => {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setManagers(data.data?.content || []);
    };
    fetchManagers().catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.deptName.trim()) { setError("Department name is required."); return; }
    if (!form.deptCode.trim()) { setError("Department code is required."); return; }

    setLoading(true);
    try {
      const url = isEdit
        ? `${API_BASE_URL}/api/hradmin/departments/${department.deptId}`
        : `${API_BASE_URL}/api/hradmin/departments`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deptName: form.deptName,
          deptCode: form.deptCode,
          managerId: form.managerId ? Number(form.managerId) : null,
          description: form.description,
        }),
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-black">
            {isEdit ? "Edit Department" : "New Department"}
          </h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Department Name *
            </label>
            <input
              name="deptName"
              value={form.deptName}
              onChange={handleChange}
              placeholder="e.g. Engineering"
              className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Department Code *
            </label>
            <input
              name="deptCode"
              value={form.deptCode}
              onChange={handleChange}
              placeholder="e.g. ENG"
              className="w-full px-3 py-2.5 border rounded-lg text-sm font-mono focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Manager
            </label>
            <select
              name="managerId"
              value={form.managerId}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20"
            >
              <option value="">— No manager —</option>
              {managers.map((m) => (
                <option key={m.employeeInfo?.employeeId} value={m.employeeInfo?.employeeId}>
                  {m.employeeInfo?.employeeName}
                </option>
              ))}
            </select>
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
              placeholder="Optional description..."
              className="w-full px-3 py-2.5 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20"
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
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}