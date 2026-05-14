import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080");

const REQUEST_TYPE_COLORS = ["#3B82F6", "#818CF8", "#FBBF24", "#F87171", "#A855F7"];
const REQUEST_TYPE_BADGE_COLORS = ["bg-blue-500", "bg-indigo-400", "bg-amber-400", "bg-rose-400", "bg-purple-400"];
const STATUS_COLOR_MAP = {
  Pending: "bg-amber-400",
  Approved: "bg-emerald-500",
  Rejected: "bg-rose-500",
  "In Review": "bg-blue-500",
};

function buildDonutSegments(items = []) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return items.map((item, index) => {
    const segmentLength = (item.percentage / 100) * circumference;
    const segment = {
      key: item.type,
      color: REQUEST_TYPE_COLORS[index % REQUEST_TYPE_COLORS.length],
      strokeDasharray: `${segmentLength} ${circumference - segmentLength}`,
      strokeDashoffset: -currentOffset,
    };

    currentOffset += segmentLength;
    return segment;
  });
}

const REQUEST_STATUS_BARS = [
  { label: "Pending", percent: 40, color: "bg-amber-400" },
  { label: "Approved", percent: 80, color: "bg-emerald-500" },
  { label: "Rejected", percent: 15, color: "bg-rose-500" },
  { label: "In Review", percent: 55, color: "bg-blue-500" },
];

const RECENT_REQUESTS = [
  { name: "Nguyễn Minh Tâm", dept: "Engineering", type: "Leave Request", date: "Oct 23, 2023 - 09:15 AM", status: "Pending" },
  { name: "Trần Thanh Hà", dept: "Marketing", type: "OT Approval", date: "Oct 23, 2023 - 11:40 AM", status: "Approved" },
  { name: "Lê Quốc Bảo", dept: "Sales", type: "Transfer Request", date: "Oct 22, 2023 - 04:30 PM", status: "Rejected" },
];

const QUICK_ACTIONS = [
  { label: "Workflow Configuration", path: "/hr/workflow-configuration" },
  { label: "Requests", path: "/hr/requests" },
];

export default function WorkflowStatisticScreen() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    const request = async () => {
      try {
        const request = await fetch(`${API_BASE_URL}/api/hradmin/workflow-dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await request.json();
        console.log("workflow dashboard: " + JSON.stringify(data));
        setStatistics(data);
      } catch (error) {
        console.error("Failed to fetch workflow statistics:", error);
      }
    };
    request();
  }, [])

  return (
    <div className="space-y-8">
      <WorkflowHeader />
      <SummarySection statistics={statistics} />
      <ChartsSection statistics={statistics} />
      <RecentRequests navigate={navigate} statistics={statistics} />
      <QuickAction navigate={navigate} />
    </div>
  );
}

function WorkflowHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <nav className="flex text-xs text-slate-500 mb-1">
          <span>HR Module</span>
          <span className="mx-2">/</span>
          <span className="font-semibold text-slate-900">
            Workflow Dashboard
          </span>
        </nav>
        <h1 className="text-2xl font-bold">Workflow Dashboard</h1>
      </div>

      <HeaderFilters />
    </div>
  );
}

function HeaderFilters() {
  return (
    <div className="bg-white p-2 rounded-xl border flex items-center gap-4 shadow-sm">
      <div className="flex bg-slate-100 rounded-lg p-1">
        <button className="px-4 py-1.5 text-sm font-medium bg-white text-primary rounded-md shadow">
          Today
        </button>
        <button className="px-4 py-1.5 text-sm text-slate-500">
          This week
        </button>
        <button className="px-4 py-1.5 text-sm text-slate-500">
          This month
        </button>
      </div>

      <div className="h-6 w-px bg-slate-200" />

      <select className="text-sm font-medium bg-transparent border-none focus:ring-0">
        <option>All Types</option>
        <option>Leave Request</option>
        <option>OT Approval</option>
        <option>Transfer</option>
      </select>
    </div>
  );
}

function SummarySection({ statistics }) {
  const SUMMARY_CARDS = [
    { label: 'Total Requests', value: statistics?.totalRequests || 0, badge: '+12%', tone: 'amber' },
    { label: 'Pending', value: statistics?.totalPendingApprovals || 0, badge: '32%', tone: 'gray' },
    { label: 'Approved', value: statistics?.totalApprovals || 0, badge: '68%', tone: 'green' },
    { label: 'Rejected', value: statistics?.totalRejects || 0, badge: '0%', tone: 'red' },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {SUMMARY_CARDS.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} badge={card.badge} tone={card.tone} />
      ))}
    </div>
  );
}

function ChartsSection({ statistics }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 flex">
      <RequestsByType statistics={statistics} />
      <RequestsByStatus statistics={statistics} />
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, badge, tone }) {
  const badgeStyle =
    tone === "amber" ? "bg-amber-100 text-amber-600"
      : tone === "green" ? "bg-emerald-100 text-emerald-600"
        : tone === "red" ? "bg-rose-100 text-rose-600"
          : "bg-slate-100 text-slate-600";

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-slate-500">{label}</p>
        {badge && (
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${badgeStyle}`}>
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  );
}

