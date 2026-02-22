import { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ================= MAIN SCREEN ================= */

export default function HRRequestsScreen() {
  const [requests] = useState(mockRequests);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      <PageHeader total={requests.length} />

      <FilterBar />

      <RequestsTable data={requests} navigate = {navigate}  />

    </div>
  );
}

/* ================= HEADER ================= */

function PageHeader({ total }) {
  return (
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-extrabold">HR Requests</h1>
        <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {total} total requests found
        </p>
      </div>

      <div className="flex gap-2">
        <Btn icon="file_download" label="Export Report" />
        <Btn icon="add" label="New Request" primary />
      </div>
    </div>
  );
}

function Btn({ icon, label, primary }) {
  return (
    <button
      className={`flex items-center gap-2 px-4 h-10 rounded-lg text-sm font-bold ${
        primary
          ? "bg-primary text-white"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {label}
    </button>
  );
}

/* ================= FILTER ================= */

function FilterBar() {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap gap-4 items-center">
      <Search />
      <Filter label="Date" value="Today" />
      <Filter label="Type" value="All Types" />
      <Filter label="Status" value="All" />
    </div>
  );
}

function Search() {
  return (
    <div className="relative flex-1 min-w-[280px]">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        search
      </span>
      <input
        placeholder="Search by Employee Name or ID..."
        className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 border-none text-sm"
      />
    </div>
  );
}

function Filter({ label, value }) {
  return (
    <button className="flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-50 border text-sm">
      <span className="text-xs font-bold text-slate-400 uppercase">
        {label}:
      </span>
      <span className="font-medium">{value}</span>
      <span className="material-symbols-outlined text-slate-400">
        expand_more
      </span>
    </button>
  );
}

/* ================= TABLE ================= */

function RequestsTable({ data , navigate}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-500">
          <tr>
            <Th>Request ID</Th>
            <Th>Employee</Th>
            <Th>Type</Th>
            <Th>Created</Th>
            <Th>Current Step</Th>
            <Th>Status</Th>
            <Th>SLA</Th>
            <Th right>Action</Th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {data.map((row) => (
            <RequestRow key={row.id} data={row} navigate = {navigate} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequestRow({ data , navigate}) {
  return (
    <tr className="hover:bg-slate-50">
      <Td bold>{data.id}</Td>

      <Td>
        <div className="flex items-center gap-3">
          <img src={data.avatar} className="w-8 h-8 rounded-full" />
          <span className="font-semibold">{data.employee}</span>
        </div>
      </Td>

      <Td>
        <TypeBadge type={data.type} />
      </Td>

      <Td className="text-slate-500">{data.date}</Td>
      <Td>{data.step}</Td>

      <Td>
        <StatusBadge status={data.status} />
      </Td>

      <Td>
        <span className={data.sla.includes("Overdue") ? "text-red-500 font-bold" : "text-slate-500"}>
          {data.sla}
        </span>
      </Td>

      <Td right>
        <button
        onClick = { () => {navigate(`/hr/request-details/${data.id}`)}} 
        className="p-1 text-primary hover:bg-slate-100 rounded">
          <span className="material-symbols-outlined">visibility</span>
        </button>
      </Td>
    </tr>
  );
}

/* ================= BADGES ================= */

function StatusBadge({ status }) {
  const map = {
    Pending: "bg-amber-100 text-amber-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status]}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  const icons = {
    Leave: "flight_takeoff",
    OT: "schedule",
    Transfer: "move_down",
  };

  return (
    <span className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded text-sm">
      <span className="material-symbols-outlined text-[18px]">
        {icons[type]}
      </span>
      {type}
    </span>
  );
}

/* ================= HELPERS ================= */

function Th({ children, right }) {
  return (
    <th className={`px-6 py-4 ${right ? "text-right" : ""}`}>
      {children}
    </th>
  );
}

function Td({ children, right, bold }) {
  return (
    <td className={`px-6 py-4 text-sm ${right ? "text-right" : ""} ${bold ? "font-bold" : ""}`}>
      {children}
    </td>
  );
}

/* ================= MOCK DATA ================= */

const mockRequests = [
  {
    id: "RQ-1002",
    employee: "Alex Rivera",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    type: "Leave",
    date: "Oct 24, 2023",
    step: "Waiting for Manager Approval",
    status: "Pending",
    sla: "Overdue (2h)",
  },
  {
    id: "RQ-1003",
    employee: "Sarah Jenkins",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    type: "OT",
    date: "Oct 24, 2023",
    step: "In HR Queue",
    status: "In Progress",
    sla: "14h left",
  },
  {
    id: "RQ-1004",
    employee: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    type: "Transfer",
    date: "Oct 23, 2023",
    step: "Completed",
    status: "Approved",
    sla: "—",
  },
];
