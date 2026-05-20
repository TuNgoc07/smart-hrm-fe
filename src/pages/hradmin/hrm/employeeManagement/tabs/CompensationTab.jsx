import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditCompensationModal from "../EditCompensationModal";
import AssignComponentModal from "../AssignComponentModal";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function CompensationTab() {
  const [compensationInfo, setCompensationInfo] = useState({});
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [compensationsHistory, setCompensationsHistory] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false); // Phase 2
  const { emp_id } = useParams();

  // ── Fetch active compensation plan của nhân viên ──────────────────
  const fetchCompensation = async () => {
    const res = await fetch(`${API_BASE_URL}/api/hradmin/employee-compensation/${emp_id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setCompensationInfo(data.status === 'success' ? data.data : {});
  };

  // ── Fetch salary components gán cho plan hiện tại ─────────────────
  const fetchSalaryComponents = async (planId) => {
    const res = await fetch(`${API_BASE_URL}/api/hradmin/employee-salary-components/${planId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setSalaryComponents(data.status === 'success' ? (data.data || []) : []);
  };

  // ── Phase 3: Fetch lịch sử thay đổi lương ───────────────────────
  const fetchHistory = async () => {
    const res = await fetch(`${API_BASE_URL}/api/hradmin/employees/${emp_id}/compensation-history`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await res.json();
    setCompensationsHistory(data.status === 'success' ? (data.data || []) : []);
  };

  useEffect(() => {
    fetchCompensation();
    fetchHistory(); // Phase 3: load history ngay khi mount
  }, [emp_id]);

  useEffect(() => {
    if (compensationInfo.planId) fetchSalaryComponents(compensationInfo.planId);
  }, [compensationInfo.planId]);

  // Phase 2: Gỡ bỏ 1 salary component assignment
  const handleRemoveComponent = async (assignmentId) => {
    if (!confirm('Gỡ bỏ salary component này khỏi nhân viên?')) return;
    await fetch(`${API_BASE_URL}/api/hradmin/employee-salary-components/${assignmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    fetchSalaryComponents(compensationInfo.planId);
  };

  // Refresh sau khi edit/create compensation plan hoặc assign component
  const handleCompensationSuccess = () => {
    fetchCompensation();
    fetchHistory(); // Phase 3: cập nhật history khi thay đổi lương
    setIsEditModalOpen(false);
  };

  const handleAssignSuccess = () => {
    if (compensationInfo.planId) fetchSalaryComponents(compensationInfo.planId);
    setIsAssignModalOpen(false);
  };

  return (
    <div className="space-y-6 mt-6">
      {/* ===== TOP GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Compensation */}
        <Card
          title="Current Compensation"
          icon="payments"
          actionIcon={compensationInfo?.planId ? "edit" : "add"}
          onActionClick={() => setIsEditModalOpen(true)}
        >
          <Row
            label="Salary Type"
            value={compensationInfo?.salaryType?.charAt(0).toUpperCase() + compensationInfo?.salaryType?.slice(1) || "Monthly"}
          />

          <Row
            label="Base Salary"
            value={compensationInfo?.baseSalary?.toLocaleString("vi-VN") + " vnd" || "Not have yet"}
            highlight
          />
          <Row label="Effective Date" value={compensationInfo?.effectiveDate || "unknown"} />
          <Row label="Currency" value={compensationInfo?.currency + " (Vietnamese Dong)" || ""} />
        </Card>

        {/* Payroll Policy */}
        <Card
          title="Payroll Policy & OT Settings"
          icon="settings_applications"
        >
          {/* OT 3 tiers theo Điều 107 BLLĐ 2019 */}
          <div className="py-1">
            <p className="text-xs font-bold uppercase text-slate-400 mb-2">OT Rates (Điều 107 BLLĐ)</p>
            <div className="grid grid-cols-3 gap-2">
              <OTBadge label="Ngày thường" value={compensationInfo?.otRate} min={150} />
              <OTBadge label="Ngày nghỉ" value={compensationInfo?.otRateWeekend} min={200} />
              <OTBadge label="Lễ / Tết" value={compensationInfo?.otRateHoliday} min={300} />
            </div>
          </div>
          <Row
            label="Insurance Scheme"
            value={(compensationInfo?.insuranceScheme || "").replace(/_/g, " ")
              .replace(/\b\w/g, c => c.toUpperCase())}
          />

          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-slate-500">Tax Resident</span>
            <span className="flex items-center gap-1 text-sm font-bold text-green-600">
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              {compensationInfo?.taxResident == 1 ? "Yes" : "No"}
            </span>
          </div>

          <Row label="Payment Method" value={(compensationInfo?.paymentMethod || "").replace(/_/g, " ")
            .replace(/\b\w/g, c => c.toUpperCase())} />
        </Card>
      </div>

      {/* ===== SALARY COMPONENTS — Phase 2 ===== */}
      {/* Pipeline: "+ Add" mở AssignComponentModal → chọn template → backend tính calculatedAmount */}
      <Card
        title="Salary Components"
        icon="list_alt"
        noPadding
        actionIcon={compensationInfo?.planId ? "add" : null}
        onActionClick={() => setIsAssignModalOpen(true)}
        actionTooltip="Assign salary component to this employee"
      >
        <SalaryComponentTable
          salaryComponents={salaryComponents}
          onRemove={handleRemoveComponent}
        />
      </Card>

      {/* ===== COMPENSATION HISTORY — Phase 3 ===== */}
      {/* Pipeline: Mỗi lần tạo/update plan → backend ghi history → đây fetch và hiển thị */}
      <Card title="Compensation History" icon="history" noPadding>
        <CompensationHistoryTable compensationsHistory={compensationsHistory} />
      </Card>

      {/* Modal: Tạo mới hoặc Edit compensation plan */}
      <EditCompensationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        compensationData={compensationInfo}
        employeeId={emp_id}
        onSuccess={handleCompensationSuccess}
      />

      {/* Modal: Gán salary component vào plan của nhân viên — Phase 2 */}
      <AssignComponentModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        planId={compensationInfo?.planId}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}

/* ================= REUSABLE UI ================= */

function Card({ title, icon, actionIcon, onActionClick, children, noPadding }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            {icon}
          </span>
          {title}
        </h3>
        {actionIcon && (
          <button onClick={onActionClick} className="text-primary hover:bg-primary/10 p-1 rounded">
            <span className="material-symbols-outlined text-[18px]">
              {actionIcon}
            </span>
          </button>
        )}
      </div>

      <div className={noPadding ? "" : "p-6 space-y-3"}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-sm font-bold ${highlight ? "text-primary text-lg" : ""
          }`}
      >
        {value}
      </span>
    </div>
  );
}

function SalaryComponentTable({ salaryComponents, onRemove }) {
  const headers = ["Component", "Type", "Frequency", "Rate / Amount", "Calculated", ""];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead><TableHeader headers={headers} /></thead>
        <tbody className="divide-y divide-[#e7edf3]">
          {(!salaryComponents || salaryComponents.length === 0) ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-400">
                No salary components assigned. Click "+" to add.
              </td>
            </tr>
          ) : (
            salaryComponents.map((sc) => (
              <SalaryComponentRow key={sc.assignmentId || sc.componentId} salaryComponent={sc} onRemove={onRemove} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function TableHeader({ headers }) {
  return (
    <tr className="bg-slate-50 dark:bg-slate-800/30">
      {headers?.map((header, i) => (
        <th key={i} className={`px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#4c739a] border-b border-[#e7edf3] dark:border-slate-800 ${headers[i] === headers[headers.length - 1] ? "text-right" : ""} `}>{header}</th>
      ))}
      {/* <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#4c739a] border-b border-[#e7edf3] dark:border-slate-800">Type</th>
      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#4c739a] border-b border-[#e7edf3] dark:border-slate-800">Frequency</th>
      <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#4c739a] border-b border-[#e7edf3] dark:border-slate-800 text-right">Amount</th> */}
    </tr>
  );
}

function Amount({ children, positive, negative }) {
  return (
    <span
      className={`font-bold ${positive ? "text-green-600" : ""
        } ${negative ? "text-red-500" : ""}`}
    >
      {children}
    </span>
  );
}

function Status({ type }) {
  const styles =
    type === "current"
      ? "bg-green-100 text-green-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${styles}`}
    >
      {type}
    </span>
  );
}

function Action() {
  return (
    <button className="text-primary hover:bg-primary/10 p-1 rounded">
      <span className="material-symbols-outlined text-[18px]">
        visibility
      </span>
    </button>
  );
}

/**
 * Row hiển thị 1 salary component đã gán cho nhân viên.
 * Luôn dùng calculatedAmount để hiển thị số tiền thực tế.
 * Nếu component là %, hiện badge % với effective rate.
 */
function SalaryComponentRow({ salaryComponent: sc, onRemove }) {
  const isDeduction = sc?.componentType === 'deduction';
  const isPercent = sc?.isPercentage === 1;
  const isOverride = sc?.useDefaultRate === 0;

  // Hiển thị rate/amount nguồn gốc
  const rateLabel = isPercent
    ? `${sc?.percentageValue ?? sc?.defaultRate}%`
    : `${Number(sc?.amount || sc?.defaultAmount || 0).toLocaleString('vi-VN')} VND`;

  // Số tiền thực tế được tính toán (calculatedAmount)
  const calculatedLabel = sc?.calculatedAmount != null
    ? Number(sc.calculatedAmount).toLocaleString('vi-VN') + ' VND'
    : 'N/A';

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4">
        <p className="text-sm font-bold text-[#0d141b]">{sc?.componentName}</p>
        {isOverride && <span className="text-xs text-amber-600 font-bold">Override</span>}
      </td>
      <td className="px-6 py-4 text-sm text-[#4c739a] capitalize">{sc?.componentType}</td>
      <td className="px-6 py-4 text-sm text-[#4c739a] capitalize">{sc?.frequency}</td>
      <td className="px-6 py-4">
        {/* Badge: % hoặc fixed */}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          isPercent ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {isPercent ? `${rateLabel} of salary` : rateLabel}
        </span>
      </td>
      <td className={`px-6 py-4 text-sm font-bold text-right ${
        isDeduction ? 'text-red-500' : 'text-green-600'
      }`}>
        {isDeduction ? '-' : '+'}{calculatedLabel}
      </td>
      <td className="px-6 py-4 text-right">
        <button onClick={() => onRemove(sc?.assignmentId)}
          className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition">
          <span className="material-symbols-outlined text-[16px]">remove_circle</span>
        </button>
      </td>
    </tr>
  );
}

/**
 * Phase 3: Bảng lịch sử thay đổi lương.
 * Data đến từ API /employees/{id}/compensation-history.
 * Backend tự ghi khi tạo mới hoặc update base salary.
 */
function CompensationHistoryTable({ compensationsHistory }) {
  const headers = ["Effective Date", "Base Salary", "Change", "Type", "Created At"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead><TableHeader headers={headers} /></thead>
        <tbody className="divide-y divide-[#e7edf3]">
          {(!compensationsHistory || compensationsHistory.length === 0) ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-400">
                No compensation history yet.
              </td>
            </tr>
          ) : (
            compensationsHistory.map((h) => (
              <CompensationHistoryRow key={h.historyId} history={h} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/** 1 row trong history: hiển thị salary + chênh lệch + badge changeType */
function CompensationHistoryRow({ history: h }) {
  const diff = h.salaryDifference;
  const changeTypeStyles = {
    new:          'bg-blue-100 text-blue-700',
    increase:     'bg-green-100 text-green-700',
    decrease:     'bg-red-100 text-red-700',
    promotion:    'bg-purple-100 text-purple-700',
    annual_review:'bg-amber-100 text-amber-700',
  };
  const badgeStyle = changeTypeStyles[h.changeType] || 'bg-slate-100 text-slate-600';

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 text-sm font-bold text-[#0d141b]">
        {h.effectiveDate || '—'}
      </td>
      <td className="px-6 py-4 text-sm font-bold text-primary">
        {Number(h.baseSalary || 0).toLocaleString('vi-VN')} VND
      </td>
      <td className="px-6 py-4 text-sm">
        {diff != null ? (
          <span className={diff >= 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
            {diff >= 0 ? '+' : ''}{Number(diff).toLocaleString('vi-VN')} VND
          </span>
        ) : <span className="text-slate-400">—</span>}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${badgeStyle}`}>
          {h.changeType?.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-slate-400">
        {h.createdAt ? h.createdAt.substring(0, 10) : '—'}
      </td>
    </tr>
  );
}

/**
 * Hiển thị 1 OT tier badge.
 * Màu xanh nếu đúng luật (value >= min), đỏ nếu vi phạm.
 */
function OTBadge({ label, value, min }) {
  const rate = parseFloat(value) || min;
  const compliant = rate >= min;
  return (
    <div className={`rounded-lg p-2 text-center border ${
      compliant ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }`}>
      <p className="text-[10px] text-slate-500 font-bold uppercase leading-tight">{label}</p>
      <p className={`text-base font-bold ${compliant ? 'text-green-700' : 'text-red-600'}`}>
        {rate}%
      </p>
      {!compliant && (
        <p className="text-[9px] text-red-500">Min {min}%</p>
      )}
    </div>
  );
}
