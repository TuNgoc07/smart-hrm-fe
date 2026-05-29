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
    remainingDays: "0",   // computed column từ DB
    autoCalculate: true  // flag to show auto-calculation UI
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [leavePolicies, setLeavePolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  /** Preview carry-over: mảng {policyId, policyName, remainingDays, carryOverDays, maxCarryOverDays} */
  const [carryOverPreview, setCarryOverPreview] = useState([]);
  const [loadingCarryOver, setLoadingCarryOver] = useState(false);

  /**
   * Fetch carry-over preview khi năm thay đổi ở create mode.
   * Gọi endpoint GET /api/hradmin/leave-balances/carry-over/employee/{id}?fromYear=(year-1)
   * để lấy số ngày dư năm trước sẽ được chuyển sang.
   */
  useEffect(() => {
    const loadCarryOverPreview = async () => {
      // Chỉ fetch preview ở create mode và khi có employeeId
      if (formData.balanceId || !formData.employeeId || !formData.year) return;
      setLoadingCarryOver(true);
      try {
        const fromYear = parseInt(formData.year) - 1; // năm trước để xem số dư
        const res = await fetch(
          `${API_BASE_URL}/api/hradmin/leave-balances/carry-over/employee/${formData.employeeId}?fromYear=${fromYear}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const data = await res.json();
        // Lưu preview list để hiển thị số ngày dự kiến carry over theo từng policy
        if (data.status === "success" && Array.isArray(data.data)) {
          setCarryOverPreview(data.data);
        } else {
          setCarryOverPreview([]);
        }
      } catch (err) {
        setCarryOverPreview([]); // lỗi mạng → ẩn preview, không block form
      } finally {
        setLoadingCarryOver(false);
      }
    };
    loadCarryOverPreview();
  }, [formData.year, formData.employeeId, formData.balanceId]);

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
        remainingDays: balanceData.remainingDays || "0",
        autoCalculate: false  // editing existing balance, manual mode
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
        remainingDays: "0",
        autoCalculate: true  // creating new balance, auto-calculate by default
      });
    }
  }, [balanceData, employeeId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Calculate prorated days for preview
  const calculateProratedDays = () => {
    if (!selectedPolicy || !formData.year || !formData.employeeId) return null;

    const daysPerYear = selectedPolicy.daysPerYear;
    const year = parseInt(formData.year);

    // This is a client-side estimation - actual calculation happens on backend
    // We'll show a preview based on hire date if available
    const hireDate = new Date(); // Placeholder - would need employee data
    const hireMonth = hireDate.getMonth() + 1; // 1-12

    const monthsRemaining = 12 - hireMonth + 1;
    const monthlyEntitlement = daysPerYear / 12;
    const proratedDays = (monthlyEntitlement * monthsRemaining).toFixed(2);

    return {
      full: daysPerYear,
      prorated: parseFloat(proratedDays),
      monthsRemaining
    };
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
            // Only send entitledDays if autoCalculate is false (manual override)
            ...(formData.autoCalculate ? {} : { entitledDays: parseFloat(formData.entitledDays) || 0 }),
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

          {/* Auto-calculate toggle (only for create mode) */}
          {!formData.balanceId && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                name="autoCalculate"
                id="autoCalculate"
                checked={formData.autoCalculate}
                onChange={handleChange}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label htmlFor="autoCalculate" className="text-sm font-medium text-slate-700 cursor-pointer">
                Auto-calculate based on hire date
              </label>
            </div>
          )}

          {/* Entitled Days */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Entitled Days {!formData.autoCalculate && "*"}
            </label>
            {formData.autoCalculate && !formData.balanceId ? (
              <div className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-green-50 text-green-700">
                {selectedPolicy ? (
                  <span className="text-sm">
                    Auto-calculated based on hire date and policy ({selectedPolicy.daysPerYear} days/year)
                  </span>
                ) : (
                  <span className="text-sm text-slate-500">Select a policy to see calculation</span>
                )}
              </div>
            ) : (
              <input
                type="number"
                name="entitledDays"
                value={formData.entitledDays}
                onChange={handleChange}
                placeholder="e.g., 12"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required={!formData.autoCalculate}
                min="0"
                step="0.5"
              />
            )}
            {selectedPolicy && formData.autoCalculate && !formData.balanceId && (
              <div className="mt-1 text-xs text-blue-600">
                System will automatically calculate prorated days based on employee's hire date
              </div>
            )}
            {selectedPolicy && !formData.autoCalculate && !formData.entitledDays && (
              <div className="mt-1 text-xs text-blue-600">
                Default from policy: {selectedPolicy.daysPerYear} days/year
                {/* Hiển thị giới hạn carry-over nếu policy có cấu hình */}
                {selectedPolicy.maxCarryOverDays != null && (
                  <span className="ml-2 text-amber-600">• Max carry-over: {selectedPolicy.maxCarryOverDays} days</span>
                )}
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
              {/* Nếu để 0 và create mode → backend sẽ tự động lấy số dư năm trước */}
              Để 0 để hệ thống tự động lấy số ngày dư từ năm trước
            </div>

            {/* Carry-Over Preview: hiển thị số ngày dự kiến sẽ được chuyển từ năm trước */}
            {!formData.balanceId && carryOverPreview.length > 0 && (
              <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-teal-600 text-[18px]">autorenew</span>
                  {/* Tiêu đề preview: cho biết đây là số ngày sẽ được chuyển tự động */}
                  <span className="text-xs font-bold text-teal-800">
                    Auto Carry-Over từ năm {parseInt(formData.year) - 1}
                    {loadingCarryOver && <span className="ml-1 text-teal-500">(loading...)</span>}
                  </span>
                </div>
                {carryOverPreview.map((item) => (
                  <div key={item.policyId} className="flex justify-between text-xs text-teal-700 py-1 border-b border-teal-100 last:border-0">
                    <span>{item.policyName}</span>
                    <span className="font-bold">
                      {/* Số ngày thực tế sẽ carry over (đã áp dụng giới hạn) */}
                      {item.carryOverDays} ngày
                      {/* Hiển thị giới hạn policy nếu số dư bị cắt */}
                      {item.maxCarryOverDays != null && parseFloat(item.remainingDays) > parseFloat(item.maxCarryOverDays) && (
                        <span className="ml-1 text-amber-600">(capped {item.maxCarryOverDays})</span>
                      )}
                    </span>
                  </div>
                ))}
                <div className="mt-1 text-xs text-teal-600">
                  {/* Chú thích: nhắc HR Admin về cơ chế tự động */}
                  Sẽ tự động điền nếu để Carried Over Days = 0
                </div>
              </div>
            )}
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
