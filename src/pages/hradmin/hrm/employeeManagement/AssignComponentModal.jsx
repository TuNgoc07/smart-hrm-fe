import React, { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

/**
 * Modal để gán 1 salary component vào compensation plan của nhân viên.
 *
 * Pipeline:
 *   1. Load danh sách tất cả component templates từ API
 *   2. HR Admin chọn component
 *   3. Nếu muốn: override rate hoặc amount riêng cho nhân viên này
 *   4. Submit → POST /api/hradmin/employee-salary-components
 *   5. Backend tự tính calculatedAmount dựa trên baseSalary của plan
 *
 * Props:
 *   isOpen   — hiển thị/ẩn
 *   onClose  — callback đóng
 *   planId   — ID của compensation plan đang active
 *   onSuccess — callback sau khi assign thành công
 */
export default function AssignComponentModal({ isOpen, onClose, planId, onSuccess }) {
  const [templates, setTemplates] = useState([]); // danh sách component templates từ API
  const [selected, setSelected] = useState(null);  // template đang chọn
  const [useDefault, setUseDefault] = useState(true); // dùng rate mặc định hay override
  const [overrideRate, setOverrideRate] = useState("");
  const [overrideAmount, setOverrideAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load templates khi modal mở
  useEffect(() => {
    if (!isOpen) return;
    setSelected(null);
    setUseDefault(true);
    setOverrideRate("");
    setOverrideAmount("");
    setError("");
    fetchTemplates();
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/salary-components`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setTemplates(data.status === "success" ? (data.data || []) : []);
    } catch {
      setTemplates([]);
    }
  };

  if (!isOpen) return null;

  const isPercentage = selected?.calculationType === "percentage";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) { setError("Vui lòng chọn 1 salary component."); return; }
    setLoading(true);
    setError("");

    const payload = {
      planId,
      componentId: selected.componentId,
      useDefaultRate: useDefault ? 1 : 0,
      // Chỉ gửi override field nếu người dùng chọn override
      ...(!useDefault && isPercentage  && { overrideRate: parseFloat(overrideRate) }),
      ...(!useDefault && !isPercentage && { overrideAmount: parseFloat(overrideAmount) }),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/employee-salary-components`, {
        method: "POST",
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center sticky top-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            Assign Salary Component
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
          )}

          {/* Component Selector */}
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 block mb-2">
              Select Component *
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
              {templates.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">
                  No components available. Create them in Payroll Configuration.
                </p>
              ) : (
                templates.map(t => (
                  <label key={t.componentId}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border transition ${
                      selected?.componentId === t.componentId
                        ? "border-primary bg-primary/5"
                        : "border-transparent hover:bg-slate-50"
                    }`}>
                    <input
                      type="radio"
                      name="component"
                      checked={selected?.componentId === t.componentId}
                      onChange={() => { setSelected(t); setUseDefault(true); }}
                      className="accent-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{t.componentName}</span>
                        {/* Badge: % hoặc fixed */}
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          t.calculationType === "percentage"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {t.calculationType === "percentage" ? `${t.defaultRate}%` : "Fixed"}
                        </span>
                        {/* Badge: mandatory */}
                        {t.isMandatory === 1 && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.componentType} · {t.frequency}
                        {t.calculationType === "percentage"
                          ? ` · ${t.defaultRate}% of ${t.calculationBase === "gross_income" ? "gross" : "base"} salary`
                          : ` · ${Number(t.defaultAmount || 0).toLocaleString("vi-VN")} VND`}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Override Section — chỉ hiện khi đã chọn component */}
          {selected && (
            <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
              <p className="text-xs font-bold uppercase text-slate-500">Rate / Amount</p>

              {/* Toggle: dùng mặc định hay override */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={useDefault} onChange={() => setUseDefault(true)} className="accent-primary" />
                  <span>Use default
                    <span className="ml-1 font-bold text-primary">
                      {isPercentage
                        ? `(${selected.defaultRate}%)`
                        : `(${Number(selected.defaultAmount || 0).toLocaleString("vi-VN")} VND)`}
                    </span>
                  </span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={!useDefault} onChange={() => setUseDefault(false)} className="accent-primary" />
                  <span>Override for this employee</span>
                </label>
              </div>

              {/* Input override */}
              {!useDefault && (
                isPercentage ? (
                  <div className="relative">
                    <input
                      type="number" value={overrideRate} onChange={e => setOverrideRate(e.target.value)}
                      placeholder={`Default: ${selected.defaultRate}`}
                      min="0" max="100" step="0.01"
                      className="input w-full pr-8" required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                ) : (
                  <input
                    type="number" value={overrideAmount} onChange={e => setOverrideAmount(e.target.value)}
                    placeholder={`Default: ${Number(selected.defaultAmount || 0).toLocaleString("vi-VN")}`}
                    min="0" step="1000"
                    className="input w-full" required
                  />
                )
              )}

              {/* Preview info */}
              <p className="text-xs text-slate-400">
                Calculated amount sẽ được tính tự động khi save dựa trên base salary của nhân viên.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || !selected}
              className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50">
              {loading ? "Saving..." : "Assign Component"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