/* ================= REQUESTS BY TYPE ================= */

function RequestsByType({ statistics }) {
  const requestTypes = statistics?.requestsByType || [];

  return (
    <div className="bg-white p-6  xl:col-span-7 border shadow-sm">
      <h4 className="font-bold mb-6">Requests by Type</h4>

      <div className="flex gap-12 items-center">
        <RequestTypeChart statistics={statistics} />

        <div className="space-y-3 text-sm text-slate-500">
          {requestTypes.map((item, index) => (
            <Legend key={item.type} color={REQUEST_TYPE_BADGE_COLORS[index % REQUEST_TYPE_BADGE_COLORS.length]} label={`${item.type} (${item.percentage}%)`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RequestTypeChart({ statistics }) {
  const requestTypes = statistics?.requestsByType || [];
  const segments = buildDonutSegments(requestTypes);

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle r="40" cx="50" cy="50" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
        {segments.map((segment) => (
          <circle
            key={segment.key}
            r="40"
            cx="50"
            cy="50"
            fill="transparent"
            stroke={segment.color}
            strokeWidth="12"
            strokeDasharray={segment.strokeDasharray}
            strokeDashoffset={segment.strokeDashoffset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-bold">
        {requestTypes.length ? "100%" : "0%"}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      {label}
    </div>
  );
}

/* ================= REQUESTS BY STATUS ================= */

function RequestsByStatus({ statistics }) {
  const statusItems = statistics?.requestsByStatus?.map((item) => ({
    label: item.status,
    percent: item.percentage,
    color: STATUS_COLOR_MAP[item.status] || "bg-slate-400",
  })) || REQUEST_STATUS_BARS;

  return (
    <div className="bg-white p-6  xl:col-span-5 border shadow-sm">
      <h4 className="font-bold mb-6">Requests by Status</h4>

      <div className="flex items-end justify-between h-40">
        {statusItems.map((bar) => (
          <Bar key={bar.label} label={bar.label} percent={bar.percent} color={bar.color} />
        ))}
      </div>
    </div>
  );
}

function Bar({ label, percent, color }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-10 h-32 bg-slate-100 rounded-t-lg relative w-20">
        <div
          className={`absolute bottom-0 w-full rounded-t-lg ${color}`}
          style={{ height: `${percent}%` }}
        />
      </div>
      <span className="text-[10px] uppercase font-bold text-slate-400">
        {label}
      </span>
    </div>
  );
}

/* ================= RECENT REQUESTS ================= */

function RecentRequests({ navigate, statistics }) {
  const recentRequests = statistics?.recentRequests || [];
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h4 className="font-bold">Recent Requests</h4>
        <button
          onClick={() => navigate(`/hr/requests`)}
          className="text-primary text-sm font-semibold hover:underline"
        >
          View all
        </button>
      </div>

      <table className="w-full text-left">
        <thead className="bg-slate-50 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-6 py-4">Request ID</th>
            <th className="px-6 py-4">Employee</th>
            <th className="px-6 py-4">Department</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">Created At</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {recentRequests.map((request) => (
            <RecentRow key={`${request.requestId}-${request.createdDate}`} {...request} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentRow({ requestId, employeeName, departmentName, requestType, createdDate, status }) {
  const map = {
    Pending: "bg-amber-100 text-amber-600",
    Approved: "bg-emerald-100 text-emerald-600",
    Rejected: "bg-rose-100 text-rose-600",
  };

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4">
        <p className="font-semibold">{requestId}</p>
      </td>
      <td className="px-6 py-4">
        <p className="font-semibold">{employeeName}</p>
        <p className="text-xs text-slate-500">{departmentName} Dept.</p>
      </td>
      <td className="px-6 py-4 text-sm">{departmentName}</td>
      <td className="px-6 py-4 text-sm">{requestType}</td>
      <td className="px-6 py-4 text-sm text-slate-500">{createdDate}</td>
      <td className="px-6 py-4">
        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${map[status]}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="px-4 py-1.5 text-xs font-bold bg-blue-50 text-primary rounded-lg hover:bg-primary hover:text-white">
          View
        </button>
      </td>
    </tr>
  );
}

function QuickAction({ navigate }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm">
      <div className="p-6 flex flex-wrap gap-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="p-3 rounded-md border shadow-md text-primary text-sm font-semibold hover:bg-blue-50"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}