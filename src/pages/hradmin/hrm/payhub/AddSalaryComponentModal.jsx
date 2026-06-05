import React, { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

/**
 * Modal tạo mới hoặc chỉnh sửa 1 Salary Component template toàn cục.
 * Được dùng trong Payroll Config Screen.
 *
 * Props:
 *   isOpen       — hiển thị/ẩn modal
 *   onClose      — callback đóng
 *   initialData  — null khi tạo mới, object khi edit
 *   onSuccess    — callback sau khi save thành công (dùng để refresh list)
 */
export default function AddSalaryComponentModal({ isOpen, onClose, initialData, onSuccess }) {
  const [form, setForm] = useState(defaultForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Khi modal mở, nếu có initialData thì điền vào form (edit mode)
  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? mapToForm(initialData) : defaultForm());
      setError("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEdit = !!form.componentId;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Payload: loại bỏ field không cần thiết dựa trên calculationType
    const payload = {
      ...(isEdit && { componentId: form.componentId }),
      componentName: form.componentName,
      componentType: form.componentType,
      componentCode: form.componentCode,
      category: form.category,
      frequency: form.frequency,
      calculationType: form.calculationType,
      calculationBase: form.calculationBase,
      // Chỉ gửi field phù hợp với calculationType
      ...(form.calculationType === "percentage"
        ? { defaultRate: parseFloat(form.defaultRate) || null }
        : { defaultAmount: parseFloat(form.defaultAmount) || null }),
      isMandatory: parseInt(form.isMandatory),
    };

    try {
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(`${API_BASE_URL}/api/hradmin/salary-components`, {
        method,
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
        setError(data.message || "Đã xảy ra lỗi.");
      }
    } catch {
      setError("Không thể kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center sticky top-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">tune</span>
            {isEdit ? "Edit Salary Component" : "New Salary Component"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
          )}

          {/* Component Name */}
          <Field label="Component Name *">
            <input
              name="componentName"
              value={form.componentName}
              onChange={handleChange}
              placeholder="e.g., Social Insurance, Meal Allowance"
              className="input w-full"
              required
            />
          </Field>

          {/* Component Code (để SalaryCalculationEngine biết công thức) */}
          <Field label="Component Code *">
            <select name="componentCode" value={form.componentCode} onChange={handleChange} className="input w-full" required>
              <option value="">-- Chọn mã component --</option>
              <optgroup label="Earnings (Thu nhập)">
                <option value="meal_fixed">meal_fixed - Phụ cấp ăn cố định</option>
                <option value="meal_daily">meal_daily - Phụ cấp ăn theo ngày công</option>
                <option value="transport">transport - Phụ cấp đi lại</option>
                <option value="phone">phone - Phụ cấp điện thoại</option>
                <option value="bonus">bonus - Thưởng hiệu suất</option>
                <option value="commission">commission - Hoa hồng doanh số</option>
              </optgroup>
              <optgroup label="Deductions (Khấu trừ)">
                <option value="si_employee">si_employee - BHXH người lao động (8%)</option>
                <option value="hi_employee">hi_employee - BHYT người lao động (1.5%)</option>
                <option value="ui_employee">ui_employee - BHTN người lao động (1%)</option>
                <option value="pit">pit - Thuế TNCN (progressive tax)</option>
                <option value="penalty">penalty - Phạt đi muộn</option>
                <option value="lwop">lwop - Nghỉ không lương</option>
              </optgroup>
              <optgroup label="Employer Contributions (Công ty đóng)">
                <option value="si_employer">si_employer - BHXH công ty (17.5%)</option>
                <option value="hi_employer">hi_employer - BHYT công ty (3%)</option>
                <option value="ui_employer">ui_employer - BHTN công ty (1%)</option>
              </optgroup>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Mã này được SalaryCalculationEngine dùng để chọn công thức tính toán phù hợp.
            </p>
          </Field>

          {/* Type + Frequency + Category */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Component Type *">
              <select name="componentType" value={form.componentType} onChange={handleChange} className="input w-full" required>
                <option value="allowance">Allowance</option>
                <option value="deduction">Deduction</option>
                <option value="bonus">Bonus</option>
                <option value="employer_contribution">Employer Contribution</option>
              </select>
            </Field>
            <Field label="Category *">
              <select name="category" value={form.category} onChange={handleChange} className="input w-full" required>
                <option value="earnings">Earnings (Thu nhập)</option>
                <option value="deductions">Deductions (Khấu trừ)</option>
                <option value="employer_contributions">Employer Contributions</option>
              </select>
            </Field>
            <Field label="Frequency *">
              <select name="frequency" value={form.frequency} onChange={handleChange} className="input w-full" required>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
                <option value="one_time">One-time</option>
              </select>
            </Field>
          </div>

          {/* Calculation Type */}
          <Field label="Calculation Type *">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
              {[
                { val: "fixed", label: "Fixed Amount" },
                { val: "percentage", label: "% of Base" },
                { val: "per_hour", label: "Per Hour" },
                { val: "per_day", label: "Per Day" },
                { val: "progressive_tax", label: "Progressive Tax" },
              ].map(type => (
                <label key={type.val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="calculationType"
                    value={type.val}
                    checked={form.calculationType === type.val}
                    onChange={handleChange}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium">{type.label}</span>
                </label>
              ))}
            </div>
          </Field>

          {/* Calculation Base */}
          <Field label="Calculation Base *">
            <select name="calculationBase" value={form.calculationBase} onChange={handleChange} className="input w-full">
              <option value="base_salary">Base Salary (Lương cơ bản)</option>
              <option value="gross_income">Gross Income (Tổng thu nhập trước thuế)</option>
              <option value="insurance_salary">Insurance Salary (Lương đóng BH)</option>
              <option value="hourly_rate">Hourly Rate (Lương theo giờ)</option>
              <option value="daily_rate">Daily Rate (Lương theo ngày)</option>
              <option value="revenue">Revenue (Doanh số - cho commission)</option>
              <option value="standard_hours">Standard Hours (Giờ chuẩn tháng)</option>
              <option value="standard_days">Standard Days (Ngày chuẩn tháng)</option>
            </select>
          </Field>

          {/* Conditional: Rate hoặc Amount */}
          {form.calculationType === "percentage" ? (
            <Field label="Default Rate (%) *">
              <div className="relative">
                <input
                  type="number"
                  name="defaultRate"
                  value={form.defaultRate}
                  onChange={handleChange}
                  placeholder="e.g., 8"
                  min="0"
                  max="100"
                  step="0.01"
                  className="input w-full pr-8"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Ví dụ: 8 = 8% × base salary. Được tính lại tự động khi lương thay đổi.
              </p>
            </Field>
          ) : form.calculationType === "fixed" || form.calculationType === "per_hour" || form.calculationType === "per_day" ? (
            <Field label={form.calculationType === "per_hour" ? "Rate (VND/hour) *" : form.calculationType === "per_day" ? "Rate (VND/day) *" : "Default Amount (VND) *"}>
              <input
                type="number"
                name="defaultAmount"
                value={form.defaultAmount}
                onChange={handleChange}
                placeholder={form.calculationType === "per_hour" ? "e.g., 96000" : form.calculationType === "per_day" ? "e.g., 40000" : "e.g., 800000"}
                min="0"
                step="1000"
                className="input w-full"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                {form.calculationType === "per_hour" && "Tiền mỗi giờ làm việc. Dùng cho OT, penalty."}
                {form.calculationType === "per_day" && "Tiền mỗi ngày làm việc. Dùng cho meal per-day, LWOP."}
                {form.calculationType === "fixed" && "Số tiền cố định mỗi kỳ."}
              </p>
            </Field>
          ) : form.calculationType === "progressive_tax" ? (
            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
              <p className="text-sm font-bold text-violet-800 mb-2">Thuế TNCN - Biểu thuế lũy tiến</p>
              <p className="text-xs text-violet-700">
                Tính tự động dựa trên thu nhập tính thuế sau khi trừ bảo hiểm và giảm trừ gia cảnh.
                Không cần nhập rate/amount.
              </p>
            </div>
          ) : null}

          {/* Mandatory Toggle */}
          <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
            <div>
              <p className="font-bold text-sm">Mandatory Component</p>
              <p className="text-xs text-slate-500">Tự động gán cho tất cả nhân viên khi tạo compensation plan mới</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isMandatory"
                checked={form.isMandatory === "1"}
                onChange={e => setForm(p => ({ ...p, isMandatory: e.target.checked ? "1" : "0" }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50">
              {loading ? "Saving..." : isEdit ? "Update Component" : "Create Component"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function defaultForm() {
  return {
    componentId: null,
    componentName: "",
    componentType: "allowance",
    componentCode: "",
    category: "earnings",
    frequency: "monthly",
    calculationType: "fixed",
    calculationBase: "base_salary",
    defaultRate: "",
    defaultAmount: "",
    isMandatory: "0",
  };
}

function mapToForm(data) {
  return {
    componentId: data.componentId,
    componentName: data.componentName || "",
    componentType: data.componentType || "allowance",
    componentCode: data.componentCode || "",
    category: data.category || "earnings",
    frequency: data.frequency || "monthly",
    calculationType: data.calculationType || "fixed",
    calculationBase: data.calculationBase || "base_salary",
    defaultRate: data.defaultRate?.toString() || "",
    defaultAmount: data.defaultAmount?.toString() || "",
    isMandatory: data.isMandatory?.toString() || "0",
  };
}
