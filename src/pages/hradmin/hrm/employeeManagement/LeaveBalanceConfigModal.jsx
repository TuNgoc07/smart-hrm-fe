import React, { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function LeaveBalanceConfigModal({ isOpen, onClose, balanceData, employeeId, onSuccess }) {
  const [formData, setFormData] = useState({
    balanceId: null,
    employeeId: employeeId || "",
    policyId: "",
    year: new Date().getFullYear(),
    entitledDays: "",
    carriedOverDays: "0",
    adjustedDays: "0",
    usedDays: "0",       // read-only
    pendingDays: "0",    // read-only
    remainingDays: "0"   // computed
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);

  // Load leave policies khi modal mở
  useEffect(() => {
    const loadLeavePolicies = async () => {
      if (!isOpen) return;
      setLoadingPolicies(true);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        };
        const res = await fetch(`${API_BASE_URL}/api/hradmin/leave-policies`, { headers });
        const data = await res.json();
        if (data.status === "success" && data.data) {
          setLeavePolicies(data.data);
        }
      } catch (err) {
        console.error("Error loading leave policies:", err);
      } finally {
        setLoadingPolicies(false);
      }
    };

    loadLeavePolicies();
  }, [isOpen]);

  useEffect(() => {
    if (balanceData && balanceData.balanceId) {
      setFormData({
        balanceId: balanceData.balanceId,
        employeeId: balanceData.employeeId || employeeId || "",
        policyId: balanceData.policyId || "",
        year: balanceData.year || new Date().getFullYear(),
        entitledDays: balanceData.entitledDays || "",
        carriedOverDays: balanceData.carriedOverDays || "0",
        adjustedDays: balanceData.adjustedDays || "0",
        usedDays: balanceData.usedDays || "0",
        pendingDays: balanceData.pendingDays || "0",
        remainingDays: balanceData.remainingDays || "0"
      });
    } else {
      setFormData({
        balanceId: null,
        employeeId: employeeId || "",
        policyId: "",
        year: new Date().getFullYear(),
        entitledDays: "",
        carriedOverDays: "0",
        adjustedDays: "0",
        usedDays: "0",
        pendingDays: "0",
        remainingDays: "0"
      });
    }
  }, [balanceData, employeeId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const isCreate = !formData.balanceId;
      const method = isCreate ? "POST" : "PUT";

      const payload = isCreate
        ? {
            employeeId: formData.employeeId,
            policyId: parseInt(formData.policyId),
            year: parseInt(formData.year),
            entitledDays: parseFloat(formData.entitledDays) || 0,
            carriedOverDays: parseFloat(formData.carriedOverDays) || 0,
            adjustedDays: parseFloat(formData.adjustedDays) || 0
          }
        : {
            balanceId: formData.balanceId,
            entitledDays: parseFloat(formData.entitledDays) || 0,
            carriedOverDays: parseFloat(formData.carriedOverDays) || 0,
            adjustedDays: parseFloat(formData.adjustedDays) || 0
          };

      // TODO: Thay bằng endpoint thực khi backend sẵn sàng
      const res = await fetch(`${API_BASE_URL}/api/hradmin/leave-balances`, {
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
        setError(data.message || (isCreate ? "Failed to create leave balance" : "Failed to update leave balance"));
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedPolicy = leavePolicies.find(p => p.policyId === parseInt(formData.policyId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center sticky top-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              event_balance
            </span>
            {formData.balanceId ? "Edit Leave Balance" : "Configure Leave Balance"}
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

          {/* Employee Info (read-only) */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Employee ID
            </label>
            <input
              type="text"
              value={formData.employeeId}
              disabled
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
            />
          </div>

          {/* Leave Policy */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Leave Policy *
            </label>
            <select
              name="policyId"
              value={formData.policyId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={!!formData.balanceId || loadingPolicies}
            >
              <option value="">{loadingPolicies ? "Loading..." : "Select leave policy"}</option>
              {leavePolicies.map(policy => (
                <option key={policy.policyId} value={policy.policyId}>
                  {policy.policyName} ({policy.daysPerYear} days/year, {policy.isPaid ? "Paid" : "Unpaid"})
                </option>
              ))}
            </select>
            {selectedPolicy && (
              <div className="mt-1 text-xs text-slate-500">
                Default: {selectedPolicy.daysPerYear} days per year • {selectedPolicy.isPaid ? "Paid leave" : "Unpaid leave"}
              </div>
            )}
          </div>

          {/* Year */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Year *
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              min="2020"
              max="2100"
              step="1"
              disabled={!!formData.balanceId} // Disable khi edit
            />
          </div>

          {/* Entitled Days */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Entitled Days *
            </label>
            <input
              type="number"
              name="entitledDays"
              value={formData.entitledDays}
              onChange={handleChange}
              placeholder="e.g., 12"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              min="0"
              step="0.5"
            />
            {selectedPolicy && !formData.entitledDays && (
              <div className="mt-1 text-xs text-blue-600">
                Default from policy: {selectedPolicy.daysPerYear} days
              </div>
            )}
          </div>

          {/* Carried Over Days */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Carried Over Days
            </label>
            <input
              type="number"
              name="carriedOverDays"
              value={formData.carriedOverDays}
              onChange={handleChange}
              placeholder="e.g., 2"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              min="0"
              step="0.5"
            />
            <div className="mt-1 text-xs text-slate-500">
              Days carried over from previous year
            </div>
          </div>

          {/* Adjusted Days */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Adjusted Days
            </label>
            <input
              type="number"
              name="adjustedDays"
              value={formData.adjustedDays}
              onChange={handleChange}
              placeholder="e.g., 1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              step="0.5"
            />
            <div className="mt-1 text-xs text-slate-500">
              Manual adjustment (positive = add, negative = subtract)
            </div>
          </div>

          {/* Read-only fields */}
          {formData.balanceId && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Used Days
                </label>
                <input
                  type="number"
                  value={formData.usedDays}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Pending Days
                </label>
                <input
                  type="number"
                  value={formData.pendingDays}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Remaining Days
                </label>
                <input
                  type="number"
                  value={formData.remainingDays}
                  disabled
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-green-50 text-green-700 font-bold"
                />
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>Formula:</strong> Remaining = Entitled + Carried Over + Adjusted - Used - Pending
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
              {loading ? (formData.balanceId ? "Updating..." : "Creating...") : (formData.balanceId ? "Update Balance" : "Create Balance")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
