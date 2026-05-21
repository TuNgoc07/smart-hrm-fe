import React, { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function LeavePolicyConfigModal({ isOpen, onClose, policyData, onSuccess }) {
  const [formData, setFormData] = useState({
    policyId: null,
    policyName: "",
    policyCode: "",
    leaveType: "",
    isPaid: 1,
    isActive: 1,
    daysPerYear: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (policyData && policyData.policyId) {
      setFormData({
        policyId: policyData.policyId,
        policyName: policyData.policyName || "",
        policyCode: policyData.policyCode || "",
        leaveType: policyData.leaveType || "",
        isPaid: policyData.isPaid ?? 1,
        isActive: policyData.isActive ?? 1,
        daysPerYear: policyData.daysPerYear || ""
      });
    } else {
      setFormData({
        policyId: null,
        policyName: "",
        policyCode: "",
        leaveType: "",
        isPaid: 1,
        isActive: 1,
        daysPerYear: ""
      });
    }
  }, [policyData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isCreate = !formData.policyId;
      const method = isCreate ? "POST" : "PUT";

      const payload = {
        policyId: formData.policyId,
        policyName: formData.policyName,
        policyCode: formData.policyCode,
        leaveType: formData.leaveType,
        isPaid: parseInt(formData.isPaid),
        isActive: parseInt(formData.isActive),
        daysPerYear: parseInt(formData.daysPerYear)
      };

      const res = await fetch(`${API_BASE_URL}/api/hradmin/leave-policies`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.status === "success" || res.ok) {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(data.message || (isCreate ? "Failed to create leave policy" : "Failed to update leave policy"));
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center sticky top-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              policy
            </span>
            {formData.policyId ? "Edit Leave Policy" : "Create Leave Policy"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Policy Name */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Policy Name *
            </label>
            <input
              type="text"
              name="policyName"
              value={formData.policyName}
              onChange={handleChange}
              placeholder="e.g., Annual Leave"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Policy Code */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Policy Code *
            </label>
            <input
              type="text"
              name="policyCode"
              value={formData.policyCode}
              onChange={handleChange}
              placeholder="e.g., ANNUAL"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={!!formData.policyId}
            />
            {formData.policyId && (
              <div className="mt-1 text-xs text-slate-500">Policy code cannot be changed after creation</div>
            )}
          </div>

          {/* Leave Type */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Leave Type *
            </label>
            <input
              type="text"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              placeholder="e.g., ANNUAL"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Days Per Year */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Days Per Year *
            </label>
            <input
              type="number"
              name="daysPerYear"
              value={formData.daysPerYear}
              onChange={handleChange}
              placeholder="e.g., 12"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              min="0"
              step="1"
            />
          </div>

          {/* Is Paid */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Is Paid *
            </label>
            <select
              name="isPaid"
              value={formData.isPaid}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value={1}>Yes - Paid Leave</option>
              <option value={0}>No - Unpaid Leave</option>
            </select>
          </div>

          {/* Is Active */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Status *
            </label>
            <select
              name="isActive"
              value={formData.isActive}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>Note:</strong> Policy code is used as a unique identifier. Once created, it cannot be changed.
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (formData.policyId ? "Updating..." : "Creating...") : (formData.policyId ? "Update Policy" : "Create Policy")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
