import React from "react";

export default function CompensationTab() {
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
          <Row label="Salary Type" value="Monthly" />
          <Row
            label="Base Salary"
            value="12,000,000 VND"
            highlight
          />
          <Row label="Effective Date" value="01 Jan, 2024" />
          <Row label="Currency" value="VND (Vietnamese Dong)" />
        </Card>

        {/* Payroll Policy */}
        <Card
          title="Payroll Policy & OT Settings"
          icon="settings_applications"
        >
          <Row label="OT Rate" value="150% (Normal Working Day)" />
          <Row
            label="Insurance Scheme"
            value="Standard Social Insurance"
          />
          <div className="flex justify-between items-center py-1">
            <span className="text-sm text-slate-500">Tax Resident</span>
            <span className="flex items-center gap-1 text-sm font-bold text-green-600">
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              Yes
            </span>
          </div>
          <Row label="Payment Method" value="Bank Transfer" />
        </Card>
      </div>

      {/* ===== SALARY COMPONENTS ===== */}
      <Card title="Salary Components" icon="list_alt" noPadding>
        <Table
          headers={["Component Name", "Type", "Frequency", "Amount"]}
          rows={[
            [
              "Lunch Allowance",
              "Allowance",
              "Monthly",
              <Amount positive>730,000 VND</Amount>,
            ],
            [
              "Transport Allowance",
              "Allowance",
              "Monthly",
              <Amount positive>500,000 VND</Amount>,
            ],
            [
              "Fixed Deduction (Parking)",
              "Deduction",
              "Monthly",
              <Amount negative>-150,000 VND</Amount>,
            ],
          ]}
        />
      </Card>

      {/* ===== COMPENSATION HISTORY ===== */}
      <Card title="Compensation History" icon="history" noPadding>
        <Table
          headers={[
            "Effective Date",
            "Base Salary",
            "Change Type",
            "Status",
            "Action",
          ]}
          rows={[
            [
              "01 Jan, 2024",
              "12,000,000 VND",
              "Annual Review",
              <Status type="current" />,
              <Action />,
            ],
            [
              "01 Jan, 2023",
              "10,500,000 VND",
              "Promotion",
              <Status type="expired" />,
              <Action />,
            ],
            [
              "12 Oct, 2021",
              "9,000,000 VND",
              "Hiring Rate",
              <Status type="expired" />,
              <Action />,
            ],
          ]}
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
        className={`text-sm font-bold ${
          highlight ? "text-primary text-lg" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50">
            {headers.map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-xs font-bold uppercase text-slate-500 border-b text-left last:text-right"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-6 py-4 text-sm ${
                    j === row.length - 1 ? "text-right" : ""
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Amount({ children, positive, negative }) {
  return (
    <span
      className={`font-bold ${
        positive ? "text-green-600" : ""
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
