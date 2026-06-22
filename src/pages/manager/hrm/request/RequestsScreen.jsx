import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080".replace(/\/$/, "");

/* ─── Config ──────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

const TABS = [
  { key: "all", label: "All Requests" },
  { key: "ATTENDANCE", label: "Attendance" },
  { key: "LEAVE", label: "Leave" },
  { key: "OT", label: "OT" },
  { key: "OTHER", label: "Other HR" },
];

const STATUS_OPTIONS = [
  { key: "all", label: "All Statuses" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const TYPE_BADGE = {
  LEAVE: "bg-purple-50 text-purple-700",
  OT: "bg-blue-50 text-blue-700",
  ATTENDANCE: "bg-orange-50 text-orange-700",
  OTHER: "bg-slate-100 text-slate-600",
};

const STATUS_BADGE = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  default: "bg-slate-50 text-slate-600 border-slate-200",
};

/* ─── Main Screen ─────────────────────────────────────────────── */
export default function RequestsScreen() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => { fetchData(tab, status, page); }, [tab, status, page]);

  const fetchData = async (activeTab, activeStatus, activePage) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manager/requests?tab=${activeTab}&status=${activeStatus}&page=${activePage}&size=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const json = await res.json();
      setData(json.data ?? json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => { setTab(key); setPage(0); };
  const handleStatusChange = (key) => { setStatus(key); setPage(0); };

  const kpis = data?.kpis ?? {};
  const requests = data?.requests ?? [];
  const actionReq = data?.actionRequired ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const teamName = data?.teamName ?? "My Team";

  return (
    <div className="mx-auto w-full space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h3 className="text-[#0d141b] dark:text-white text-2xl font-black tracking-tight">
            Approvals
          </h3>
          <p className="text-[#4c739a] text-base">{teamName}</p>
        </div>
        {kpis.totalPending > 0 && (
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">pending_actions</span>
            {kpis.totalPending} Pending Approvals
          </div>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <KPICard title="Total Pending" amount={kpis.totalPending ?? 0} note="Requests" highlight />
        <KPICard title="Attendance" amount={kpis.attendancePending ?? 0} note="Pending" />
        <KPICard title="Leave" amount={kpis.leavePending ?? 0} note="Pending" />
        <KPICard title="OT" amount={kpis.otPending ?? 0} note="Pending" />
        <KPICard title="Approved" amount={(kpis.attendanceApproved ?? 0) + (kpis.leaveApproved ?? 0) + (kpis.otApproved ?? 0)} note="Total" success />
        <KPICard title="Rejected" amount={(kpis.attendanceRejected ?? 0) + (kpis.leaveRejected ?? 0) + (kpis.otRejected ?? 0)} note="Total" danger={(kpis.attendanceRejected ?? 0) + (kpis.leaveRejected ?? 0) + (kpis.otRejected ?? 0) > 0} />
      </div>

      {/* ── Action Required ── */}
      {actionReq.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <h3 className="text-[#0d141b] dark:text-white font-bold text-lg">Action Required</h3>
            <span className="text-[#4c739a] text-sm font-normal">— Overdue requests requiring immediate attention</span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {actionReq.map((req) => (
              <ActionRequiredCard key={req.requestId} req={req} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="bg-white dark:bg-[#15202b] border rounded-2xl shadow-sm overflow-hidden">

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between border-b px-6 py-4 gap-4">
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const count = tabCount(t.key, kpis);
              return (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={`px-4 py-2 text-sm font-bold border rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${tab === t.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent text-[#4c739a] hover:bg-slate-50 hover:border-slate-200"
                    }`}
                >
                  {t.label}
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tab === t.key ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#4c739a] uppercase">Status:</span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg bg-white dark:bg-[#15202b] dark:border-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">No requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {["Employee", "Type", "Date", "Summary", "Status", "SLA Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {requests.map((req) => (
                  <RequestRow key={req.requestId} req={req} navigate={navigate} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t flex flex-wrap justify-between items-center gap-3">
          <p className="text-sm text-[#4c739a]">
            Showing{" "}
            <span className="font-bold">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)}</span>{" "}
            of <span className="font-bold">{totalCount}</span> requests
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded text-sm disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 bg-primary text-white rounded text-sm font-bold disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────── */
function tabCount(key, kpis) {
  if (key === "all") return (kpis.totalPending ?? 0) + (kpis.attendanceApproved ?? 0) + (kpis.leaveApproved ?? 0) + (kpis.otApproved ?? 0) + (kpis.attendanceRejected ?? 0) + (kpis.leaveRejected ?? 0) + (kpis.otRejected ?? 0);
  if (key === "ATTENDANCE") return (kpis.attendancePending ?? 0) + (kpis.attendanceApproved ?? 0) + (kpis.attendanceRejected ?? 0);
  if (key === "LEAVE") return (kpis.leavePending ?? 0) + (kpis.leaveApproved ?? 0) + (kpis.leaveRejected ?? 0);
  if (key === "OT") return (kpis.otPending ?? 0) + (kpis.otApproved ?? 0) + (kpis.otRejected ?? 0);
  return 0;
}

/* ─── Sub-components ──────────────────────────────────────────── */
function KPICard({ title, amount, note, danger, highlight, success }) {
  const borderCls = danger ? "border-red-200" : highlight ? "border-blue-200" : success ? "border-green-200" : "border-slate-200 dark:border-slate-700";
  const amountCls = danger ? "text-red-500" : success ? "text-green-600" : highlight ? "text-[#0d141b] dark:text-white" : "text-[#0d141b] dark:text-white";
  return (
    <div className={`flex flex-col gap-2 p-4 bg-white dark:bg-[#15202b] border-2 ${borderCls} rounded-xl shadow-sm`}>
      <span className="text-[#4c739a] text-xs font-bold uppercase">{title}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-black ${amountCls}`}>{amount}</span>
        <span className="text-xs text-[#4c739a]">{note}</span>
      </div>
    </div>
  );
}

function ActionRequiredCard({ req, navigate }) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-100 flex px-6 py-5 items-center gap-3">
      <Avatar name={req.name} avatarUrl={req.avatarUrl} size={9} />
      <div className="mr-auto">
        <p className="text-[#0d141b] dark:text-white font-bold text-sm">{req.name}</p>
        <p className="text-xs text-red-600 font-medium">
          {req.typeLabel} • <span className="font-bold">{req.slaStatus}</span>
        </p>
        {req.summary && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{req.summary}</p>}
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={() => navigate(`/manager/request-details/${req.requestId}`)}
          className="bg-primary flex items-center gap-1 px-3 py-1.5 text-white text-xs font-bold rounded-lg hover:brightness-90 transition-all"
        >
          <span className="material-symbols-outlined text-sm">visibility</span>Review
        </button>
      </div>
    </div>
  );
}

function RequestRow({ req, navigate }) {
  const slaOverdue = req.isOverdue;
  const slaCls = slaOverdue
    ? "text-red-600"
    : "text-orange-500";
  const slaIcon = slaOverdue ? "alarm_off" : "schedule";

  const statusKey = req.status?.toLowerCase() || "default";
  const statusBadge = STATUS_BADGE[statusKey] || STATUS_BADGE.default;
  const statusLabel = req.status ? req.status.charAt(0).toUpperCase() + req.status.slice(1).toLowerCase() : "Unknown";

  // Highlight row if action is required
  const isActionRequired = req.isActionRequired;
  const rowBg = isActionRequired ? "bg-amber-50 dark:bg-amber-900/10" : "";
  const rowBorder = isActionRequired ? "border-l-4 border-l-amber-500" : "";

  return (
    <tr
      onClick={() => navigate(`/manager/request-details/${req.requestId}`)}
      className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer ${rowBg} ${rowBorder}`}
    >
      {/* Employee */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={req.name} avatarUrl={req.avatarUrl} size={9} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold">{req.name}</p>
              {isActionRequired && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full border border-amber-300">
                  Action Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{req.empCode}</p>
          </div>
        </div>
      </td>

      {/* Type */}
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-[11px] font-bold rounded uppercase ${TYPE_BADGE[req.requestType] ?? TYPE_BADGE.OTHER}`}>
          {req.typeLabel}
        </span>
      </td>

      {/* Date */}
      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{req.requestDate}</td>

      {/* Summary */}
      <td className="px-6 py-4 text-sm italic text-slate-500 max-w-xs truncate">{req.summary}</td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-[11px] font-bold rounded uppercase border ${statusBadge}`}>
          {statusLabel}
        </span>
      </td>

      {/* SLA */}
      <td className="px-6 py-4">
        <div className={`flex items-center gap-1 text-xs font-medium ${slaCls}`}>
          <span className="material-symbols-outlined text-sm">{slaIcon}</span>
          {req.slaStatus}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
            Review
          </button>
        </div>
      </td>
    </tr>
  );
}

function Avatar({ name, avatarUrl, size }) {
  const initials = name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  const cls = `w-${size} h-${size} rounded-full flex-shrink-0`;
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={`${cls} object-cover border`} />;
  }
  return (
    <div className={`${cls} bg-primary text-white flex items-center justify-center text-xs font-bold`}>
      {initials}
    </div>
  );
}
