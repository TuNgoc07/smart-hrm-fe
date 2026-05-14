import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function CompensationTab() {
  const [compensationInfo, setCompensationInfo] = useState({});
  const [salaryComponents, setSalaryComponents] = useState([]);
  const [compensationsHistory, setCompensationsHistory] = useState([]);
  const { emp_id } = useParams();


  useEffect(() => async () => {
    const res = await fetch(`${API_BASE_URL}/api/hradmin/employee-compensation/${emp_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    const data = await res.json()
    if (data.status === 'success') {
      console.log(data.data)
      setCompensationInfo(data.data)
    }
  }, [emp_id])

  useEffect(() => async () => {
    if (!compensationInfo.planId) return;

    const res = await fetch(`${API_BASE_URL}/api/hradmin/employee-salary-components/${compensationInfo.planId}`,{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    const data = await res.json()
    if (data.status === 'success') {
      console.log(data.data)
      setSalaryComponents(data.data)
    }
  }, [compensationInfo.planId]);

  return (
    <div className="space-y-6 mt-6">
      {/* ===== TOP GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Compensation */}
        <Card
          title="Current Compensation"
          icon="payments"
          actionIcon="history"
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
          <Row label="OT Rate" value={compensationInfo?.otRate + "% (Normal Working Day)" || "unknown"} />
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

      {/* ===== SALARY COMPONENTS ===== */}
      <Card title="Salary Components" icon="list_alt" noPadding>
        <SalaryComponentTable
          headers={["Component Name", "Type", "Frequency", "Amount"]}
          salaryComponents={salaryComponents}
        />
      </Card>

      {/* ===== COMPENSATION HISTORY ===== */}
      <Card title="Compensation History" icon="history" noPadding>
        <CompensationHistoryTable
          headers={[
            "Effective Date",
            "Base Salary",
            "Change Type",
            "Status",
            "Action",
          ]}
          compensationsHistory={compensationsHistory}
        />
      </Card>
    </div>
  );
}

/* ================= REUSABLE UI ================= */

function Card({ title, icon, actionIcon, children, noPadding }) {
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
          <button className="text-primary hover:bg-primary/10 p-1 rounded">
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

function SalaryComponentTable({ headers, salaryComponents }) {
  return (

    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <TableHeader headers={headers} />
        </thead>
        <tbody className="divide-y divide-[#e7edf3] dark:divide-slate-800">
          {salaryComponents?.map((salaryComponent, index) => (
            <SalaryComponentRow
              key={index}
              salaryComponent={salaryComponent} />
          ))}
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

function SalaryComponentRow({ salaryComponent }) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm font-bold text-[#0d141b] dark:text-white">{salaryComponent?.componentName}</td>
      <td className="px-6 py-4 text-sm text-[#4c739a]">{salaryComponent?.componentType?.charAt(0).toUpperCase() + salaryComponent?.componentType?.slice(1)}</td>
      <td className="px-6 py-4 text-sm text-[#4c739a]">{salaryComponent?.frequency?.charAt(0).toUpperCase() + salaryComponent?.frequency?.slice(1)}</td>
      <td className={`px-6 py-4 text-sm font-bold ${salaryComponent?.componentType === 'deduction' ? "text-red-500" : "text-green-600"} text-right`}>
        {salaryComponent?.componentType === 'deduction' ? "-" : ""}
        {salaryComponent?.amount?.toLocaleString("vi-VN") + " vnd" || "Not have yet"}
      </td>
    </tr>
  );
}

function CompensationHistoryTable({ headers, compensationsHistory }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <TableHeader headers={headers} />
        </thead>
        <tbody className="divide-y divide-[#e7edf3] dark:divide-slate-800">

          {compensationsHistory?.map((compensationHistory, index) => (
            <CompensationHistoryRow
              key={index}
              compensationHistory={compensationHistory} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompensationHistoryRow({ compensationHistory }) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm font-bold text-[#0d141b] dark:text-white">01 Jan, 2024</td>
      <td className="px-6 py-4 text-sm text-[#0d141b] dark:text-white">12,000,000 VND</td>
      <td className="px-6 py-4 text-sm text-[#4c739a]">Annual Review</td>
      <td className="px-6 py-4 text-sm">
        <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Current</span>
      </td>
      <td className="px-6 py-4 text-right">
        <Action />
      </td>
    </tr>
  );
}
