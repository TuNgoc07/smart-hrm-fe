import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function getStatusVariantClasses(statusVariant) {
  if (statusVariant === "success") {
    return "bg-emerald-100 text-emerald-600";
  }

  if (statusVariant === "warning") {
    return "bg-amber-100 text-amber-600";
  }

  if (statusVariant === "danger") {
    return "bg-rose-100 text-rose-600";
  }

  return "bg-slate-100 text-slate-600";
}

function buildOtTrendPath(otTrend = []) {
  if (!otTrend.length) {
    return "";
  }

  const width = 400;
  const height = 150;
  const maxHours = Math.max(...otTrend.map((item) => item.hours), 1);
  const stepX = otTrend.length > 1 ? width / (otTrend.length - 1) : width;

  return otTrend
    .map((item, index) => {
      const x = index * stepX;
      const y = height - (item.hours / maxHours) * 110 - 20;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function PageHeader({ onNavigate, attendanceStats }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Attendance Dashboard</h2>
        <p className="text-slate-500">Overview for {attendanceStats?.overviewDate || formattedDate}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-white rounded-lg p-1 border">
          <button className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-md">Today</button>
          <button className="px-4 py-1.5 text-slate-600 text-sm font-medium rounded-md">Weekly</button>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold">
          <span className="material-symbols-outlined">corporate_fare</span>
          All Departments
          <span className="material-symbols-outlined">expand_more</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold">
          <span className="material-symbols-outlined">download</span>
          Export
        </button>

        <button
          onClick={() => onNavigate("/hr/attendance/exceptions")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-lg text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          <span className="material-symbols-outlined">report_problem</span>
          Attendance Exceptions
        </button>

        <button
          onClick={() => onNavigate("/hr/attendance/records")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-blue-600 transition-colors"
        >
          <span className="material-symbols-outlined">grid_on</span>
          Attendance Records
        </button>
      </div>
    </div>
  );
}

function KpiCard({ label, icon, badge, colorClasses, value }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex justify-between mb-4">
        <div className={`size-10 rounded-lg flex items-center justify-center ${colorClasses.icon}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClasses.badge}`}>
          {badge}
        </span>
      </div>
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

function KpiSection({ attendanceStats }) {
  const summary = attendanceStats?.summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      <KpiCard label="TOTAL EMPLOYEES" icon="groups" badge="Today" colorClasses={{ icon: "bg-blue-100 text-blue-600", badge: "bg-blue-50 text-blue-600" }} value={summary?.totalEmployees ?? 0} />
      <KpiCard label="CHECKED-IN" icon="how_to_reg" badge={`${summary?.checkedInRate ?? 0}% Rate`} colorClasses={{ icon: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-50 text-emerald-600" }} value={summary?.checkedInEmployees ?? 0} />
      <KpiCard label="LATE" icon="history" badge="Need Review" colorClasses={{ icon: "bg-amber-100 text-amber-600", badge: "bg-amber-50 text-amber-600" }} value={summary?.lateEmployees ?? 0} />
      <KpiCard label="ABSENT" icon="person_off" badge={`${summary?.totalEmployees ? ((summary.absentEmployees / summary.totalEmployees) * 100).toFixed(1) : 0}%`} colorClasses={{ icon: "bg-rose-100 text-rose-600", badge: "bg-rose-50 text-rose-600" }} value={summary?.absentEmployees ?? 0} />
      <KpiCard label="OT HOURS" icon="hourglass_top" badge="Today" colorClasses={{ icon: "bg-indigo-100 text-indigo-600", badge: "bg-indigo-50 text-indigo-600" }} value={summary?.otHours ?? 0} />
    </div>
  );
}

const DEPT_PERIODS = [
  { key: "day",   label: "Day"   },
  { key: "week",  label: "Week"  },
  { key: "month", label: "Month" },
];

function getDeptDateRange(period) {
  const now   = new Date();
  const today = toYMD(now);
  if (period === "day") return { startDate: today, endDate: today };
  if (period === "week") {
    const dow   = now.getDay();
    const diff  = dow === 0 ? 6 : dow - 1;
    const mon   = new Date(now); mon.setDate(now.getDate() - diff);
    return { startDate: toYMD(mon), endDate: today };
  }
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  return { startDate: toYMD(first), endDate: today };
}

function DepartmentAttendanceChart() {
  const [period, setPeriod] = useState("day");
  const [depts,  setDepts]  = useState([]);
  const [loading, setLoading] = useState(false);
  const prevKey = useRef("");

  useEffect(() => {
    const { startDate, endDate } = getDeptDateRange(period);
    const key = `${period}_${startDate}_${endDate}`;
    if (key === prevKey.current) return;
    prevKey.current = key;
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/hradmin/attendance-dashboard/dept-stats?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setDepts(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const maxTotal = Math.max(...depts.map((d) => d.totalCount), 1);

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      {/* Header + filter */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-bold">Attendance by Department</h3>
        <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
          {DEPT_PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                period === p.key ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-slate-500 mb-4">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />On Time</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />Late</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />Absent</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Loading...</div>
      ) : depts.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data.</div>
      ) : (
        <div className="overflow-x-auto">
          <div className="flex items-end gap-3 min-w-max pb-1" style={{ minHeight: 220 }}>
            {depts.map((dept) => {
              const barH      = 160;
              const total     = dept.totalCount || 0;
              const scale     = total > 0 ? (total / maxTotal) * barH : 0;
              const presentH  = total > 0 ? (dept.presentCount / total) * scale : 0;
              const lateH     = total > 0 ? (dept.lateCount    / total) * scale : 0;
              const absentH   = total > 0 ? (dept.absentCount  / total) * scale : 0;
              const abbr      = dept.departmentName.length > 10
                ? dept.departmentName.slice(0, 9) + "…"
                : dept.departmentName;
              return (
                <div key={dept.departmentName} className="flex flex-col items-center gap-1.5 group">
                  {/* Count label */}
                  <span className="text-[10px] text-slate-400 font-medium">{total > 0 ? total : ""}</span>
                  {/* Stacked bar */}
                  <div className="w-10 flex flex-col-reverse rounded overflow-hidden bg-slate-100"
                    style={{ height: barH }}>
                    {absentH  > 0 && <div className="bg-rose-500 transition-all"   style={{ height: absentH  }} title={`Absent: ${dept.absentCount}`}  />}
                    {lateH    > 0 && <div className="bg-amber-400 transition-all"  style={{ height: lateH    }} title={`Late: ${dept.lateCount}`}     />}
                    {presentH > 0 && <div className="bg-emerald-500 transition-all" style={{ height: presentH }} title={`On Time: ${dept.presentCount}`} />}
                  </div>
                  {/* Dept name */}
                  <span className="text-[10px] text-slate-500 text-center w-12 leading-tight group-hover:text-slate-700"
                    title={dept.departmentName}>
                    {abbr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function OtHoursTrendChart({ attendanceStats }) {
  const otTrend = attendanceStats?.otTrend || [];
  const otTrendPath = buildOtTrendPath(otTrend);
  const maxHours = Math.max(...otTrend.map((item) => item.hours), 0);

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-bold mb-6">OT Hours Trend</h3>

      <svg viewBox="0 0 400 150" className="w-full h-64">
        <line x1="0" y1="130" x2="400" y2="130" stroke="#e2e8f0" strokeWidth="1" />
        {otTrend.map((item, index) => {
          const x = otTrend.length > 1 ? (index * 400) / (otTrend.length - 1) : 200;
          const y = maxHours > 0 ? 130 - (item.hours / maxHours) * 100 : 130;

          return <circle key={item.label} cx={x} cy={y} r="4" fill="#6366f1" />;
        })}
        {otTrendPath ? <path d={otTrendPath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /> : null}
      </svg>

      <div className="flex justify-between mt-2 text-xs text-slate-400">
        {otTrend.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Attendance Overview (Last 6 Months) — self-fetching grouped bar chart
// ─────────────────────────────────────────────────────────────────────────────

const ATT_BAR_W = 18, ATT_BAR_GAP = 4, ATT_GROUP_GAP = 28;
const ATT_GROUP_W = ATT_BAR_W * 3 + ATT_BAR_GAP * 2 + ATT_GROUP_GAP;
const ATT_CHART_H = 200;
const ATT_PAD = { top: 24, right: 24, bottom: 44, left: 46 };

function AttendanceOverviewSection() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    fetch(`${API_BASE_URL}/api/hradmin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => { setData(res.attendanceOverview || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-center h-40">
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  );
  if (data.length === 0) return null;

  const maxVal = Math.max(...data.flatMap(d => [d.onTime, d.lateCount, d.absentCount]), 1);
  const yMax   = Math.ceil(maxVal * 1.2);
  const svgW   = ATT_PAD.left + data.length * ATT_GROUP_W - ATT_GROUP_GAP + ATT_PAD.right;
  const svgH   = ATT_PAD.top + ATT_CHART_H + ATT_PAD.bottom;
  const yTicks = 4;

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Attendance Overview (Last 6 Months)</h3>
        <div className="flex gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-blue-500" />On Time</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-amber-400" />Late Arrival</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm inline-block bg-red-400" />Absent</span>
        </div>
      </div>
      <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const val = Math.round(yMax * i / yTicks);
          const y   = ATT_PAD.top + ATT_CHART_H - (val / yMax) * ATT_CHART_H;
          return (
            <g key={i}>
              <line x1={ATT_PAD.left} y1={y} x2={svgW - ATT_PAD.right} y2={y}
                stroke={i === 0 ? "#e2e8f0" : "#f1f5f9"} strokeWidth={1} />
              <text x={ATT_PAD.left - 6} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{val}</text>
            </g>
          );
        })}
        {data.map((month, i) => {
          const gx      = ATT_PAD.left + i * ATT_GROUP_W;
          const onH     = yMax > 0 ? (month.onTime      / yMax) * ATT_CHART_H : 0;
          const lateH   = yMax > 0 ? (month.lateCount   / yMax) * ATT_CHART_H : 0;
          const absentH = yMax > 0 ? (month.absentCount / yMax) * ATT_CHART_H : 0;
          const labelX  = gx + ATT_BAR_W + ATT_BAR_GAP / 2 + ATT_BAR_W / 2;
          const isHov   = tooltip?.idx === i;
          const base    = ATT_PAD.top + ATT_CHART_H;
          return (
            <g key={i}>
              <rect x={gx - 4} y={ATT_PAD.top} width={ATT_BAR_W * 3 + ATT_BAR_GAP * 2 + 8} height={ATT_CHART_H}
                fill={isHov ? "#f8fafc" : "transparent"}
                onMouseEnter={e => setTooltip({ idx: i, x: e.clientX, y: e.clientY })}
                onMouseMove={e  => setTooltip(p => p ? { ...p, x: e.clientX, y: e.clientY } : null)}
                onMouseLeave={() => setTooltip(null)}
              />
              {onH > 0     && <rect x={gx} y={base - onH} width={ATT_BAR_W} height={onH} fill="#3B82F6" rx={2} />}
              {lateH > 0   && <rect x={gx + ATT_BAR_W + ATT_BAR_GAP} y={base - lateH} width={ATT_BAR_W} height={lateH} fill="#F59E0B" rx={2} />}
              {absentH > 0 && <rect x={gx + (ATT_BAR_W + ATT_BAR_GAP) * 2} y={base - absentH} width={ATT_BAR_W} height={absentH} fill="#F87171" rx={2} />}
              <text x={labelX} y={base + 16} textAnchor="middle" fontSize={10}
                fill={isHov ? "#334155" : "#64748b"} fontWeight={isHov ? "600" : "400"}>
                {month.monthLabel}
              </text>
            </g>
          );
        })}
        <line x1={ATT_PAD.left} y1={ATT_PAD.top + ATT_CHART_H} x2={svgW - ATT_PAD.right} y2={ATT_PAD.top + ATT_CHART_H}
          stroke="#e2e8f0" strokeWidth={1} />
      </svg>
      {tooltip !== null && data[tooltip.idx] && (
        <div className="fixed z-50 bg-slate-800 text-white rounded-xl px-3 py-2.5 pointer-events-none shadow-xl text-xs"
          style={{ top: tooltip.y - 100, left: tooltip.x + 14 }}>
          <p className="font-bold mb-1.5 text-slate-200">{data[tooltip.idx].monthLabel}</p>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" />
            <span className="text-slate-300">On Time:</span>
            <span className="font-semibold ml-1">{data[tooltip.idx].onTime}</span>
          </div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
            <span className="text-slate-300">Late:</span>
            <span className="font-semibold ml-1">{data[tooltip.idx].lateCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />
            <span className="text-slate-300">Absent:</span>
            <span className="font-semibold ml-1">{data[tooltip.idx].absentCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ChartsSection({ attendanceStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <DepartmentAttendanceChart />
      <OtHoursTrendChart attendanceStats={attendanceStats} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Daily Attendance Chart
// ─────────────────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: "7 days",  days: 7  },
  { label: "14 days", days: 14 },
  { label: "30 days", days: 30 },
];

function toYMD(d) {
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");
}

function DailyAttendanceChartSection() {
  const [preset, setPreset]           = useState(14);
  const [customStart, setCustomStart] = useState("");
  const [customEnd,   setCustomEnd]   = useState("");
  const [useCustom,   setUseCustom]   = useState(false);
  const [data,        setData]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [tooltip,     setTooltip]     = useState(null);
  const prevFetch = useRef("");

  function getDateRange() {
    if (useCustom && customStart && customEnd) return { startDate: customStart, endDate: customEnd };
    const end   = new Date();
    const start = new Date();
    start.setDate(end.getDate() - preset + 1);
    return { startDate: toYMD(start), endDate: toYMD(end) };
  }

  useEffect(() => {
    const { startDate, endDate } = getDateRange();
    const key = `${startDate}_${endDate}`;
    if (key === prevFetch.current) return;
    prevFetch.current = key;
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/hradmin/attendance-dashboard/daily-chart?startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { setData(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [preset, useCustom, customStart, customEnd]);

  // ── SVG dimensions ──────────────────────────────────────────────
  const SVG_W  = 800;
  const CH     = 220;
  const PAD    = { top: 16, right: 20, bottom: 48, left: 44 };
  const svgH   = CH + PAD.top + PAD.bottom;
  const n      = data.length;
  const innerW = SVG_W - PAD.left - PAD.right;
  const stepX  = n > 1 ? innerW / (n - 1) : innerW;
  const maxVal = Math.max(...data.flatMap((d) => [d.onTime, d.lateCount, d.absentCount]), 1);
  const yMax   = Math.ceil(maxVal * 1.15);
  const xAt    = (i) => PAD.left + (n > 1 ? i * stepX : innerW / 2);
  const yAt    = (v) => PAD.top + CH - (v / yMax) * CH;
  const labelStep = n <= 14 ? 1 : n <= 21 ? 2 : 5;

  function polyline(key, color) {
    if (n === 0) return null;
    const pts = data.map((d, i) => `${xAt(i)},${yAt(d[key])}`).join(" ");
    return <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />;
  }

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold">Daily Attendance Chart</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button key={p.days}
              onClick={() => { setPreset(p.days); setUseCustom(false); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                !useCustom && preset === p.days
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600"
              }`}>
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-1.5">
            <input type="date" value={customStart}
              onChange={(e) => { setCustomStart(e.target.value); if (customEnd) setUseCustom(true); }}
              className="border rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400" />
            <span className="text-slate-400 text-xs">–</span>
            <input type="date" value={customEnd}
              onChange={(e) => { setCustomEnd(e.target.value); if (customStart) setUseCustom(true); }}
              className="border rounded-lg px-2 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1.5">
          <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" /></svg>
          On Time
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" /></svg>
          Late
        </span>
        <span className="flex items-center gap-1.5">
          <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" /></svg>
          Absent
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading data...</div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm">No data available for the selected period.</div>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${SVG_W} ${svgH}`} width="100%" height={svgH} preserveAspectRatio="xMidYMid meet">
            {/* Y gridlines + labels */}
            {Array.from({ length: 5 }, (_, i) => {
              const val = Math.round(yMax * i / 4);
              const y   = yAt(val);
              return (
                <g key={i}>
                  <line x1={PAD.left} y1={y} x2={SVG_W - PAD.right} y2={y}
                    stroke={i === 0 ? "#e2e8f0" : "#f1f5f9"} strokeWidth={1} />
                  <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#94a3b8">{val}</text>
                </g>
              );
            })}

            {/* Lines */}
            {polyline("onTime",    "#10b981")}
            {polyline("lateCount", "#f59e0b")}
            {polyline("absentCount", "#f43f5e")}

            {/* Dots + hover interaction */}
            {data.map((d, i) => {
              const x     = xAt(i);
              const isHov = tooltip?.idx === i;
              const hw    = n > 1 ? stepX / 2 : innerW / 2;
              return (
                <g key={i}
                  onMouseEnter={(e) => setTooltip({ idx: i, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e)  => setTooltip((p) => p ? { ...p, x: e.clientX, y: e.clientY } : null)}
                  onMouseLeave={()  => setTooltip(null)}>
                  <rect x={x - hw} y={PAD.top} width={hw * 2} height={CH} fill="transparent" className="cursor-crosshair" />
                  {isHov && <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + CH} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 3" />}
                  <circle cx={x} cy={yAt(d.onTime)}     r={isHov ? 5 : 3} fill="#10b981" />
                  <circle cx={x} cy={yAt(d.lateCount)}  r={isHov ? 5 : 3} fill="#f59e0b" />
                  <circle cx={x} cy={yAt(d.absentCount)}r={isHov ? 5 : 3} fill="#f43f5e" />
                  {i % labelStep === 0 && (
                    <text x={x} y={PAD.top + CH + 16} textAnchor="middle" fontSize={9}
                      fill={isHov ? "#334155" : "#94a3b8"} fontWeight={isHov ? "600" : "400"}>
                      {d.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {tooltip !== null && data[tooltip.idx] && (
            <div className="fixed z-50 bg-slate-800 text-white rounded-xl px-3 py-2.5 pointer-events-none shadow-xl text-xs"
              style={{ top: tooltip.y - 120, left: tooltip.x + 16 }}>
              <p className="font-bold mb-1.5 text-slate-200">{data[tooltip.idx].label} <span className="font-normal text-slate-400">({data[tooltip.idx].date})</span></p>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span className="text-slate-300">On Time:</span>
                <span className="font-semibold ml-1">{data[tooltip.idx].onTime}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                <span className="text-slate-300">Late:</span>
                <span className="font-semibold ml-1">{data[tooltip.idx].lateCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
                <span className="text-slate-300">Absent:</span>
                <span className="font-semibold ml-1">{data[tooltip.idx].absentCount}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AttendanceTable({ attendanceStats }) {
  const phase = attendanceStats?.attendancePhase;
  const snapshot = attendanceStats?.todayAttendanceSnapshot ?? [];

  return (
    <div className="xl:col-span-9 bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-6 border-b flex justify-between">
        <h3 className="text-lg font-bold">Today Attendance Snapshot</h3>
        <button className="text-primary font-bold text-sm">View All</button>
      </div>

      {phase === "before_shift" ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300">schedule</span>
          <p className="font-bold text-slate-600">Shift has not started yet</p>
          <p className="text-sm text-slate-400">Attendance data will be available from <span className="font-semibold">08:30</span>.</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Employee", "Department", "Shift Start", "Status", "Actions"].map((header) => (
                <th key={header} className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {snapshot.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                  No attendance data yet.
                </td>
              </tr>
            ) : (
              snapshot.map((row) => (
                <tr key={row.employeeId} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={row.avatarUrl} alt={row.employeeName} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-bold">{row.employeeName}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">{row.departmentName}</td>
                  <td className="px-6 py-4">{row.shiftStart}</td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusVariantClasses(row.statusVariant)}`}>
                      {row.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1 bg-slate-100 rounded text-xs font-bold">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AlertCard({ alert }) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border">
      <span className="text-[10px] font-bold text-primary">{alert.type}</span>
      <p className="font-bold mt-2">{alert.title}</p>
      <p className="text-xs text-slate-500 mt-1">{alert.message}</p>
      <button className="w-full mt-4 py-2 border rounded-lg text-xs font-bold hover:bg-primary hover:text-white">
        {alert.actionLabel}
      </button>
    </div>
  );
}

function CollectingBanner() {
  return (
    <div className="xl:col-span-12 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
      <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
      <div>
        <p className="text-sm font-bold text-amber-800">Attendance window is open (08:30 – 09:00)</p>
        <p className="text-sm text-amber-700 mt-0.5">
          The current snapshot only includes employees who have checked in. Absent employees will be automatically updated at{" "}
          <span className="font-bold">09:00</span>.
        </p>
      </div>
    </div>
  );
}

function AlertsSidebar({ attendanceStats }) {
  return (
    <div className="space-y-4 xl:col-span-3">
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          <h3 className="text-lg font-bold">AI Alerts & Exceptions</h3>
        </div>

        <div className="p-4 space-y-4">
          {attendanceStats?.alerts?.map((alert) => (
            <AlertCard key={alert.title} alert={alert} />
          ))}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl text-center">
        <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <span className="material-symbols-outlined text-3xl">task_alt</span>
        </div>
        <h4 className="font-bold">Ready for Payroll?</h4>
        <p className="text-xs text-slate-500 mt-2">All exceptions for the morning shift have been logged.</p>
        <button className="mt-4 px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg">Generate Report</button>
      </div>
    </div>
  );
}

function SnapshotSection({ attendanceStats }) {
  const phase = attendanceStats?.attendancePhase;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {phase === "collecting" && <CollectingBanner />}
      <AttendanceTable attendanceStats={attendanceStats} />
      <AlertsSidebar attendanceStats={attendanceStats} />
    </div>
  );
}

export default function AttendanceScreen() {
  const navigate = useNavigate();
  const [attendanceStats, setAttendanceStats] = useState(null);

  function getTodayDate() {
    const now = new Date();

    const today =
      now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');

    console.log(today);
    return today;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    const request = async () => {
      if (!token) {
        return;
      }

      const request = await fetch(`${API_BASE_URL}/api/hradmin/attendance-dashboard?date=${getTodayDate()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await request.json();
      console.log("attendance stats", JSON.stringify(data));
      setAttendanceStats(data);
    };
    request();
  }, []);

  return (
    <div className="space-y-8 bg-background-light min-h-screen">
      <PageHeader onNavigate={navigate} attendanceStats={attendanceStats} />
      <KpiSection attendanceStats={attendanceStats} />
      <DailyAttendanceChartSection />
      <AttendanceOverviewSection />
      <ChartsSection attendanceStats={attendanceStats} />
      <SnapshotSection attendanceStats={attendanceStats} />
    </div>
  );
}