import React, { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

/**
 * Modal tạo mới hoặc chỉnh sửa 1 Salary Tier (bậc lương).
 *
 * Salary Tier định nghĩa dải lương min/max cho 1 cấp bậc (Fresher, Junior, Mid, Senior, Lead…).
 * Được gán vào contract để xác định khung lương phù hợp.
 *
 * Props:
 *   isOpen       — hiển thị/ẩn modal
 *   onClose      — callback đóng
 *   initialData  — null khi tạo mới, object khi edit
 *   onSuccess    — callback sau khi save thành công
 *
 * API:
 *   POST /api/hradmin/salary-tiers → tạo mới
 *   PUT  /api/hradmin/salary-tiers → cập nhật (tierId bắt buộc trong body)
 */
export default function SalaryTierModal({ isOpen, onClose, initialData, onSuccess }) {
  const [form, setForm] = useState(defaultForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setForm(initialData ? mapToForm(initialData) : defaultForm());
      setError("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const isEdit = !!form.tierId;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...(isEdit && { tierId: form.tierId }),
      tierCode: form.tierCode.trim().toUpperCase(),
      tierName: form.tierName.trim(),
      minSalary: parseFloat(form.minSalary) || 0,
      maxSalary: parseFloat(form.maxSalary) || 0,
      otMultiplier: parseFloat(form.otMultiplier) || 1.5,
      description: form.description.trim(),
      status: "active",
    };

    if (payload.minSalary >= payload.maxSalary) {
      setError("Min Salary phải nhỏ hơn Max Salary.");
      setLoading(false);
      return;
    }

    try {
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(`${API_BASE_URL}/api/hradmin/salary-tiers`, {
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

  const fmtVnd = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return "";
    return n.toLocaleString("vi-VN") + " VND";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center sticky top-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">layers</span>
            {isEdit ? "Edit Salary Tier" : "New Salary Tier"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">{error}</div>
          )}

          {/* Code + Name */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tier Code *">
              <input
                name="tierCode"
                value={form.tierCode}
                onChange={handleChange}
                placeholder="e.g., L1, JUNIOR, SENIOR"
                className="input w-full"
                required
              />
            </Field>
            <Field label="Tier Name *">
              <input
                name="tierName"
                value={form.tierName}
                onChange={handleChange}
                placeholder="e.g., Fresher, Junior Dev"
                className="input w-full"
                required
              />
            </Field>
          </div>

          {/* Min / Max Salary */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Salary (VND) *">
              <input
                type="number"
                name="minSalary"
                value={form.minSalary}
                onChange={handleChange}
                placeholder="e.g., 7000000"
                min="0"
                step="500000"
                className="input w-full"
                required
              />
              {form.minSalary && (
                <p className="text-xs text-slate-400 mt-0.5">{fmtVnd(form.minSalary)}</p>
              )}
            </Field>
            <Field label="Max Salary (VND) *">
              <input
                type="number"
                name="maxSalary"
                value={form.maxSalary}
                onChange={handleChange}
                placeholder="e.g., 12000000"
                min="0"
                step="500000"
                className="input w-full"
                required
              />
              {form.maxSalary && (
                <p className="text-xs text-slate-400 mt-0.5">{fmtVnd(form.maxSalary)}</p>
              )}
            </Field>
          </div>

          {/* Salary Range Preview */}
          {form.minSalary && form.maxSalary && parseFloat(form.maxSalary) > parseFloat(form.minSalary) && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 text-sm">
              <p className="font-bold text-primary mb-1">Salary Band Preview</p>
              <div className="flex items-center gap-2 text-slate-600">
                <span className="font-bold text-green-700">{fmtVnd(form.minSalary)}</span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">arrow_forward</span>
                <span className="font-bold text-blue-700">{fmtVnd(form.maxSalary)}</span>
              </div>
            </div>
          )}

          {/* OT Multiplier */}
          <Field label="OT Multiplier *">
            <div className="relative">
              <input
                type="number"
                name="otMultiplier"
                value={form.otMultiplier}
                onChange={handleChange}
                placeholder="e.g., 1.5"
                min="1"
                max="5"
                step="0.1"
                className="input w-full pr-8"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">×</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Hệ số nhân lương OT cho bậc này. VD: 1.5 = 150% hourly rate.
            </p>
          </Field>

          {/* Description */}
          <Field label="Description">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mô tả bậc lương, yêu cầu kinh nghiệm, vị trí áp dụng..."
              rows={3}
              className="input w-full resize-none"
            />
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update Tier" : "Create Tier"}
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
    tierId: null,
    tierCode: "",
    tierName: "",
    minSalary: "",
    maxSalary: "",
    otMultiplier: "1.5",
    description: "",
  };
}

function mapToForm(data) {
  return {
    tierId: data.tierId,
    tierCode: data.tierCode || "",
    tierName: data.tierName || "",
    minSalary: data.minSalary?.toString() || "",
    maxSalary: data.maxSalary?.toString() || "",
    otMultiplier: data.otMultiplier?.toString() || "1.5",
    description: data.description || "",
  };
}
