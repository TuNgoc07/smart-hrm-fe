import { useState } from "react";
import AttendanceAdjustModal from "./AttendanceAdjustModal";

/* ================= MAIN SCREEN ================= */

export default function AttendanceRecordScreen() {
    const [adjustingRecord, setAdjustingRecord] = useState(null);

  return (
    <div className="mx-auto space-y-6">

      {/* TOP BAR */}
      <TopBar />

      {/* STATS */}
      <StatsGrid />

      {/* FILTER BAR */}
      <FilterBar />

      {/* TABLE */}
      <AttendanceTable onEdit = {setAdjustingRecord}/>

      {/* BOTTOM STATUS */}
      <BottomStatus />

      {adjustingRecord && (
            <AttendanceAdjustModal
                data={adjustingRecord}
                onClose={() => setAdjustingRecord(null)}
            />
        )}

    </div>
  );
}

/* ================= TOP BAR ================= */

function TopBar() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow-sm">
          <span className="material-symbols-outlined text-slate-500">
            calendar_month
          </span>
          <select className="bg-transparent border-none text-lg font-bold focus:ring-0 pr-6">
            <option>October 2024</option>
            <option>September 2024</option>
            <option>August 2024</option>
          </select>
        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border uppercase tracking-wider">
          <span className="size-2 bg-amber-500 rounded-full mr-2 animate-pulse" />
          Reviewing
        </span>
      </div>

      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <span className="material-symbols-outlined !text-lg">info</span>
        Last updated 5 mins ago
      </div>
    </div>
  );
}

/* ================= STATS ================= */

function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <StatCard label="Total Employees" value="1,240" icon="groups" />
      <StatCard label="Missing Records" value="3" icon="error_outline" danger />
      <StatCard label="Late / Early" value="42" icon="schedule" warning />
      <StatCard label="OT Pending" value="18" icon="more_time" orange />
      <StatCard label="Exceptions" value="7" icon="warning" purple />
    </div>
  );
}

function StatCard({ label, value, icon, danger, warning, orange, purple }) {
  const color =
    danger
      ? "text-red-600"
      : warning
      ? "text-amber-600"
      : orange
      ? "text-orange-600"
      : purple
      ? "text-purple-600"
      : "text-slate-900";

  const iconColor =
    danger
      ? "text-red-500"
      : warning
      ? "text-amber-500"
      : orange
      ? "text-orange-500"
      : purple
      ? "text-purple-500"
      : "text-primary";

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">
          {label}
        </span>
        <span className={`material-symbols-outlined ${iconColor}`}>
          {icon}
        </span>
      </div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
    </div>
  );
}

/* ================= FILTER BAR ================= */

function FilterBar() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="flex flex-col lg:flex-row justify-between gap-4">

        <div className="flex flex-wrap items-center gap-4 flex-1">
          <SearchInput />

          <select className="h-10 px-3 border rounded-lg text-sm bg-white">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Operations</option>
          </select>

          <StatusFilters />
        </div>

        <div className="flex items-center gap-3">
          <ActionBtn icon="download" label="Export" />
          <ActionBtn icon="rule_settings" label="Bulk Adjust" primary />
        </div>
      </div>
    </div>
  );
}

function SearchInput() {
  return (
    <div className="relative w-full max-w-xs">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        search
      </span>
      <input
        placeholder="Search name or ID..."
        className="w-full pl-10 pr-4 h-10 border rounded-lg text-sm"
      />
    </div>
  );
}

function StatusFilters() {
  return (
    <div className="flex items-center gap-2">
      <Tag label="Normal" />
      <Tag label="Missing" danger />
      <Tag label="Late" warning />
      <Tag label="OT" primary />
    </div>
  );
}

function Tag({ label, danger, warning, primary }) {
  const style =
    danger
      ? "bg-red-50 text-red-600 border-red-200"
      : warning
      ? "bg-amber-50 text-amber-600 border-amber-200"
      : primary
      ? "bg-blue-50 text-primary border-blue-200"
      : "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <button
      className={`px-3 h-8 rounded-full text-xs font-bold border ${style}`}
    >
      {label}
    </button>
  );
}

function ActionBtn({ icon, label, primary }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
        primary
          ? "bg-primary text-white hover:bg-blue-600"
          : "bg-white border hover:bg-slate-50"
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </button>
  );
}

/* ================= TABLE ================= */

