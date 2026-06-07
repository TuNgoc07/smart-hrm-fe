import React, { useState, useEffect, useCallback } from "react";
import AddSalaryComponentModal from "./AddSalaryComponentModal";
import SalaryTierModal from "./SalaryTierModal";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/**
 * Payroll Configuration Screen — Tabbed layout
 *
 * Tab 1 — Salary Components:
 *   CRUD template toàn cục (allowance / deduction / bonus).
 *   Template này được gán cho từng nhân viên qua AssignComponentModal.
 *
 * Tab 2 — Salary Tiers:
 *   CRUD các bậc lương (Fresher, Junior, Senior…) với dải min/max salary.
 *   Được chọn khi tạo hợp đồng (NewContractModal).
 *
 * Tab 3 — OT & Statutory:
 *   Thông tin OT multiplier theo Điều 107 BLLĐ 2019 và tỉ lệ bảo hiểm.
 */

const TABS = [
  { key: "components", label: "Salary Components", icon: "list_alt" },
  { key: "tiers",      label: "Salary Tiers",      icon: "layers"   },
  { key: "statutory",  label: "OT & Statutory",    icon: "account_balance" },
];

export default function PayrollConfigurationScreen() {
  const [activeTab, setActiveTab] = useState("components");

  return (
    <div className="space-y-6 w-full">
      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold">Payroll Configuration</h2>
        <p className="text-sm text-slate-500 mt-1">
          Cấu hình toàn cục: salary component templates, bậc lương, và các quy định OT / bảo hiểm.
        </p>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeTab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "components" && <SalaryComponentsTab />}
      {activeTab === "tiers"      && <SalaryTiersTab />}
      {activeTab === "statutory"  && <StatutoryTab />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* TAB 1 — Salary Components                                                   */
/* ═══════════════════════════════════════════════════════════════════════════ */

function SalaryComponentsTab() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchComponents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/salary-components`, { headers: authH() });
      const data = await res.json();
      setComponents(data.status === "success" ? (data.data || []) : []);
    } catch {
      setComponents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchComponents(); }, [fetchComponents]);

  const handleDelete = async (id) => {
    if (!confirm("Xóa salary component này? (Sẽ không ảnh hưởng đến nhân viên đã được gán)")) return;
    await fetch(`${API_BASE_URL}/api/hradmin/salary-components/${id}`, {
      method: "DELETE", headers: authH(),
    });
    fetchComponents();
  };

  const openEdit   = (c) => { setEditTarget(c);    setModalOpen(true); };
  const openCreate = ()  => { setEditTarget(null); setModalOpen(true); };

  const earnings       = components.filter(c => c.category === "earnings");
  const deductions     = components.filter(c => c.category === "deductions");
  const employerContrib = components.filter(c => c.category === "employer_contributions");
  const uncategorized  = components.filter(c => !c.category);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          Định nghĩa các salary component toàn cục. Được nhóm theo: Earnings (thu nhập), Deductions (khấu trừ), Employer Contributions (công ty đóng). Sau đó gán cho từng nhân viên trong tab Compensation.
        </p>
        <button onClick={openCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 shrink-0">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add Component
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-5">
          <ComponentSection title="Earnings (Thu nhập)"      icon="payments"          iconColor="text-green-500"  components={earnings}       onEdit={openEdit} onDelete={handleDelete} emptyText="No earnings components configured." />
          <ComponentSection title="Deductions (Khấu trừ)"    icon="remove_moderator"    iconColor="text-red-500"    components={deductions}     onEdit={openEdit} onDelete={handleDelete} emptyText="No deduction components configured." />
          <ComponentSection title="Employer Contributions"   icon="business"           iconColor="text-blue-500"   components={employerContrib} onEdit={openEdit} onDelete={handleDelete} emptyText="No employer contribution components configured." />
          {uncategorized.length > 0 && (
            <ComponentSection title="Uncategorized (Chưa phân loại)" icon="help" iconColor="text-amber-500" components={uncategorized} onEdit={openEdit} onDelete={handleDelete} emptyText="" />
          )}
        </div>
      )}

      <AddSalaryComponentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editTarget}
        onSuccess={fetchComponents}
      />
    </div>
  );
}

function ComponentSection({ title, icon, iconColor, components, onEdit, onDelete, emptyText }) {
  return (
    <section className="bg-white rounded-xl border p-6">
      <div className="flex items-center mb-5">
        <span className={`material-symbols-outlined ${iconColor} mr-2`}>{icon}</span>
        <h3 className="text-base font-bold">{title}</h3>
        <span className="ml-2 text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5 font-bold">
          {components.length}
        </span>
      </div>
      {components.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          {components.map(c => <ComponentRow key={c.componentId} component={c} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      )}
    </section>
  );
}

function ComponentRow({ component: c, onEdit, onDelete }) {
  const isPercent = c.calculationType === "percentage";
  const isPerHour = c.calculationType === "per_hour";
  const isPerDay = c.calculationType === "per_day";
  const isProgressiveTax = c.calculationType === "progressive_tax";

  let valueLabel = "";
  if (isProgressiveTax) {
    valueLabel = "Biểu thuế lũy tiến (tự động)";
  } else if (isPercent) {
    valueLabel = `${c.defaultRate}% of ${c.calculationBase?.replace(/_/g, ' ') || "base salary"}`;
  } else if (isPerHour) {
    valueLabel = `${Number(c.defaultAmount || 0).toLocaleString("vi-VN")} VND/hour`;
  } else if (isPerDay) {
    valueLabel = `${Number(c.defaultAmount || 0).toLocaleString("vi-VN")} VND/day`;
  } else {
    valueLabel = `${Number(c.defaultAmount || 0).toLocaleString("vi-VN")} VND`;
  }

  const calcTypeLabel = isProgressiveTax ? "Tax" : isPercent ? "%" : isPerHour ? "/hr" : isPerDay ? "/day" : "Fixed";
  const calcTypeColor = isProgressiveTax ? "bg-violet-100 text-violet-700" : isPercent ? "bg-blue-100 text-blue-700" : isPerHour ? "bg-orange-100 text-orange-700" : isPerDay ? "bg-teal-100 text-teal-700" : "bg-emerald-100 text-emerald-700";

  return (
    <div className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition rounded-lg px-4 py-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${calcTypeColor}`}>
          {calcTypeLabel}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm truncate">{c.componentName}</p>
            {c.componentCode && (
              <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{c.componentCode}</span>
            )}
          </div>
          <p className="text-xs text-slate-500">{c.frequency} · {valueLabel}</p>
        </div>
        {c.isMandatory === 1 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">Mandatory</span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={() => onEdit(c)} className="p-1.5 rounded hover:bg-white text-slate-400 hover:text-primary transition">
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button onClick={() => onDelete(c.componentId)} className="p-1.5 rounded hover:bg-white text-slate-400 hover:text-red-500 transition">
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* TAB 2 — Salary Tiers                                                        */
/* ═══════════════════════════════════════════════════════════════════════════ */

function SalaryTiersTab() {
  const [tiers, setTiers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const fetchTiers = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE_URL}/api/hradmin/salary-tiers`, { headers: authH() });
      const data = await res.json();
      setTiers(data.status === "success" ? (data.data || []) : []);
    } catch {
      setTiers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTiers(); }, [fetchTiers]);

  const handleDelete = async (id) => {
    if (!confirm("Vô hiệu hóa salary tier này? Hợp đồng đang dùng tier này sẽ không bị ảnh hưởng.")) return;
    await fetch(`${API_BASE_URL}/api/hradmin/salary-tiers/${id}`, {
      method: "DELETE", headers: authH(),
    });
    fetchTiers();
  };

  const openEdit   = (t) => { setEditTarget(t);    setModalOpen(true); };
  const openCreate = ()  => { setEditTarget(null); setModalOpen(true); };

  const activeTiers   = tiers.filter(t => t.status !== "inactive");
  const inactiveTiers = tiers.filter(t => t.status === "inactive");

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <span className="material-symbols-outlined text-blue-500 shrink-0">info</span>
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-0.5">Salary Tiers là gì?</p>
          <p>Bậc lương định nghĩa dải lương min/max cho từng cấp bậc (Fresher, Junior, Senior…). Khi tạo hợp đồng, HR chọn tier phù hợp để ràng buộc mức lương vào khung quy định.</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          {activeTiers.length} tier đang hoạt động · {inactiveTiers.length} đã vô hiệu hóa
        </p>
        <button onClick={openCreate}
          className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 shrink-0">
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Add Tier
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">Loading...</div>
      ) : activeTiers.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 block mb-3">layers</span>
          <p className="font-bold text-slate-500 mb-1">Chưa có salary tier nào</p>
          <p className="text-sm text-slate-400 mb-4">Tạo ít nhất 1 tier trước khi tạo hợp đồng cho nhân viên.</p>
          <button onClick={openCreate}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90">
            Tạo Salary Tier đầu tiên
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Tier</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase text-slate-500">Min Salary</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase text-slate-500">Max Salary</th>
                <th className="px-5 py-3 text-center text-xs font-bold uppercase text-slate-500">OT Multiplier</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Description</th>
                <th className="px-5 py-3 text-center text-xs font-bold uppercase text-slate-500">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeTiers.map(t => (
                <TierRow key={t.tierId} tier={t} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SalaryTierModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editTarget}
        onSuccess={fetchTiers}
      />
    </div>
  );
}

function TierRow({ tier: t, onEdit, onDelete }) {
  const fmtVnd = (v) => v != null ? Number(v).toLocaleString("vi-VN") + " VND" : "—";
  const pct = Math.round(
    ((parseFloat(t.maxSalary) - parseFloat(t.minSalary)) / parseFloat(t.minSalary || 1)) * 100
  );
  return (
    <tr className="hover:bg-slate-50 transition">
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black bg-primary/10 text-primary px-2 py-0.5 rounded">{t.tierCode}</span>
          <span className="font-bold">{t.tierName}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-right font-bold text-green-700">{fmtVnd(t.minSalary)}</td>
      <td className="px-5 py-4 text-right font-bold text-blue-700">{fmtVnd(t.maxSalary)}</td>
      <td className="px-5 py-4 text-center">
        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">
          ×{t.otMultiplier ?? "1.5"}
        </span>
      </td>
      <td className="px-5 py-4 text-slate-500 text-xs max-w-[200px] truncate">{t.description || "—"}</td>
      <td className="px-5 py-4 text-center">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          t.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
        }`}>{t.status || "active"}</span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-1 justify-end">
          <button onClick={() => onEdit(t)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-primary transition">
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onClick={() => onDelete(t.tierId)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* TAB 3 — OT & Statutory Settings (Editable)                                  */
/* ═══════════════════════════════════════════════════════════════════════════ */

const STATUTORY_API = `${API_BASE_URL}/api/hradmin/payroll-statutory-config`;

function StatutoryTab() {
  const [configs, setConfigs]       = useState({});
  const [brackets, setBrackets]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [toast, setToast]           = useState(null);
  const [editBracket, setEditBracket] = useState(null);
  const [showBracketForm, setShowBracketForm] = useState(false);
  const [validation, setValidation] = useState(null); // { valid, issues, missingKeys, pitBracketsCount }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [res, valRes] = await Promise.all([
        fetch(STATUTORY_API, { headers: authH() }),
        fetch(`${STATUTORY_API}/validation`, { headers: authH() }),
      ]);
      const data    = await res.json();
      const valData = await valRes.json();
      if (data.status === "success") {
        const map = {};
        (data.configs || []).forEach(c => { map[c.configKey] = c.configValue; });
        setConfigs(map);
        setBrackets(data.pitBrackets || []);
      }
      if (valData.status === "success") setValidation(valData);
    } catch { showToast("Lỗi tải cấu hình", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const saveConfigs = async (keys) => {
    setSaving(true);
    try {
      const body = {};
      keys.forEach(k => { body[k] = configs[k]; });
      const res  = await fetch(STATUTORY_API, { method: "PUT", headers: { ...authH(), "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.status === "success") showToast("Đã lưu cấu hình thành công ✓");
      else showToast("Lưu thất bại: " + (data.message || ""), "error");
    } catch { showToast("Lỗi kết nối server", "error"); }
    finally { setSaving(false); }
  };

  const handleChange = (key, val) => setConfigs(prev => ({ ...prev, [key]: val }));

  const deleteBracket = async (id) => {
    if (!confirm("Xóa bậc thuế này?")) return;
    await fetch(`${STATUTORY_API}/pit-brackets/${id}`, { method: "DELETE", headers: authH() });
    showToast("Đã xóa bậc thuế");
    fetchAll();
  };

  const saveBracket = async (form) => {
    const isEdit = form.bracketId != null;
    const url    = isEdit ? `${STATUTORY_API}/pit-brackets/${form.bracketId}` : `${STATUTORY_API}/pit-brackets`;
    const method = isEdit ? "PUT" : "POST";
    const body   = { bracketOrder: Number(form.bracketOrder), lowerLimit: Number(form.lowerLimit), upperLimit: form.upperLimit !== "" ? Number(form.upperLimit) : null, taxRate: Number(form.taxRate) / 100 };
    await fetch(url, { method, headers: { ...authH(), "Content-Type": "application/json" }, body: JSON.stringify(body) });
    showToast(isEdit ? "Đã cập nhật bậc thuế" : "Đã thêm bậc thuế");
    setShowBracketForm(false);
    setEditBracket(null);
    fetchAll();
  };

  if (loading) return <div className="flex justify-center py-24 text-slate-400">Đang tải cấu hình...</div>;

  const fmtVnd = (v) => v != null ? Number(v).toLocaleString("vi-VN") : "∞";
  const totalEmp = (parseFloat(configs.bhxh_employee_rate || 0) + parseFloat(configs.bhyt_employee_rate || 0) + parseFloat(configs.bhtn_employee_rate || 0)).toFixed(1);
  const totalEmp2 = (parseFloat(configs.bhxh_employer_rate || 0) + parseFloat(configs.bhyt_employer_rate || 0) + parseFloat(configs.bhtn_employer_rate || 0)).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-bold text-white text-sm ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Payroll Config Readiness Banner ── */}
      {validation && (
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${
          validation.valid
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }`}>
          <span className={`material-symbols-outlined text-[22px] flex-shrink-0 mt-0.5 ${validation.valid ? "text-green-500" : "text-red-500"}`}>
            {validation.valid ? "check_circle" : "error"}
          </span>
          <div className="flex-1">
            {validation.valid ? (
              <>
                <p className="font-bold text-green-800 text-sm">Cấu hình pháp lý đầy đủ — Sẵn sàng run payroll</p>
                <p className="text-xs text-green-700 mt-0.5">
                  Đủ {validation.configuredCount}/{validation.requiredKeysCount} config keys · {validation.pitBracketsCount} PIT brackets đang active.
                  Logic tính lương sẽ đọc 100% từ database, không có giá trị nào hardcode.
                </p>
              </>
            ) : (
              <>
                <p className="font-bold text-red-800 text-sm">Cấu hình pháp lý chưa đầy đủ — Payroll sẽ bị block</p>
                <ul className="text-xs text-red-700 mt-1 space-y-0.5">
                  {(validation.issues || []).map((issue, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="material-symbols-outlined text-[12px] mt-0.5">arrow_right</span>
                      {issue}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-red-600 mt-2 font-medium">
                  Cập nhật các mục còn thiếu bên dưới rồi lưu trước khi chạy lương.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Bảo hiểm ── */}
      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_balance</span>
            Tỷ lệ Bảo hiểm Bắt buộc
          </h3>
          <button onClick={() => saveConfigs(["bhxh_employee_rate","bhyt_employee_rate","bhtn_employee_rate","bhxh_employer_rate","bhyt_employer_rate","bhtn_employer_rate"])}
            disabled={saving}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">save</span>
            Lưu
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">Loại bảo hiểm</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Công ty đóng (%)</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Nhân viên đóng (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                { label: "BHXH (Social Insurance)",       empKey: "bhxh_employer_rate", eeeKey: "bhxh_employee_rate", empColor: "text-red-600",    eeeColor: "text-red-500"    },
                { label: "BHYT (Health Insurance)",       empKey: "bhyt_employer_rate", eeeKey: "bhyt_employee_rate", empColor: "text-orange-600", eeeColor: "text-orange-500" },
                { label: "BHTN (Unemployment Insurance)", empKey: "bhtn_employer_rate", eeeKey: "bhtn_employee_rate", empColor: "text-yellow-600", eeeColor: "text-yellow-500" },
              ].map(row => (
                <tr key={row.label} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{row.label}</td>
                  <td className="px-4 py-3 text-center">
                    <input type="number" step="0.1" min="0" max="100"
                      value={configs[row.empKey] ?? ""}
                      onChange={e => handleChange(row.empKey, e.target.value)}
                      className={`w-20 text-center border rounded-lg px-2 py-1 font-bold ${row.empColor} focus:outline-none focus:ring-2 focus:ring-primary/30`} />
                    <span className="ml-1 text-slate-400 text-xs">%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input type="number" step="0.1" min="0" max="100"
                      value={configs[row.eeeKey] ?? ""}
                      onChange={e => handleChange(row.eeeKey, e.target.value)}
                      className={`w-20 text-center border rounded-lg px-2 py-1 font-bold ${row.eeeColor} focus:outline-none focus:ring-2 focus:ring-primary/30`} />
                    <span className="ml-1 text-slate-400 text-xs">%</span>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold">
                <td className="px-4 py-3">Tổng</td>
                <td className="px-4 py-3 text-center text-primary">{totalEmp2}%</td>
                <td className="px-4 py-3 text-center text-primary">{totalEmp}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3">* Lương đóng BH tối đa = 20 × mức lương cơ sở. Thay đổi có hiệu lực từ kỳ lương tiếp theo.</p>
      </section>

      {/* ── OT Rates ── */}
      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">schedule</span>
            Tỷ lệ OT Mặc định (Điều 107 BLLĐ 2019)
          </h3>
          <button onClick={() => saveConfigs(["ot_rate_normal","ot_rate_weekend","ot_rate_holiday"])}
            disabled={saving}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">save</span>
            Lưu
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-5">
          Tỷ lệ OT mặc định khi employee chưa có compensation plan riêng. Tối thiểu theo luật: Thường ≥150%, Nghỉ ≥200%, Lễ ≥300%.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Ngày thường (Mon–Sat)", key: "ot_rate_normal",  color: "border-amber-200 bg-amber-50", textColor: "text-amber-700", min: 150 },
            { label: "Ngày nghỉ T7/CN",       key: "ot_rate_weekend", color: "border-blue-200 bg-blue-50",   textColor: "text-blue-700",   min: 200 },
            { label: "Ngày lễ / Tết",          key: "ot_rate_holiday", color: "border-red-200 bg-red-50",     textColor: "text-red-700",    min: 300 },
          ].map(item => (
            <div key={item.key} className={`rounded-xl border p-5 ${item.color}`}>
              <p className="text-xs font-bold uppercase text-slate-500 mb-3">{item.label}</p>
              <div className="flex items-end gap-2">
                <input type="number" step="1" min={item.min}
                  value={configs[item.key] ?? item.min}
                  onChange={e => handleChange(item.key, e.target.value)}
                  className={`w-24 text-3xl font-black text-center bg-transparent border-b-2 border-current focus:outline-none ${item.textColor}`} />
                <span className={`text-xl font-bold mb-1 ${item.textColor}`}>%</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Tối thiểu {item.min}% theo luật</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Giảm trừ & Cài đặt chung ── */}
      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-green-600">tune</span>
            Giảm trừ PIT & Cài đặt chung
          </h3>
          <button onClick={() => saveConfigs(["personal_deduction","dependent_deduction","standard_days","standard_hours"])}
            disabled={saving}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">save</span>
            Lưu
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: "Giảm trừ bản thân", key: "personal_deduction",  suffix: "VND/tháng",    note: "Theo TT 111/2013 (2024: 11,000,000)" },
            { label: "Giảm trừ người phụ thuộc", key: "dependent_deduction", suffix: "VND/người/tháng", note: "Theo TT 111/2013 (2024: 4,400,000)" },
            { label: "Ngày làm việc chuẩn",   key: "standard_days",   suffix: "ngày/tháng",   note: "Mẫu số tính lương ngày công (default 26)" },
            { label: "Giờ làm chuẩn",          key: "standard_hours",  suffix: "giờ/tháng",    note: "Mẫu số tính hourly rate (default 208)" },
          ].map(item => (
            <div key={item.key} className="bg-slate-50 rounded-xl p-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{item.label}</label>
              <div className="flex items-center gap-2">
                <input type="number" min="0"
                  value={configs[item.key] ?? ""}
                  onChange={e => handleChange(item.key, e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <span className="text-xs text-slate-400 shrink-0">{item.suffix}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PIT Brackets ── */}
      <section className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-violet-500">receipt_long</span>
            Biểu thuế TNCN Lũy tiến (Điều 22 Luật Thuế TNCN)
          </h3>
          <button onClick={() => { setEditBracket(null); setShowBracketForm(true); }}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            Thêm bậc
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500 w-16">Bậc</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Từ (VND)</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Đến (VND)</th>
                <th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Thuế suất</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {brackets.map((b, i) => (
                <tr key={b.bracketId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-center font-bold text-slate-500">Bậc {b.bracketOrder}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">{fmtVnd(b.lowerLimit)} ₫</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700">{b.upperLimit != null ? fmtVnd(b.upperLimit) + " ₫" : "∞ (không giới hạn)"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full text-sm">
                      {(parseFloat(b.taxRate) * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => { setEditBracket(b); setShowBracketForm(true); }}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-primary">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => deleteBracket(b.bracketId)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          * taxRate lưu dạng thập phân (0.05 = 5%). Thứ tự bậc phải liên tục từ thấp đến cao.
        </p>
      </section>

      {/* ── PIT Bracket Form Modal ── */}
      {showBracketForm && (
        <BracketFormModal
          initialData={editBracket}
          onClose={() => { setShowBracketForm(false); setEditBracket(null); }}
          onSave={saveBracket}
          nextOrder={brackets.length + 1}
        />
      )}
    </div>
  );
}

function BracketFormModal({ initialData, onClose, onSave, nextOrder }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState({
    bracketId:    initialData?.bracketId    ?? null,
    bracketOrder: initialData?.bracketOrder ?? nextOrder,
    lowerLimit:   initialData?.lowerLimit   ?? "",
    upperLimit:   initialData?.upperLimit   ?? "",
    taxRate:      initialData ? (parseFloat(initialData.taxRate) * 100).toFixed(0) : "",
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold">{isEdit ? "Chỉnh sửa" : "Thêm"} bậc thuế TNCN</h3>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-slate-100">
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Thứ tự bậc</label>
            <input type="number" min="1" value={form.bracketOrder} onChange={e => set("bracketOrder", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ngưỡng dưới (VND)</label>
            <input type="number" min="0" value={form.lowerLimit} onChange={e => set("lowerLimit", e.target.value)}
              placeholder="Ví dụ: 5000000"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ngưỡng trên (VND) <span className="text-slate-400 font-normal normal-case">— để trống nếu không giới hạn</span></label>
            <input type="number" min="0" value={form.upperLimit} onChange={e => set("upperLimit", e.target.value)}
              placeholder="Để trống = ∞"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Thuế suất (%)</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" max="100" step="1" value={form.taxRate} onChange={e => set("taxRate", e.target.value)}
                placeholder="Ví dụ: 5"
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <span className="text-slate-500 font-bold">%</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Nhập % (ví dụ: 5 → lưu 0.05 vào DB)</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border font-bold text-slate-500 hover:bg-slate-50">
            Hủy
          </button>
          <button onClick={() => onSave(form)}
            className="flex-1 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90">
            {isEdit ? "Cập nhật" : "Thêm bậc"}
          </button>
        </div>
      </div>
    </div>
  );
}
