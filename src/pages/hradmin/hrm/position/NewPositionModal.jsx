import { useState, useEffect } from "react";

const JOB_LEVELS = ["L1", "L2", "L3", "L4", "L5", "L6", "M1", "M2", "D1"];

export default function NewPositionModal({ position, onClose, onSaved }) {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("token");
  const isEdit = !!position;

  const [form, setForm] = useState({
    positionName: "",
    positionCode: "",
    departmentId: "",
    jobId: "",
    jobLevel: "",
    headcount: "1",
    salaryTierId: "", // Salary tier được config cho position này
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [salaryTiers, setSalaryTiers] = useState([]);

  useEffect(() => {
    if (isEdit) {
      setForm({
        positionName: position.positionName || "",
        positionCode: position.positionCode || "",
        departmentId: position.departmentId ? String(position.departmentId) : "",
        jobId: position.jobId ? String(position.jobId) : "",
        jobLevel: position.level || "",
        headcount: position.headcount ? String(position.headcount) : "1",
        salaryTierId: position.salaryTierId ? String(position.salaryTierId) : "",
        description: "",
      });
    }
  }, [position]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      const headers = { Authorization: `Bearer ${token}` };
      const [deptRes, jobRes, tierRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/hradmin/departments/active`, { headers }),
        fetch(`${API_BASE_URL}/api/hradmin/jobs/active`, { headers }),
        fetch(`${API_BASE_URL}/api/hradmin/salary-tiers`, { headers }),
      ]);
      const deptData = await deptRes.json();
      const jobData = await jobRes.json();
      const tierData = await tierRes.json();
      if (deptData.status === "success") setDepartments(deptData.data || []);
      if (jobData.status === "success") setJobs(jobData.data || []);
      if (tierData.status === "success") setSalaryTiers(tierData.data || []);
    };
    fetchDropdowns().catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "positionCode" ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.positionName.trim()) { setError("Position name is required."); return; }
    if (!form.departmentId) { setError("Department is required."); return; }
    if (!form.jobId) { setError("Job template is required."); return; }

    setLoading(true);
    try {
      const url = isEdit
        ? `${API_BASE_URL}/api/hradmin/positions/${position.positionId}`
        : `${API_BASE_URL}/api/hradmin/positions`;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          positionName: form.positionName,
          positionCode: form.positionCode || null,
          departmentId: Number(form.departmentId),
          jobId: Number(form.jobId),
          jobLevel: form.jobLevel || null,
          headcount: form.headcount ? Number(form.headcount) : 1,
          salaryTierId: form.salaryTierId ? Number(form.salaryTierId) : null, // Gửi salary tier được config
          description: form.description || null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-[680px] rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* HEADER */}
        <div className="flex items-center justify-between px-8 py-5 border-b">
          <div>
            <h2 className="text-xl font-black tracking-tight">
              {isEdit ? "Edit Position" : "Add New Position"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEdit ? "Update the position details." : "Create a structured role within the organization hierarchy."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-8">
          <form id="position-form" onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Position Name *</label>
                <input
                  name="positionName"
                  value={form.positionName}
                  onChange={handleChange}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full h-11 rounded-lg border px-4 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Position Code</label>
                <input
                  name="positionCode"
                  value={form.positionCode}
                  onChange={handleChange}
                  placeholder="e.g. ENG-L3-001"
                  className="w-full h-11 rounded-lg border px-4 text-sm font-mono focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Department *</label>
                <select
                  name="departmentId"
                  value={form.departmentId}
                  onChange={handleChange}
                  className="w-full h-11 rounded-lg border bg-white px-4 text-sm focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">— Select Department —</option>
                  {departments.map((d) => (
                    <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Job Template *</label>
                <select
                  name="jobId"
                  value={form.jobId}
                  onChange={handleChange}
                  className="w-full h-11 rounded-lg border bg-white px-4 text-sm focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">— Select Job —</option>
                  {jobs.map((j) => (
                    <option key={j.jobId} value={j.jobId}>{j.jobName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Level / Grade</label>
                <select
                  name="jobLevel"
                  value={form.jobLevel}
                  onChange={handleChange}
                  className="w-full h-11 rounded-lg border bg-white px-4 text-sm focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">— Select Level —</option>
                  {JOB_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                  Headcount (Planned)
                  <span className="ml-1 text-slate-400 font-normal normal-case">– số ghế tối đa</span>
                </label>
                <input
                  name="headcount"
                  type="number"
                  min="1"
                  value={form.headcount}
                  onChange={handleChange}
                  className="w-full h-11 rounded-lg border px-4 text-sm focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Salary Tier */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
                Salary Tier
                <span className="ml-1 text-slate-400 font-normal normal-case">– sẽ tự động điền vào Contract</span>
              </label>
              <select
                name="salaryTierId"
                value={form.salaryTierId}
                onChange={handleChange}
                className="w-full h-11 rounded-lg border bg-white px-4 text-sm focus:ring-2 focus:ring-primary/20"
              >
                <option value="">— Select Salary Tier —</option>
                {salaryTiers.map((t) => (
                  <option key={t.tierId} value={t.tierId}>
                    {t.tierName} ({t.tierCode}) - Min: {t.minSalary?.toLocaleString("vi-VN")} VND, Max: {t.maxSalary?.toLocaleString("vi-VN")} VND
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Outline the core responsibilities and expectations for this role..."
                className="w-full rounded-lg border bg-white p-3 text-sm resize-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 bg-slate-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="position-form"
            disabled={loading}
            className="px-7 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Position"}
          </button>
        </div>
      </div>
    </div>
  );
}
