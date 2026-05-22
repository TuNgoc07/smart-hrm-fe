import React, { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function NewContractModal({ isOpen, onClose, employeeId, onSuccess }) {
  const [formData, setFormData] = useState({
    contractCode: "",
    contractType: "fixed_term",
    startDate: "",
    endDate: "",
    salaryTierId: 3, // Default to Tier 3 (fresher) - will be mapped from tier name
    employmentStatus: "full_time",
    status: "active",
    documentUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [salaryTiers, setSalaryTiers] = useState([]);
  const [tiersLoading, setTiersLoading] = useState(false);
  const [salaryTierFromPosition, setSalaryTierFromPosition] = useState(null); // Salary tier từ position của employee

  // Fetch salary tiers on component mount
  useEffect(() => {
    const fetchSalaryTiers = async () => {
      setTiersLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/hradmin/salary-tiers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (data.status === 'success') {
          setSalaryTiers(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch salary tiers:', err);
      } finally {
        setTiersLoading(false);
      }
    };

    fetchSalaryTiers();
  }, []);

  // Fetch salary tier từ position của employee (auto-fill)
  useEffect(() => {
    if (!employeeId) return;
    const fetchSalaryTierFromPosition = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/hradmin/employees/${employeeId}/salary-tier-from-position`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setSalaryTierFromPosition(data.data);
          setFormData((prev) => ({ ...prev, salaryTierId: data.data }));
        }
      } catch (err) {
        console.error('Failed to fetch salary tier from position:', err);
      }
    };
    fetchSalaryTierFromPosition();
  }, [employeeId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/contracts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          employeeId: employeeId,
          contractCode: formData.contractCode,
          contractType: formData.contractType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          salaryTierId: formData.salaryTierId,
          employmentStatus: formData.employmentStatus,
          documentUrl: formData.documentUrl,
          status: formData.status,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(data.message || "Failed to create contract");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center sticky top-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              description
            </span>
            Add New Contract
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

          {/* Contract Code */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Contract Code *
            </label>
            <input
              type="text"
              name="contractCode"
              value={formData.contractCode}
              onChange={handleChange}
              placeholder="e.g., FXT001, OFFC002"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          {/* Contract Type */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Contract Type *
            </label>
            <select
              name="contractType"
              value={formData.contractType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="fixed_term">Fixed Term</option>
              <option value="permanent">Permanent</option>
              <option value="probation">Probation</option>
              <option value="internship">Internship</option>
            </select>
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Salary Tier - Auto-filled from position, disabled to prevent manual selection */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Salary Tier *
              <span className="ml-1 text-slate-400 font-normal normal-case">– tự động từ Position</span>
            </label>
            <select
              name="salaryTierId"
              value={formData.salaryTierId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              disabled={true} // Luôn disable để HR không chọn thủ công
            >
              {tiersLoading ? (
                <option value="">Loading salary tiers...</option>
              ) : salaryTierFromPosition ? (
                salaryTiers.map((tier) => (
                  <option key={tier.tierId} value={tier.tierId}>
                    {tier.tierName} ({tier.tierCode}) - Min: {tier.minSalary?.toLocaleString("vi-VN")} VND, Max: {tier.maxSalary?.toLocaleString("vi-VN")} VND
                  </option>
                ))
              ) : (
                <option value="">Employee chưa có Position hoặc Position chưa config Salary Tier</option>
              )}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Salary tier được tự động điền từ Position của nhân viên. HR không thể thay đổi thủ công.
            </p>
          </div>

          {/* Employment Status */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Employment Status *
            </label>
            <select
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="intern">Intern</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Contract Status *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>

          {/* Document URL */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Document URL
            </label>
            <input
              type="url"
              name="documentUrl"
              value={formData.documentUrl}
              onChange={handleChange}
              placeholder="https://example.com/contract.pdf"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-slate-400 mt-1">
              Enter the URL to the contract document (PDF)
            </p>
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
              {loading ? "Creating..." : "Create Contract"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
