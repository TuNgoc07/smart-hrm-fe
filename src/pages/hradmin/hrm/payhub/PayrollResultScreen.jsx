import { useState } from "react";
import PayrollDetailModal from "./PayrollDetailModal";

/* ================= MOCK DATA ================= */

const payrollData = [
  {
    id: "SE-10245",
    name: "Nguyen Van A",
    code: "SE-10245",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",

    baseSalary: 25000000,
    daysWorked: 22,
    totalDays: 22,
    otPay: 2450000,

    allowances: [{ label: "Allowance", amount: 1500000 }],
    deductions: [{ label: "Deduction", amount: 500000 }],
    otDetails: [
      {type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
      {type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
      {type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
    ],
    gross: 28950000,
    net: 24600000,
    status: "NORMAL",
    audit: {formula: "NetPay = (Base * (DaysWorked/TotalDays)) + OT_Pay + Allowances - Deductions - Insurance",
      attendanceFile: "Attendance_Oct_2025_SE1039.log"}
  },
  {
    id: "SE-10246",
    name: "Tran Thi B",
    code: "SE-10246",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",

    baseSalary: 32000000,
    daysWorked: 21,
    totalDays: 22,
    otPay: 5200000,

    allowances: [
      { label: "Meal Allowance", amount: 800000 },
      { label: "Transport Allowance", amount: 1000000 },
      { label: "Phone Allowance", amount: 200000 },
    ],
    deductions: [
      { label: "Unpaid Leave (1 day)", amount: 1454545 },
      { label: "Social Insurance (8%)", amount: 2560000 },
    ],
    otDetails: [
      {type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
      {type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
      {type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
    ],

    gross: 39200000,
    net: 33320000,
    status: "ADJUSTED",
    audit: {formula: "NetPay = (Base * (DaysWorked/TotalDays)) + OT_Pay + Allowances - Deductions - Insurance",
      attendanceFile: "Attendance_Oct_2025_SE1039.log"}
  },
];

/* ================= MAIN ================= */

export default function PayrollResultScreen() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  return (
    <div className="relative space-y-8 pb-40">

      {/* ===== HEADER ===== */}
      <Header />

      {/* ===== SUMMARY ===== */}
      <SummaryCards />

      {/* ===== FILTER BAR ===== */}
      <FilterBar />

      {/* ===== TABLE ===== */}
      <PayrollTable
        data={payrollData}
        onViewDetail={setSelectedEmployee}
      />


      {/* ===== FOOTER ACTION ===== */}
      <FooterAction />
      
      {/* MODAL */}
      {selectedEmployee && (
        <PayrollDetailModal
          data={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

    </div>
  );
}

/* ================= HEADER ================= */

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
        <span>Payroll</span> / <span className="font-bold text-slate-800">Result</span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold">Payroll Result</h1>
          <p className="text-slate-500 text-sm">Statement for October 2024</p>
        </div>

        <span className="px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          CALCULATED
        </span>
      </div>
    </div>
  );
}

/* ================= SUMMARY ================= */

function SummaryCards() {
  return (
    <div className="grid grid-cols-5 gap-4">
      <Summary label="Total Employees" value="120" />
      <Summary label="Total Payroll Cost" value="1.5B" trend="+2%" positive />
      <Summary label="OT Cost" value="45M" trend="-5%" />
      <Summary label="Deductions" value="12M" />
      <Summary label="Net Pay" value="1.2B" trend="+1.5%" positive />
    </div>
  );
}

function Summary({ label, value, trend, positive }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-xs uppercase text-slate-500 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <p className={`text-2xl font-extrabold ${positive ? "text-primary" : ""}`}>
          {value}
        </p>
        {trend && (
          <span className={`text-xs font-bold ${positive ? "text-green-600" : "text-red-600"}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

/* ================= FILTER ================= */

function FilterBar() {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary"
            placeholder="Search employee name or code..."
          />
        </div>

        <select className="bg-slate-100 rounded-lg px-4 py-2 text-sm">
          <option>Department: All</option>
        </select>

        <select className="bg-slate-100 rounded-lg px-4 py-2 text-sm">
          <option>Salary Range: All</option>
        </select>
      </div>

      <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold">
        <span className="material-symbols-outlined text-lg">download</span>
        Export
      </button>
    </div>
  );
}

/* ================= TABLE ================= */

function PayrollTable({ data, onViewDetail }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
          <tr>
            <Th>Employee</Th>
            <Th right>Base</Th>
            <Th center>Days</Th>
            <Th right>OT</Th>
            <Th right>Allow</Th>
            <Th right>Ded</Th>
            <Th right>Gross</Th>
            <Th right highlight>Net</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>

        <tbody className="divide-y">
          {data.map((emp) => (
            <PayrollRow
              key={emp.id}
              employee={emp}
              onViewDetail={onViewDetail}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}



function PayrollRow({ employee, onViewDetail }) {
  const allowanceTotal = employee.allowances.reduce(
    (s, a) => s + a.amount,
    0
  );
  const deductionTotal = employee.deductions.reduce(
    (s, d) => s + d.amount,
    0
  );

  return (
    <tr className="hover:bg-slate-50">
      <Td>
        <div className="flex items-center gap-3">
          <img
            src={employee.avatar}
            alt=""
            className="w-9 h-9 rounded-full"
          />
          <div>
            <p className="font-bold">{employee.name}</p>
            <p className="text-xs text-slate-500">{employee.code}</p>
          </div>
        </div>
      </Td>

      <Td right>{employee.baseSalary.toLocaleString()}</Td>
      <Td center>{employee.daysWorked}</Td>
      <Td right>{employee.otPay.toLocaleString()}</Td>
      <Td right>{allowanceTotal.toLocaleString()}</Td>
      <Td right>{deductionTotal.toLocaleString()}</Td>
      <Td right>{employee.gross.toLocaleString()}</Td>
      <Td right highlight>{employee.net.toLocaleString()}</Td>

      <Td>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            employee.status === "ADJUSTED"
              ? "bg-primary/20 text-primary"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {employee.status}
        </span>
      </Td>

      <Td right>
        <button
          onClick={() => onViewDetail(employee)}
          className="text-primary text-xs font-bold hover:underline"
        >
          View Detail
        </button>
      </Td>
    </tr>
  );
}


  

/* ================= FOOTER ================= */

function FooterAction() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-8 py-4 flex justify-between items-center z-20">
      <div>
        <p className="text-[10px] uppercase text-slate-500 font-bold">
          Total Net Pay Summary
        </p>
        <p className="font-bold">
          <span className="text-primary text-xl">1.2B VND</span> · 120 employees ready
        </p>
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-3 rounded-xl border font-bold">
          Re-calculate
        </button>
        <button className="px-8 py-3 rounded-xl bg-primary text-white font-extrabold flex items-center gap-2 shadow-lg">
          <span className="material-symbols-outlined">lock_open</span>
          Lock Payroll Period
        </button>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Th({ children, right, center, highlight }) {
  return (
    <th
      className={`px-4 py-3 ${
        right ? "text-right" : ""
      } ${center ? "text-center" : ""} ${
        highlight ? "text-primary" : ""
      }`}
    >
      {children}
    </th>
  );
}


function Td({ children, right, center, highlight }) {
  return (
    <td
      className={`px-4 py-3 ${
        right ? "text-right" : ""
      } ${center ? "text-center" : ""} ${
        highlight ? "text-primary font-bold" : ""
      }`}
    >
      {children}
    </td>
  );
}

