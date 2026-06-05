import React, { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function EditCompensationModal({ isOpen, onClose, compensationData, employeeId, onSuccess }) {
  const [formData, setFormData] = useState({
    planId: "",
    employeeId: employeeId || "",
    baseSalary: "",
    insuranceSalary: "",
    dependentCount: "0",
    salaryType: "monthly",
    // OT 3 tiers theo Điều 107 BLLĐ 2019
    otRate: "150",         // ngày thường ≥ 150%
    otRateWeekend: "200", // ngày nghỉ hàng tuần ≥ 200%
    otRateHoliday: "300", // ngày lễ/Tết ≥ 300%
    paymentMethod: "bank_transfer",
    taxResident: 1,
    insuranceScheme: "social_health_unemployment",
    effectiveDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (compensationData && compensationData.planId) {
      setFormData({
        planId: compensationData.planId || "",
        employeeId: compensationData.employeeId || employeeId || "",
        baseSalary: compensationData.baseSalary || "",
        insuranceSalary: compensationData.insuranceSalary || "",
        dependentCount: compensationData.dependentCount?.toString() ?? "0",
        salaryType: compensationData.salaryType || "monthly",
        otRate: compensationData.otRate ?? "150",
        otRateWeekend: compensationData.otRateWeekend ?? "200",
        otRateHoliday: compensationData.otRateHoliday ?? "300",
        paymentMethod: compensationData.paymentMethod || "bank_transfer",
        taxResident: compensationData.taxResident ?? 1,
        insuranceScheme: compensationData.insuranceScheme || "social_health_unemployment",
        effectiveDate: compensationData.effectiveDate || "",
      });
    } else {
      setFormData({
        planId: "",
        employeeId: employeeId || "",
        baseSalary: "",
        insuranceSalary: "",
        dependentCount: "0",
        salaryType: "monthly",
        otRate: "150",
        otRateWeekend: "200",
        otRateHoliday: "300",
        paymentMethod: "bank_transfer",
        taxResident: 1,
        insuranceScheme: "social_health_unemployment",
        effectiveDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [compensationData, employeeId]);

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
      const isCreate = !formData.planId;
      const method = isCreate ? "POST" : "PUT";
      // OT rates: gửi cả 3 tiers theo BLLĐ Điều 107
      const otPayload = {
        otRate: parseFloat(formData.otRate) || 150,
        otRateWeekend: parseFloat(formData.otRateWeekend) || 200,
        otRateHoliday: parseFloat(formData.otRateHoliday) || 300,
      };

      // insuranceSalary: nếu bỏ trống → gửi null → backend tự fallback = baseSalary
      const insuranceSalaryValue = formData.insuranceSalary ? parseFloat(formData.insuranceSalary) : null;
      const dependentCountValue = parseInt(formData.dependentCount) || 0;

      const payload = isCreate
        ? {
            employeeId: formData.employeeId,
            baseSalary: parseFloat(formData.baseSalary),
            insuranceSalary: insuranceSalaryValue,
            dependentCount: dependentCountValue,
            salaryType: formData.salaryType,
            ...otPayload,
            paymentMethod: formData.paymentMethod,
            taxResident: parseInt(formData.taxResident),
            insuranceScheme: formData.insuranceScheme,
            effectiveDate: formData.effectiveDate,
            status: "active",
          }
        : {
            planId: formData.planId,
            baseSalary: parseFloat(formData.baseSalary),
            insuranceSalary: insuranceSalaryValue,
            dependentCount: dependentCountValue,
            salaryType: formData.salaryType,
            ...otPayload,
            paymentMethod: formData.paymentMethod,
            taxResident: parseInt(formData.taxResident),
            insuranceScheme: formData.insuranceScheme,
          };

      const res = await fetch(`${API_BASE_URL}/api/hradmin/compensation-plans`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(data.message || isCreate ? "Failed to create compensation plan" : "Failed to update compensation plan");
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
              payments
            </span>
            {formData.planId ? "Edit Compensation Plan" : "Create Compensation Plan"}
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

          {/* Effective Date (only for create mode) */}
          {!formData.planId && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Effective Date *
              </label>
              <input
                type="date"
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
          )}

          {/* Base Salary */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Base Salary (VND) *
            </label>
            <input
              type="number"
              name="baseSalary"
              value={formData.baseSalary}
              onChange={handleChange}
              placeholder="e.g., 15000000"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
              min="0"
              step="1000"
            />
          </div>

          {/* Insurance Salary + Dependent Count */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Insurance Salary (VND)
              </label>
              <input
                type="number"
                name="insuranceSalary"
                value={formData.insuranceSalary}
                onChange={handleChange}
                placeholder="Để trống = bằng Base Salary"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
                max="36000000"
                step="1000"
              />
              <p className="text-xs text-slate-400 mt-1">Tối đa 36.000.000 VND (20× lương cơ sở)</p>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Số người phụ thuộc
              </label>
              <input
                type="number"
                name="dependentCount"
                value={formData.dependentCount}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                min="0"
                max="20"
                step="1"
              />
              <p className="text-xs text-slate-400 mt-1">Giảm trừ 4.400.000 VND/người/tháng khi tính PIT</p>
            </div>
          </div>

          {/* Salary Type */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Salary Type *
            </label>
            <select
              name="salaryType"
              value={formData.salaryType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="monthly">Monthly</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          {/* OT Rates — 3 tiers theo Điều 107 BLLĐ 2019 */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-500">
              OT Rates (% lương giờ thực trả) *
            </label>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <strong>Điều 107 BLLĐ 2019:</strong> Tiền OT = (Lương tháng ÷ 26 ngày ÷ 8 giờ) × % × số giờ OT
            </div>
            <div className="grid grid-cols-3 gap-3">
              {/* Ngày thường */}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ngày thường (≥ 150%)</label>
                <div className="relative">
                  <input
                    type="number" name="otRate" value={formData.otRate}
                    onChange={handleChange} min="100" step="1" required
                    className="w-full px-3 py-2 pr-7 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                </div>
              </div>
              {/* Ngày nghỉ */}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ngày nghỉ (≥ 200%)</label>
                <div className="relative">
                  <input
                    type="number" name="otRateWeekend" value={formData.otRateWeekend}
                    onChange={handleChange} min="150" step="1" required
                    className="w-full px-3 py-2 pr-7 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                </div>
              </div>
              {/* Ngày lễ/Tết */}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ngày lễ/Tết (≥ 300%)</label>
                <div className="relative">
                  <input
                    type="number" name="otRateHoliday" value={formData.otRateHoliday}
                    onChange={handleChange} min="300" step="1" required
                    className="w-full px-3 py-2 pr-7 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Payment Method *
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* Tax Resident */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Tax Resident *
            </label>
            <select
              name="taxResident"
              value={formData.taxResident}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>

          {/* Insurance Scheme */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Insurance Scheme *
            </label>
            <select
              name="insuranceScheme"
              value={formData.insuranceScheme}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="social_health_unemployment">Social, Health & Unemployment</option>
              <option value="social_health">Social & Health Only</option>
              <option value="none">None</option>
            </select>
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
              {loading ? (formData.planId ? "Updating..." : "Creating...") : (formData.planId ? "Update Compensation" : "Create Compensation")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
