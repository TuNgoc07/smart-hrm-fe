import { useState, useEffect, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";

/* ─── Status config ────────────────────────────────────────────── */
const STATUS_CFG = {
  ON_SITE: { label: "On-site", dot: "bg-green-500", badge: "bg-green-50 text-green-700" },
  LATE: { label: "Late", dot: "bg-orange-500", badge: "bg-orange-50 text-orange-700" },
  REMOTE: { label: "Remote", dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700" },
  ABSENT: { label: "Absent", dot: "bg-red-500", badge: "bg-red-50 text-red-700" },
  ON_LEAVE: { label: "On Leave", dot: "bg-purple-500", badge: "bg-purple-50 text-purple-700" },
  MISSING_CHECKOUT: { label: "No Check-out", dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700" },
};

const EXCEPTION_CFG = {
  LATE_ARRIVAL: { icon: "schedule", color: "text-orange-500" },
  MISSING_CHECKOUT: { icon: "logout", color: "text-amber-500" },
  EARLY_LEAVE: { icon: "directions_run", color: "text-red-500" },
  UNPLANNED_ABSENCE: { icon: "person_off", color: "text-red-600" },
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/* ─── Main Screen ──────────────────────────────────────────────── */
export default function TeamAttendanceScreen() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  /* ── View mode toggle: "daily" (existing) | "period" (new) ── */
  const [viewMode, setViewMode] = useState("daily");

  /* ── Daily mode state (existing) ── */
  const [selectedDate, setSelectedDate] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  /* ── Period mode state (new) ── */
  const [cycles, setCycles] = useState([]);
  const [cyclesLoading, setCyclesLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodPage, setPeriodPage] = useState(0);
  const [periodSearch, setPeriodSearch] = useState("");

  useEffect(() => { fetchData(selectedDate); }, [selectedDate]);

  /* ── Period mode: load cycles on first switch ── */
  useEffect(() => {
    if (viewMode !== "period" || cycles.length > 0) return;
    setCyclesLoading(true);
    fetch(`${API_BASE_URL}/api/manager/attendance/cycles`, { headers: authHeaders() })
      .then(r => r.json())
      .then(json => {
        const list = json.status === "success" ? json.data : [];
        setCycles(list);
        const current = list.find(c => c.isCurrent) || list[0];
        setSelectedCycle(current || null);
      })
      .catch(console.error)
      .finally(() => setCyclesLoading(false));
  }, [viewMode]);

  /* ── Period mode: fetch period-records when cycle changes ── */
  useEffect(() => {
    if (viewMode !== "period" || !selectedCycle) return;
    setPeriodLoading(true);
    setPeriodPage(0);
    fetch(
      `${API_BASE_URL}/api/manager/attendance/period-records?startDate=${selectedCycle.startDate}&endDate=${selectedCycle.endDate}&page=0`,
      { headers: authHeaders() }
    )
      .then(r => r.json())
      .then(json => setPeriodData(json.status === "success" ? json.data : null))
      .catch(console.error)
      .finally(() => setPeriodLoading(false));
  }, [viewMode, selectedCycle]);

  /* ── Period mode: paginate ── */
  const handlePeriodPageChange = (newPage) => {
    if (!selectedCycle) return;
    setPeriodLoading(true);
    fetch(
      `${API_BASE_URL}/api/manager/attendance/period-records?startDate=${selectedCycle.startDate}&endDate=${selectedCycle.endDate}&page=${newPage}`,
      { headers: authHeaders() }
    )
      .then(r => r.json())
      .then(json => {
        if (json.status === "success") { setPeriodData(json.data); setPeriodPage(newPage); }
      })
      .catch(console.error)
      .finally(() => setPeriodLoading(false));
  };

  const fetchData = async (date) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manager/team-attendance?date=${date}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const json = await res.json();
      console.log("team attendance: " + JSON.stringify(json));
      setData(json.data ?? json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const shiftDate = (days) => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    d.setDate(d.getDate() + days);
    const newYear = d.getFullYear();
    const newMonth = String(d.getMonth() + 1).padStart(2, "0");
    const newDay = String(d.getDate()).padStart(2, "0");
    setSelectedDate(`${newYear}-${newMonth}-${newDay}`);
  };

  const isToday = selectedDate === today;
  const displayDate = useMemo(() => {
    const d = new Date(selectedDate + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      + (isToday ? " (Today)" : "");
  }, [selectedDate, isToday]);

  const rows = data?.rows ?? [];
  const kpis = data?.kpis ?? {};
  const pendingApprovals = data?.pendingApprovals ?? [];

  const chips = [
    { key: "ALL", label: "All Members", count: rows.length },
    { key: "LATE", label: "Late", count: kpis.lateCount ?? 0, color: "orange" },
    { key: "ON_LEAVE", label: "On Leave", count: kpis.onLeaveCount ?? 0, color: "purple" },
    { key: "OT", label: "OT", count: kpis.otCount ?? 0, color: "blue" },
    { key: "MISSING_CHECKOUT", label: "No Check-out", count: kpis.missingCheckoutCount ?? 0, color: "amber" },
    { key: "REMOTE", label: "Remote", count: kpis.remoteCount ?? 0, color: "sky" },
    { key: "ABSENT", label: "Absent", count: kpis.absentCount ?? 0, color: "red" },
  ];

  const filteredRows = useMemo(() => rows.filter((r) => {
    const matchFilter =
      activeFilter === "ALL" ||
      r.status === activeFilter ||
      (activeFilter === "OT" && r.otMinutes > 0) ||
      (activeFilter === "REMOTE" && r.isRemote);
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [rows, activeFilter, search]);

  /* ── Filter period employees client-side ── */
  const filteredPeriodEmployees = (periodData?.employees || []).filter(e => {
    const name = e.employeeName?.toLowerCase() || "";
    const id   = String(e.employeeId || "");
    const q    = periodSearch.toLowerCase();
    return q === "" || name.includes(q) || id.includes(q);
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-8 mx-auto w-full">

      {/* ── View Mode Toggle ── */}
      <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />

      {viewMode === "daily" ? (
        /* ════════ DAILY MODE (existing) ════════ */
        <>
          {/* ── Header ── */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight">Team Attendance</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {data?.teamName ?? "Loading…"}
              </p>
            </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Nav */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <button onClick={() => shiftDate(-1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <label className="px-4 flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
              <span className="text-sm font-bold">{displayDate}</span>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="sr-only" />
            </label>
            <button onClick={() => shiftDate(1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>

          <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>

          <button
            onClick={() => navigate("/manager/team-calendar")}
            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-primary/90 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            Team Calendar
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="Team Size" value={kpis.teamSize ?? 0} sub="Total" pct={100} />
        <KPICard label="Present" value={kpis.presentCount ?? 0} sub={`${kpis.presentPercent ?? 0}%`} color="primary" pct={kpis.presentPercent ?? 0} />
        <KPICard label="Late" value={kpis.lateCount ?? 0} sub="Arrivals" color="orange" pct={kpis.latePercent ?? 0} />
        <KPICard label="Overtime" value={kpis.otCount ?? 0} sub="Members" color="blue" pct={kpis.otPercent ?? 0} />
        <KPICard label="No Check-out" value={kpis.missingCheckoutCount ?? 0} sub="Missing" color="amber" pct={kpis.missingCheckoutPercent ?? 0} />
        <KPICard label="Absent" value={kpis.absentCount ?? 0} sub="Members" color="red" pct={kpis.absentPercent ?? 0} />
      </div>

      {/* ── Search + Filter Chips ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search employee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {chips.map((c,index) => (
            <FilterChip label={c.label} key={index} active={activeFilter === c.key} onClick={() => setActiveFilter(c.key)} />
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50 dark:bg-slate-900/50">
                {["Employee", "Check-in", "Check-out", "Duration", "Status", "OT", "Exception", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-sm text-slate-400">No records found</td>
                </tr>
              ) : (
                filteredRows.map((row, index) => <AttendanceRow key={index} row={row} />)
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500">
          Showing <span className="font-bold">{filteredRows.length}</span> of <span className="font-bold">{rows.length}</span> members
        </div>
      </div>

      {/* ── Pending Approvals ── */}
      {pendingApprovals.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">pending_actions</span>
              Pending Approvals
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingApprovals.length}
              </span>
            </h3>
            <NavLink to="/manager/requests" className="text-primary text-sm font-bold hover:underline">
              View All Requests
            </NavLink>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((req) => <RequestCard key={req.requestId} request={req} />)}
          </div>
        </section>
      )}
        </>
      ) : (
        /* ════════ PERIOD MODE (new) ════════ */
        <PeriodView
          cycles={cycles}
          cyclesLoading={cyclesLoading}
          selectedCycle={selectedCycle}
          setSelectedCycle={setSelectedCycle}
          periodData={periodData}
          periodLoading={periodLoading}
          periodPage={periodPage}
          onPageChange={handlePeriodPageChange}
          search={periodSearch}
          setSearch={setPeriodSearch}
          employees={filteredPeriodEmployees}
        />
      )}
    </div>
  );
}

/* ─── Sub-components ───────────────────────────────────────────── */

function KPICard({ label, value, sub, color, pct }) {
  const c = {
    primary: { text: "text-primary", bar: "bg-primary" },
    orange: { text: "text-orange-500", bar: "bg-orange-500" },
    blue: { text: "text-blue-500", bar: "bg-blue-500" },
    amber: { text: "text-amber-500", bar: "bg-amber-500" },
    red: { text: "text-red-500", bar: "bg-red-500" },
  }[color] ?? { text: "text-slate-800 dark:text-white", bar: "bg-slate-400" };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1.5">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-black ${c.text}`}>{value}</span>
        <span className="text-xs text-slate-400">{sub}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full mt-0.5">
        <div className={`h-1 rounded-full ${c.bar} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

function FilterChip({ label, count, color, active, onClick }) {
  const badge = {
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    amber: "bg-amber-100 text-amber-600",
    purple: "bg-purple-100 text-purple-600",
    sky: "bg-sky-100 text-sky-600",
  }[color] ?? "bg-slate-100 text-slate-500";

  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-1.5 text-xs font-bold transition-all
        ${active
          ? "bg-primary text-white shadow-sm"
          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"}`}
    >
      {label}
      {count > 0 && (
        <span className={`px-1.5 rounded text-[10px] font-bold ${active ? "bg-white/25 text-white" : badge}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function AttendanceRow({ row }) {
  const cfg = STATUS_CFG[row.status] ?? { label: row.status, dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600" };
  const excCfg = EXCEPTION_CFG[row.exceptionType] ?? { icon: "warning", color: "text-slate-400" };

  const fmtTime = (t) => {
    if (!t) return null;
    try {
      const [h, m] = t.split(":").map(Number);
      return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
    } catch { return t; }
  };

  const fmtMins = (mins) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60), m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const duration = fmtMins(row.workDurationMinutes);
  const otText = fmtMins(row.otMinutes);

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 group">
      {/* Employee */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar name={row.name} avatarUrl={row.avatarUrl} size={9} />
          <div>
            <p className="text-sm font-bold leading-tight flex items-center gap-1.5">
              {row.name}
              {row.hasPendingRequest && (
                <span className="size-2 rounded-full bg-red-500 flex-shrink-0" title="Has pending request" />
              )}
            </p>
            <p className="text-[10px] text-slate-500">{row.positionName}</p>
          </div>
        </div>
      </td>

      {/* Check-in */}
      <td className="px-4 py-3">
        {row.checkin ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium">{fmtTime(row.checkin)}</span>
            {row.lateMinutes > 0 && (
              <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">
                +{row.lateMinutes}m
              </span>
            )}
          </div>
        ) : <span className="text-xs text-slate-400">—</span>}
      </td>

      {/* Check-out */}
      <td className="px-4 py-3">
        {row.checkout
          ? <span className="text-sm font-medium">{fmtTime(row.checkout)}</span>
          : row.checkin
            ? <span className="text-xs text-slate-400 italic">{row.shiftEnd ? `Expected ${fmtTime(row.shiftEnd)}` : "Pending"}</span>
            : <span className="text-xs text-slate-400">—</span>
        }
      </td>

      {/* Duration */}
      <td className="px-4 py-3">
        {duration
          ? <span className="text-sm font-medium tabular-nums">{duration}</span>
          : <span className="text-xs text-slate-400">—</span>
        }
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold ${cfg.badge}`}>
          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </td>

      {/* OT */}
      <td className="px-4 py-3">
        {otText
          ? <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded">+{otText}</span>
          : <span className="text-xs text-slate-300">—</span>
        }
      </td>

      {/* Exception */}
      <td className="px-4 py-3">
        {row.exceptionType ? (
          <div className="flex items-center gap-1" title={`${row.exceptionType} · ${row.exceptionStatus}`}>
            <span className={`material-symbols-outlined text-[18px] ${excCfg.color}`}>{excCfg.icon}</span>
            <span className={`text-[10px] font-bold ${excCfg.color}`}>
              {row.exceptionStatus === "pending" ? "Pending" : "Resolved"}
            </span>
          </div>
        ) : <span className="text-slate-300 text-xs">—</span>}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-800 dark:hover:text-white">
          <span className="material-symbols-outlined text-[20px]">more_vert</span>
        </button>
      </td>
    </tr>
  );
}

function RequestCard({ request }) {
  const isOT = request.requestType === "OT";
  const accentText = isOT ? "text-primary" : "text-purple-600";
  const icon = isOT ? "more_time" : "beach_access";

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Avatar name={request.name} avatarUrl={request.avatarUrl} size={10} />
          <div>
            <p className="text-sm font-bold leading-tight">{request.name}</p>
            <p className={`text-xs font-bold ${accentText} flex items-center gap-1`}>
              <span className="material-symbols-outlined text-[14px]">{icon}</span>
              {request.typeLabel}
            </p>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{request.relativeTime}</span>
      </div>

      {request.reason && (
        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-bold">Reason: </span>{request.reason}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
          Approve
        </button>
        <button className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Reject
        </button>
      </div>
    </div>
  );
}

function Avatar({ name, avatarUrl, size }) {
  const initials = name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  const base = `size-${size} rounded-full flex-shrink-0`;
  if (avatarUrl) {
    return <div className={`${base} bg-cover bg-center bg-slate-200`} style={{ backgroundImage: `url(${avatarUrl})` }} />;
  }
  return (
    <div className={`${base} bg-primary text-white flex items-center justify-center text-xs font-bold`}>
      {initials}
    </div>
  );
}

/* ================= VIEW MODE TOGGLE ================= */

function ViewModeToggle({ viewMode, setViewMode }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Team Attendance</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {viewMode === "daily"
            ? "Live / historical daily check-in view"
            : "Period summary — aggregated per team member"}
        </p>
      </div>
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
        <button
          onClick={() => setViewMode("daily")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            viewMode === "daily"
              ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">today</span>
          Daily
        </button>
        <button
          onClick={() => setViewMode("period")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            viewMode === "period"
              ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">date_range</span>
          Period
        </button>
      </div>
    </div>
  );
}

/* ================= PERIOD VIEW ================= */

function PeriodView({
  cycles, cyclesLoading, selectedCycle, setSelectedCycle,
  periodData, periodLoading, periodPage, onPageChange,
  search, setSearch, employees,
}) {
  const stats   = periodData?.stats || {};
  const fmtDate = d => d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      {/* ── Period Selector Bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">date_range</span>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Payroll Period</p>
            {selectedCycle && (
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {fmtDate(selectedCycle.startDate)} – {fmtDate(selectedCycle.endDate)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="pl-9 pr-4 h-10 w-48 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* Cycle dropdown */}
          {cyclesLoading ? (
            <div className="h-10 w-52 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ) : (
            <select
              value={selectedCycle ? `${selectedCycle.startDate}|${selectedCycle.endDate}` : ""}
              onChange={e => {
                const [start, end] = e.target.value.split("|");
                const found = cycles.find(c => c.startDate === start && c.endDate === end);
                if (found) setSelectedCycle(found);
              }}
              className="h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 font-medium"
            >
              {cycles.map(c => (
                <option key={`${c.startDate}|${c.endDate}`} value={`${c.startDate}|${c.endDate}`}>
                  {c.label}{c.isCurrent ? " (Current)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Period Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <PeriodStatCard icon="groups"      label="Team Members" value={stats.totalEmployees ?? "—"} />
        <PeriodStatCard icon="task_alt"    label="Avg. Present"  value={stats.avgPresentRate != null ? `${stats.avgPresentRate}%` : "—"} green />
        <PeriodStatCard icon="schedule"    label="Late Days"     value={stats.totalLateDays ?? "—"} warning />
        <PeriodStatCard icon="event_busy"  label="Absent Days"   value={stats.totalAbsentDays ?? "—"} danger />
        <PeriodStatCard icon="beach_access" label="Leave Days"   value={stats.totalLeaveDays ?? "—"} blue />
        <PeriodStatCard icon="more_time"   label="OT Hours"      value={stats.totalOtHours != null ? `${stats.totalOtHours}h` : "—"} purple />
      </div>

      {/* ── Per-Employee Summary Table ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b text-xs font-bold uppercase text-slate-500">
            <tr>
              <Th>Employee</Th>
              <Th center>Present</Th>
              <Th center>Late</Th>
              <Th center>Absent</Th>
              <Th center>Leave</Th>
              <Th center>OT</Th>
              <Th center>Attendance %</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {periodLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                  No attendance data for this period.
                </td>
              </tr>
            ) : (
              employees.map(emp => (
                <PeriodEmployeeRow key={emp.employeeId} emp={emp} />
              ))
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {periodData && periodData.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500">
              {periodData.totalElements} team members · Page {periodPage + 1} of {periodData.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(periodPage - 1)}
                disabled={periodPage === 0}
                className="px-3 py-1.5 rounded-lg border text-sm font-semibold disabled:opacity-40 hover:bg-slate-100"
              >← Prev</button>
              <button
                onClick={() => onPageChange(periodPage + 1)}
                disabled={periodPage >= periodData.totalPages - 1}
                className="px-3 py-1.5 rounded-lg border text-sm font-semibold disabled:opacity-40 hover:bg-slate-100"
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PeriodStatCard({ icon, label, value, green, warning, danger, blue, purple }) {
  const color = green   ? "text-green-600 bg-green-50"
    : warning ? "text-amber-600 bg-amber-50"
    : danger  ? "text-red-600 bg-red-50"
    : blue    ? "text-blue-600 bg-blue-50"
    : purple  ? "text-purple-600 bg-purple-50"
    : "text-primary bg-primary/10";
  const textColor = green ? "text-green-700" : warning ? "text-amber-700" : danger ? "text-red-700"
    : blue ? "text-blue-700" : purple ? "text-purple-700" : "text-slate-900";
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{label}</span>
        <span className={`material-symbols-outlined text-[18px] p-1.5 rounded-lg ${color}`}>{icon}</span>
      </div>
      <p className={`text-2xl font-black ${textColor} dark:text-white`}>{value}</p>
    </div>
  );
}

function PeriodEmployeeRow({ emp }) {
  const rateBg = emp.presentRate >= 90 ? "bg-green-100 text-green-700"
    : emp.presentRate >= 75 ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-700";

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <Td>
        <div className="flex items-center gap-3">
          <img
            src={emp.avatar || "https://randomuser.me/api/portraits/men/45.jpg"}
            alt={emp.employeeName}
            className="w-9 h-9 rounded-full border object-cover"
          />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{emp.employeeName}</p>
            <p className="text-xs text-slate-400">{emp.department || `#EMP${emp.employeeId}`}</p>
          </div>
        </div>
      </Td>
      <Td center><span className="font-bold text-green-700">{emp.presentDays}</span></Td>
      <Td center>
        {emp.lateDays > 0
          ? <span className="text-amber-600 font-bold">{emp.lateDays}</span>
          : <span className="text-slate-400">—</span>}
      </Td>
      <Td center>
        {emp.absentDays > 0
          ? <span className="text-red-600 font-bold">{emp.absentDays}</span>
          : <span className="text-slate-400">—</span>}
      </Td>
      <Td center>
        {emp.leaveDays > 0
          ? <span className="text-blue-600 font-bold">{emp.leaveDays}</span>
          : <span className="text-slate-400">—</span>}
      </Td>
      <Td center>
        <span className="text-purple-600 font-medium">
          {emp.totalOtMinutes > 0 ? `${Math.round(emp.totalOtMinutes / 60 * 10) / 10}h` : "—"}
        </span>
      </Td>
      <Td center>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rateBg}`}>
          {emp.presentRate}%
        </span>
      </Td>
    </tr>
  );
}

function Th({ children, center }) {
  return <th className={`px-6 py-4 ${center ? "text-center" : ""}`}>{children}</th>;
}

function Td({ children, className = "", center }) {
  return <td className={`px-6 py-4 text-sm ${center ? "text-center" : ""} ${className}`}>{children}</td>;
}
