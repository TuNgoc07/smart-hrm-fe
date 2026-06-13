import { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function EditProfileModal({ empId, employeeProfile, onClose, onSaved }) {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    employeeName: "",
    birthday: "",
    gender: "",
    nationality: "",
    maritalStatus: "",
    workEmail: "",
    personalEmail: "",
    phoneNumber: "",
    linkedln: "",
    permanentAddress: "",
    currentAddress: "",
    identificationCode: "",
    issueDate: "",
    issuePlace: "",
  });
  const [jobForm, setJobForm] = useState({ departmentId: "", positionId: "" });
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employeeProfile) {
      setForm({
        employeeName: employeeProfile.employeeName || "",
        birthday: employeeProfile.birthday || "",
        gender: employeeProfile.gender || "",
        nationality: employeeProfile.nationality || "",
        maritalStatus: employeeProfile.maritalStatus || "",
        workEmail: employeeProfile.workEmail || "",
        personalEmail: employeeProfile.personalEmail || "",
        phoneNumber: employeeProfile.phoneNumber || "",
        linkedln: employeeProfile.linkedln || "",
        permanentAddress: employeeProfile.permanentAddress || "",
        currentAddress: employeeProfile.currentAddress || "",
        identificationCode: employeeProfile.identificationCode || "",
        issueDate: employeeProfile.issueDate || "",
        issuePlace: employeeProfile.issuePlace || "",
      });
    }
  }, [employeeProfile]);

  useEffect(() => {
    const fetchDepts = async () => {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/departments/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setDepartments(data.data || []);
    };
    fetchDepts().catch(() => {});
  }, []);

  useEffect(() => {
    const fetchJobInfo = async () => {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/employee-jobinfo/${empId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        const deptId = data.data?.departmentInfo?.deptId || "";
        const posId = data.data?.positionInfo?.[0]?.positionId || "";
        setJobForm({ departmentId: String(deptId), positionId: String(posId) });
        if (deptId) fetchPositions(deptId);
      }
    };
    fetchJobInfo().catch(() => {});
  }, [empId]);

  const fetchPositions = async (deptId) => {
    const url = deptId
      ? `${API_BASE_URL}/api/hradmin/positions?size=200&status=active&departmentId=${deptId}`
      : `${API_BASE_URL}/api/hradmin/positions?size=200&status=active`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.status === "success") setPositions(data.data?.content || []);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleJobChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({ ...prev, [name]: value, ...(name === "departmentId" ? { positionId: "" } : {}) }));
    if (name === "departmentId") fetchPositions(value).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.employeeName.trim()) { setError("Full name is required."); return; }

    setLoading(true);
    try {
      const profileRes = await fetch(`${API_BASE_URL}/api/hradmin/employee-profile/${empId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ employeeInfo: form }),
      });
      const profileData = await profileRes.json();
      if (profileData.status !== "success") {
        setError(profileData.message || "Failed to update profile.");
        setLoading(false);
        return;
      }

      if (jobForm.departmentId || jobForm.positionId) {
        const params = new URLSearchParams();
        if (jobForm.departmentId) params.append("departmentId", jobForm.departmentId);
        if (jobForm.positionId) params.append("positionId", jobForm.positionId);
        const jobRes = await fetch(`${API_BASE_URL}/api/hradmin/employees/${empId}/job-info?${params}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        const jobData = await jobRes.json();
        if (jobData.status !== "success") {
          setError(jobData.message || "Failed to update job info.");
          setLoading(false);
          return;
        }
      }

      onSaved(profileData.data?.employeeInfo);
    } catch {
      setError("Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-lg font-black">Edit Profile</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-6">

          {/* Job Info */}
          <section>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">Job Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Department</label>
                <select
                  name="departmentId"
                  value={jobForm.departmentId}
                  onChange={handleJobChange}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">— Select Department —</option>
                  {departments.map((d) => (
                    <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Position</label>
                <select
                  name="positionId"
                  value={jobForm.positionId}
                  onChange={handleJobChange}
                  className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
                >
                  <option value="">— Select Position —</option>
                  {positions.map((p) => (
                    <option key={p.positionId} value={p.positionId}>{p.positionName}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* General Information */}
          <section>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">General Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name *" name="employeeName" value={form.employeeName} onChange={handleChange} />
              <Field label="Date of Birth" name="birthday" value={form.birthday} onChange={handleChange} placeholder="YYYY-MM-DD" />
              <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange}
                options={["Male", "Female", "Other"]} />
              <Field label="Nationality" name="nationality" value={form.nationality} onChange={handleChange} />
              <SelectField label="Marital Status" name="maritalStatus" value={form.maritalStatus} onChange={handleChange}
                options={["Single", "Married", "Divorced", "Widowed"]} />
            </div>
          </section>

          {/* Contact */}
          <section>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Work Email" name="workEmail" value={form.workEmail} onChange={handleChange} type="email" />
              <Field label="Personal Email" name="personalEmail" value={form.personalEmail} onChange={handleChange} type="email" />
              <Field label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
              <Field label="LinkedIn URL" name="linkedln" value={form.linkedln} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
            </div>
          </section>

          {/* Address */}
          <section>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">Address Details</h3>
            <div className="space-y-4">
              <TextareaField label="Permanent Address" name="permanentAddress" value={form.permanentAddress} onChange={handleChange} />
              <TextareaField label="Current Residence" name="currentAddress" value={form.currentAddress} onChange={handleChange} />
            </div>
          </section>

          {/* Identification */}
          <section>
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">Identification</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="ID / Passport No." name="identificationCode" value={form.identificationCode} onChange={handleChange} />
              <Field label="Issue Date" name="issueDate" value={form.issueDate} onChange={handleChange} placeholder="YYYY-MM-DD" />
              <Field label="Place of Issue" name="issuePlace" value={form.issuePlace} onChange={handleChange} />
            </div>
          </section>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-semibold border rounded-lg hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
      >
        <option value="">— Select —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextareaField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={2}
        className="w-full px-3 py-2.5 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:outline-none"
      />
    </div>
  );
}