function AttendanceTable({onEdit}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-500">
          <tr>
            <Th>Employee</Th>
            <Th>Date</Th>
            <Th>Check-in</Th>
            <Th>Check-out</Th>
            <Th>Work Hours</Th>
            <Th>OT Hours</Th>
            <Th center>Status</Th>
            <Th center>Exception</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>

        <tbody className="divide-y">
        <AttendanceRow
            data={{
              name: "Alex Johnson",
              empId: "EMP-4822",
              avatar: "https://randomuser.me/api/portraits/men/45.jpg",
              date: "Oct 24, 2024",
              checkIn: "08:55 AM",
              checkOut: "06:05 PM",
              work: "9h 10m",
              ot: "1h 10m",
              status: "On-time",
            }}
            onEdit={onEdit}
          />

          <AttendanceRow
            danger
            exception
            data={{
              name: "James Wilson",
              empId: "EMP-5044",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              date: "Oct 24, 2024",
              checkIn: "08:50 AM",
              checkOut: "MISSING",
              status: "Missing CO",
            }}
            onEdit={onEdit}
          />
          <AttendanceRow
            danger
            data={{
              name: "James Wilson",
              empId: "EMP-5044",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              date: "Oct 24, 2024",
              checkIn: "08:50 AM",
              checkOut: "MISSING",
              status: "Late",
            }}
            onEdit={onEdit}
          />
          <AttendanceRow
            danger
            exception
            data={{
              name: "James Wilson",
              empId: "EMP-5044",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              date: "Oct 24, 2024",
              checkIn: "08:50 AM",
              checkOut: "MISSING",
              status: "SHORT HOURS",
            }}
            onEdit={onEdit}
          />
        </tbody>
      </table>
    </div>
  );
}

function AttendanceRow({danger, exception, data, onEdit }) {
    return (
      <tr className={`${danger ? "bg-red-50/50" : ""} hover:bg-slate-50`}>
        <Td>
          <div className="flex items-center gap-3">
            <img
              src={data.avatar}
              alt={data.name}
              className="w-9 h-9 rounded-full border object-cover"
            />
            <div>
              <p className="text-sm font-bold">{data.name}</p>
              <p className="text-xs text-slate-500">#{data.empId}</p>
            </div>
          </div>
        </Td>
  
        <Td>{data.date}</Td>
        <Td>{data.checkIn}</Td>
  
        <Td className={data.checkOut === "MISSING" ? "text-red-600 font-bold" : ""}>
          {data.checkOut}
        </Td>
  
        <Td>{data.work || "—"}</Td>
        <Td>{data.ot || "—"}</Td>
  
        <Td center>
          <StatusBadge label={data.status} />
        </Td>
  
        <Td center>{exception ? "⚠️" : "—"}</Td>
  
        <Td right>
          <IconBtn icon="visibility" />
          <IconBtn
            icon="edit"
            danger={danger}
            onClick={() => onEdit(data)}
          />
        </Td>
      </tr>
    );
  }

/* ================= UI HELPERS ================= */

function StatusBadge({ label }) {
  const map = {
    "On-time": "bg-green-100 text-green-700",
    "Missing CO": "bg-red-100 text-red-700",
    "SHORT HOURS": "bg-purple-100 text-purple-700",
    "Late" :"bg-yellow-100 text-yellow-600"
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
        map[label] || "bg-slate-100 text-slate-600"
      }`}
    >
      {label}
    </span>
  );
}

function Th({ children, center, right }) {
  return (
    <th
      className={`px-6 py-4 ${
        center ? "text-center" : right ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "", center, right }) {
  return (
    <td
      className={`px-6 py-4 text-sm ${
        center ? "text-center" : right ? "text-right" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}

function IconBtn({ icon, danger , onClick}) {
  return (
    <button
    onClick = {onClick}
    className={`mx-1 ${
        danger ? "text-red-500" : "text-slate-400 hover:text-primary"
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}

function BottomStatus() {
  return (
    <div className="flex items-center justify-between bg-white border rounded-xl p-4">
      <div>
        <p className="text-xs text-slate-500 font-bold uppercase">
          Ready for Closing
        </p>
        <p className="text-sm">99.2% Records Resolved</p>
      </div>

      <button
        disabled
        className="flex items-center gap-2 px-8 py-3 bg-slate-200 text-slate-400 rounded-lg font-bold cursor-not-allowed"
      >
        <span className="material-symbols-outlined">lock</span>
        Close Attendance
      </button>
    </div>
  );
}
