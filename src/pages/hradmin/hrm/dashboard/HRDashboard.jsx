import { useEffect, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");


function buildLineChartPath(dataPoints) {
  if (!dataPoints || !dataPoints.length) return "";
  const maxValue = Math.max(...dataPoints, 1);
  const stepX = dataPoints.length > 1 ? 100 / (dataPoints.length - 1) : 100;
  return dataPoints
    .map((value, index) => {
      const x = Number((index * stepX).toFixed(2));
      const y = Number((90 - (value / maxValue) * 60).toFixed(2));
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function buildLineChartPoints(dataPoints) {
  if (!dataPoints || !dataPoints.length) return [];
  const maxValue = Math.max(...dataPoints, 1);
  const stepX = dataPoints.length > 1 ? 100 / (dataPoints.length - 1) : 100;
  return dataPoints.map((value, index) => ({
    x: Number((index * stepX).toFixed(2)),
    y: Number((90 - (value / maxValue) * 60).toFixed(2)),
  }));
}

// =====================================================
// Helpers for SVG Donut Chart (Phase 2)
// Calculate path segments from data array [{label, value}]
// =====================================================

// Color palette for segments (max 8 departments)
const DONUT_COLORS = ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#EC4899","#F97316","#84CC16","#14B8A6","#A855F7","#F43F5E","#0EA5E9","#D97706","#6366F1"];

function buildDonutSegments(data) {
  const total = data.reduce((sum, d) => sum + Number(d.value || 0), 0);
  if (total === 0) return [];
  let cumulative = 0;
  return data.map((item, index) => {
    const startRatio = cumulative / total;
    cumulative += Number(item.value || 0);
    const endRatio = cumulative / total;
    // Start angle from top (-π/2) so first segment is at top
    const startAngle = startRatio * 2 * Math.PI - Math.PI / 2;
    const endAngle   = endRatio   * 2 * Math.PI - Math.PI / 2;
    const r = 40, ri = 24, cx = 50, cy = 50; // outer radius, inner radius, center
    const x1 = cx + r  * Math.cos(startAngle), y1 = cy + r  * Math.sin(startAngle);
    const x2 = cx + r  * Math.cos(endAngle),   y2 = cy + r  * Math.sin(endAngle);
    const x3 = cx + ri * Math.cos(endAngle),   y3 = cy + ri * Math.sin(endAngle);
    const x4 = cx + ri * Math.cos(startAngle), y4 = cy + ri * Math.sin(startAngle);
    const large = (Number(item.value) / total) > 0.5 ? 1 : 0;
    const d = `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${ri} ${ri} 0 ${large} 0 ${x4} ${y4}Z`;
    return {
      d,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
      label: item.label,
      value: Number(item.value),
      pct: Math.round((Number(item.value) / total) * 100),
    };
  });
}

// =====================================================
// Phase 1 — Welcome Banner
// Call /api/hradmin/me (HR admin name) + receive home stats from props
// =====================================================

function WelcomeBanner({ profile, home }) {
  // Format today's date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const fullName = profile
    ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "HR Admin"
    : "...";

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-blue-200 text-sm mb-1">{today}</p>
        <h1 className="text-2xl font-bold">Hello, {fullName} 👋</h1>
        <p className="text-blue-100 text-sm mt-1">Here's your HR overview for today</p>
      </div>
      {/* Quick stats in banner */}
      <div className="flex gap-6 bg-white/10 rounded-xl px-5 py-3">
        <div className="text-center">
          <p className="text-3xl font-extrabold">{home?.totalEmployees ?? "—"}</p>
          <p className="text-blue-200 text-xs">Employees</p>
        </div>
        <div className="w-px bg-white/20" />
        <div className="text-center">
          <p className="text-3xl font-extrabold">{home?.pendingRequests ?? "—"}</p>
          <p className="text-blue-200 text-xs">Pending</p>
        </div>
        <div className="w-px bg-white/20" />
        <div className="text-center">
          <p className="text-3xl font-extrabold">{home?.totalDepartments ?? "—"}</p>
          <p className="text-blue-200 text-xs">Departments</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Phase 1 — KPI Section (improved: added status breakdown)
// =====================================================

// StatusPill: small badge displaying count by status type
function StatusPill({ label, count, bgClass, textClass }) {
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bgClass} ${textClass}`}>
      <span>{label}:</span>
      <strong>{count}</strong>
    </div>
  );
}

// =====================================================
// KPI Detail Modal — display list when clicking card
// =====================================================

// Badge color by KPI type (including drill-down types)
const KPI_BADGE_STYLE = {
  NEW_HIRES:       "bg-indigo-100 text-indigo-700",
  LATE_TODAY:      "bg-amber-100 text-amber-700",
  ABSENT_TODAY:    "bg-red-100 text-red-600",
  OT_TODAY:        "bg-emerald-100 text-emerald-700",
  DEPT_EMPLOYEES:  "bg-blue-100 text-blue-700",
  LATE_HISTORY:    "bg-amber-100 text-amber-700",
  DEPT_LEAVE:           "bg-violet-100 text-violet-700",
  ATT_MONTH_ON_TIME:     "bg-blue-100 text-blue-700",
  ATT_MONTH_LATE:        "bg-amber-100 text-amber-700",
  ATT_MONTH_ABSENT:      "bg-red-100 text-red-600",
};

function KpiDetailModal({ open, title, type, displayMode, data, loading, onClose }) {
  if (!open) return null;
  const badgeStyle  = KPI_BADGE_STYLE[type] || "bg-slate-100 text-slate-600";
  const isRecordList = displayMode === "RECORD_LIST";
  // Footer label: employees vs records
  const footerLabel = isRecordList ? "late records" : "employees";

  return (
    // Backdrop — click outside to close
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal panel — click inside doesn't close */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-base font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="size-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            // Skeleton loading
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                  </div>
                  <div className="h-6 w-16 bg-slate-200 rounded-full" />
                </div>
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            // Empty
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
              <p className="text-slate-400 text-sm mt-2">No data</p>
            </div>
          ) : isRecordList ? (
            // RECORD_LIST mode — for late history (no avatar)
            <div className="space-y-2">
              {data.map((row, idx) => (
                <div key={idx} className="flex items-center gap-3 py-1">
                  {/* Calendar icon instead of avatar */}
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-lg">calendar_today</span>
                  </div>
                  {/* Date + check-in/out info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{row.fullName}</p>
                    {row.sub && <p className="text-xs text-slate-500 mt-0.5">{row.sub}</p>}
                  </div>
                  {/* Badge: Late X minutes */}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${badgeStyle}`}>
                    {row.badge}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            // EMPLOYEE_LIST mode — employee list with avatar
            // ATT_MONTH_* types: add dept group headers when department changes
            <div className="space-y-1">
              {(() => {
                const isAttMonth = type?.startsWith("ATT_MONTH_");
                let lastDept = null;
                return data.map((emp, idx) => {
                  const parts    = (emp.fullName || "").split(" ").filter(Boolean);
                  const initials = parts.length >= 2
                    ? `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase()
                    : (parts[0]?.[0] || "?").toUpperCase();
                  const rowBadgeStyle = type === "DEPT_LEAVE"
                    ? (emp.badge === "With Leave" ? "bg-violet-100 text-violet-700" : "bg-red-100 text-red-600")
                    : badgeStyle;
                  const showHeader = isAttMonth && emp.departmentName && emp.departmentName !== lastDept;
                  lastDept = emp.departmentName;
                  return (
                    <div key={emp.employeeId ?? idx}>
                      {showHeader && (
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-3 pb-1 border-b border-slate-100 mb-1">
                          {emp.departmentName}
                        </p>
                      )}
                      <div className="flex items-center gap-3 py-1.5">
                        {emp.avatarUrl ? (
                          <img src={emp.avatarUrl} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{emp.fullName}</p>
                          {!isAttMonth && <p className="text-xs text-slate-400 truncate">{emp.departmentName}</p>}
                          {emp.sub && <p className="text-xs text-slate-500 mt-0.5">{emp.sub}</p>}
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${rowBadgeStyle}`}>
                          {emp.badge}
                        </span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t">
          <p className="text-xs text-slate-400 text-center">
            {data ? `${data.length} ${footerLabel}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

// KpiCard giờ hỗ trợ children (để render breakdown pills bên dưới số)
function KpiCard({ title, value, icon, iconClassName, badge, badgeClassName, badgeIcon, children, onClick }) {
  return (
    <div
      className={`bg-white p-6 rounded-2xl border shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:border-blue-200 transition-all" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`size-10 rounded-xl flex items-center justify-center ${iconClassName}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {badge && (
          <span className={`text-xs font-bold flex items-center gap-1 ${badgeClassName}`}>
            {badgeIcon && <span className="material-symbols-outlined text-sm">{badgeIcon}</span>}
            {badge}
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      {/* If children exist, render instead of value */}
      {children ? children : <h3 className="text-3xl font-extrabold mt-1">{value}</h3>}
    </div>
  );
}

function KpiSection({ dashboard, onCardClick }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Total Employees — no separate detail, skip click */}
      <KpiCard
        title="Total Employees"
        icon="groups"
        iconClassName="bg-blue-50 text-blue-600"
        badge="Active"
        badgeClassName="text-slate-500"
      >
        <h3 className="text-3xl font-extrabold mt-1">{dashboard?.totalEmployees ?? 0}</h3>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <StatusPill label="Probation" count={dashboard?.probationEmployees ?? 0} bgClass="bg-amber-50" textClass="text-amber-700" />
          <StatusPill label="On Leave" count={dashboard?.onLeaveEmployees ?? 0} bgClass="bg-purple-50" textClass="text-purple-700" />
          <StatusPill label="Resigned" count={dashboard?.resignedEmployees ?? 0} bgClass="bg-red-50" textClass="text-red-600" />
        </div>
      </KpiCard>

      {/* Card 2: New Hires — click to see who was hired this month */}
      <KpiCard
        title="New Hires / Inactive"
        icon="person_add"
        iconClassName="bg-indigo-50 text-indigo-600"
        badge="View details ›"
        badgeClassName="text-indigo-400 hover:text-indigo-600"
        onClick={() => onCardClick("NEW_HIRES")}
      >
        <div className="flex items-baseline gap-2 mt-1">
          <h3 className="text-3xl font-extrabold text-indigo-600">{dashboard?.newEmployee ?? 0}</h3>
          <span className="text-xl text-slate-300">/</span>
          <span className="text-2xl font-bold text-slate-500">{dashboard?.inactiveEmployees ?? 0}</span>
        </div>
      </KpiCard>

      {/* Card 3: Late / Absent — click to see late list */}
      <KpiCard
        title="Late / Absent (Today)"
        icon="alarm_on"
        iconClassName="bg-amber-50 text-amber-600"
        badgeIcon={(dashboard?.lateEmployees ?? 0) > 0 ? "warning" : undefined}
        badge={(dashboard?.lateEmployees ?? 0) > 0 ? "Needs Attention" : "Normal"}
        badgeClassName={(dashboard?.lateEmployees ?? 0) > 0 ? "text-red-500" : "text-green-600"}
        onClick={() => onCardClick("LATE_TODAY")}
      >
        <div className="flex items-baseline gap-2 mt-1">
          {/* Click orange number to view late, click red number to view absent */}
          <button
            className="text-3xl font-extrabold text-amber-600 hover:underline"
            onClick={(e) => { e.stopPropagation(); onCardClick("LATE_TODAY"); }}
          >
            {dashboard?.lateEmployees ?? 0}
          </button>
          <span className="text-xl text-slate-300">/</span>
          <button
            className="text-2xl font-bold text-red-500 hover:underline"
            onClick={(e) => { e.stopPropagation(); onCardClick("ABSENT_TODAY"); }}
          >
            {dashboard?.absentEmployees ?? 0}
          </button>
        </div>
        {/* Breakdown absent: with leave vs without leave */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <StatusPill
            label="With Leave"
            count={dashboard?.absentWithLeave ?? 0}
            bgClass="bg-purple-50"
            textClass="text-purple-700"
          />
          <StatusPill
            label="Without Leave"
            count={dashboard?.absentEmployees ?? 0}
            bgClass="bg-red-50"
            textClass="text-red-600"
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Click numbers to view details</p>
      </KpiCard>

      {/* Card 4: OT — click to see who worked OT and how many hours */}
      <KpiCard
        title="OT Hours Today"
        value={`${dashboard?.otHours ?? 0}h`}
        icon="more_time"
        iconClassName="bg-emerald-50 text-emerald-600"
        badge="View details ›"
        badgeClassName="text-emerald-500 hover:text-emerald-700"
        onClick={() => onCardClick("OT_TODAY")}
      />
    </section>
  );
}

// =====================================================
// Phase 1 — Staff Fluctuation Chart (dual-series)
// Now supports 2 series: New Hires (blue) + Resigned (red)
// =====================================================

// Fixed colors for 2 series
const SERIES_COLORS = ["#3B82F6", "#EF4444"];

function StaffFluctuationSection({ linechart }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const series  = linechart?.linesData || [];
  // Get timelines from first series (common for all series)
  const months  = series[0]?.timelines || [];

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{linechart?.title || "Staff Fluctuation"}</h2>
        {/* Legend displaying name of each series */}
        <div className="flex gap-4">
          {series.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="w-4 h-2 rounded-full inline-block" style={{ backgroundColor: SERIES_COLORS[i] || "#94a3b8" }} />
              {s.label || `Series ${i + 1}`}
            </div>
          ))}
        </div>
      </div>

      <div className="h-52 relative">
        <svg className="absolute inset-0 w-full h-full px-4 pt-4" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Render each series with its own color */}
          {series.map((s, seriesIdx) => {
            const path   = buildLineChartPath(s.datas || []);
            const points = buildLineChartPoints(s.datas || []);
            const color  = SERIES_COLORS[seriesIdx] || "#94a3b8";
            return (
              <g key={seriesIdx}>
                {path && <path d={path} fill="none" stroke={color} strokeWidth="2" />}
                {points.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.seriesIdx === seriesIdx && hoveredPoint?.pointIdx === i ? "4" : "2.5"}
                    fill={color}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredPoint({ seriesIdx, pointIdx: i, value: s.datas[i], label: s.label, month: months[i] })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </g>
            );
          })}
        </svg>
        {/* Tooltip displayed on hover */}
        {hoveredPoint && (
          <div
            className="absolute bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10"
            style={{
              left: `${hoveredPoint.pointIdx * (100 / (months.length - 1 || 1))}%`,
              top: '20%',
              transform: 'translateX(-50%)'
            }}
          >
            <p className="font-bold">{hoveredPoint.month}</p>
            <p className="text-slate-300">{hoveredPoint.label}: <span className="text-white font-semibold">{hoveredPoint.value}</span></p>
          </div>
        )}
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-6">
          {months.map((month) => (
            <span key={month} className="text-[10px] text-slate-400 font-bold uppercase">{month}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// =====================================================
// Phase 2 — Department Structure Donut Chart
// Display active employee distribution by department
// =====================================================

// Donut chart — segments and legend items can be clicked to view employees in department
function DepartmentStructureSection({ staffStructure, onDeptClick }) {
  const cats     = staffStructure?.categoriesData || [];
  const top8     = cats.slice(0, 15);
  const total    = top8.reduce((s, c) => s + Number(c.value || 0), 0);
  const segments = buildDonutSegments(top8);
  const [hoveredSeg, setHoveredSeg] = useState(null);

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{staffStructure?.title || "Department Structure"}</h2>
        {onDeptClick && <span className="text-[10px] text-slate-400">Click department to view employees</span>}
      </div>
      {cats.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-10">No department data available</p>
      ) : (
        <div className="flex gap-5 items-center">
          {/* SVG Donut — each segment can be clicked */}
          <div className="flex-shrink-0 w-36 h-36 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {segments.map((seg, i) => (
                <path
                  key={i}
                  d={seg.d}
                  fill={seg.color}
                  opacity={hoveredSeg !== null && hoveredSeg !== i ? 0.5 : 1}
                  className={onDeptClick ? "cursor-pointer transition-opacity" : ""}
                  onClick={() => onDeptClick && onDeptClick(seg.label)}
                  onMouseEnter={() => setHoveredSeg(i)}
                  onMouseLeave={() => setHoveredSeg(null)}
                />
              ))}
              <text x="50" y="47" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e293b">{total}</text>
              <text x="50" y="57" textAnchor="middle" fontSize="6.5" fill="#94a3b8">employees</text>
            </svg>
          </div>
          {/* Legend — each row can also be clicked */}
          <div className="flex-1 space-y-2">
            {segments.map((seg, i) => (
              <div
                key={i}
                className={`flex items-center justify-between text-xs rounded-lg px-1.5 py-0.5 -mx-1.5 transition-all
                  ${onDeptClick ? "cursor-pointer hover:bg-slate-50" : ""}
                  ${hoveredSeg === i ? "bg-slate-50" : ""}`}
                onClick={() => onDeptClick && onDeptClick(seg.label)}
                onMouseEnter={() => setHoveredSeg(i)}
                onMouseLeave={() => setHoveredSeg(null)}
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="truncate text-slate-600">{seg.label}</span>
                </div>
                <span className="font-bold text-slate-800 ml-2 flex-shrink-0">
                  {seg.value}
                  <span className="text-slate-400 font-normal ml-1">({seg.pct}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// OT by Department — kept from previous version
// =====================================================

function OtDepartmentBar({ name, value, width }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-bold mb-1">
        <span>{name}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full">
        <div className="bg-primary h-full rounded-full" style={{ width }} />
      </div>
    </div>
  );
}

function OtDepartmentSection({ categoryChart }) {
  const categories = categoryChart?.categoriesData || [];
  const maxValue   = Math.max(...categories.map((item) => Number(item.value) || 0), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">{categoryChart?.title || "OT by Department (Hours)"}</h2>
        <button className="text-xs text-primary font-bold">View details</button>
      </div>
      {categories.length === 0 ? (
        <p className="text-slate-400 text-sm text-center py-6">No OT data for today</p>
      ) : (
        categories.map((item) => (
          <OtDepartmentBar
            key={item.label}
            name={item.label}
            value={`${item.value}h`}
            width={`${((Number(item.value) || 0) / maxValue) * 100}%`}
          />
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Today's Attendance — donut ring chart
// ─────────────────────────────────────────────────────────────────────────────

function TodayAttendanceChart({ dashboard, onSliceClick }) {
  const total   = dashboard?.totalEmployees   ?? 0;
  const present = dashboard?.presentEmployees ?? 0;
  const late    = dashboard?.lateEmployees    ?? 0;
  const absent  = dashboard?.absentEmployees  ?? 0;
  const leave   = dashboard?.absentWithLeave  ?? 0;

  const R = 38, cx = 50, cy = 50, STROKE = 13;
  const C = 2 * Math.PI * R;

  const slices = [
    { key: "PRESENT_TODAY", value: present, color: "#10b981", label: "Present",  textClass: "text-emerald-600" },
    { key: "LATE_TODAY",    value: late,    color: "#f59e0b", label: "Late",      textClass: "text-amber-500"   },
    { key: "ABSENT_TODAY",  value: absent,  color: "#f43f5e", label: "Absent",    textClass: "text-rose-500"    },
    { key: "LEAVE_TODAY",   value: leave,   color: "#8b5cf6", label: "On Leave",  textClass: "text-violet-500"  },
  ];

  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  let cumFraction = 0;
  const arcs = slices.map(s => {
    const pct = total > 0 ? s.value / total : 0;
    const arc = { ...s, pct, dashArray: `${pct * C} ${C}`, rotate: -90 + cumFraction * 360 };
    cumFraction += pct;
    return arc;
  });

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <h2 className="text-lg font-bold mb-5">Today's Attendance</h2>
      {total === 0 ? (
        <p className="text-slate-400 text-sm text-center py-8">No data for today</p>
      ) : (
        <div className="flex items-center gap-8">
          <div className="flex-shrink-0">
            <svg viewBox="0 0 100 100" width={144} height={144}>
              <circle cx={cx} cy={cy} r={R} fill="none" stroke="#f1f5f9" strokeWidth={STROKE} />
              {arcs.map(arc => arc.pct > 0 && (
                <circle key={arc.key} cx={cx} cy={cy} r={R} fill="none"
                  stroke={arc.color} strokeWidth={STROKE} strokeLinecap="butt"
                  strokeDasharray={arc.dashArray}
                  strokeDashoffset={0}
                  transform={`rotate(${arc.rotate}, ${cx}, ${cy})`}
                  className={onSliceClick ? "cursor-pointer" : ""}
                  onClick={() => onSliceClick && onSliceClick(arc.key, arc.label)}
                />
              ))}
              <text x={cx} y={cy - 4} textAnchor="middle" fontSize={16} fontWeight="bold" fill="#1e293b">{rate}%</text>
              <text x={cx} y={cy + 9} textAnchor="middle" fontSize={7} fill="#94a3b8">present</text>
            </svg>
          </div>
          <div className="flex-1 space-y-3">
            {slices.map(s => (
              <div
                key={s.key}
                className={`flex items-center gap-3 rounded-lg px-2 py-1 transition-colors ${onSliceClick ? "cursor-pointer hover:bg-slate-50" : ""}`}
                onClick={() => onSliceClick && onSliceClick(s.key, s.label)}
              >
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-sm text-slate-600 flex-1">{s.label}</span>
                <span className={`text-xl font-extrabold ${s.textClass}`}>{s.value}</span>
                <span className="text-xs text-slate-400 w-10 text-right">
                  {total > 0 ? `${Math.round((s.value / total) * 100)}%` : "0%"}
                </span>
              </div>
            ))}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total employees</span>
              <span className="font-bold text-slate-600">{total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// Bar Chart: Leave by Department (grouped bar)
// =====================================================

const LEAVE_BAR_W = 22, LEAVE_BAR_GAP = 8, LEAVE_GROUP_GAP = 32;
const LEAVE_GROUP_W = LEAVE_BAR_W * 2 + LEAVE_BAR_GAP + LEAVE_GROUP_GAP;
const LEAVE_CHART_H = 240;
const LEAVE_PAD = { top: 24, right: 24, bottom: 68, left: 44 };

function LeaveByDepartmentSection({ leaveByDepartment, onDeptClick }) {
  const [tooltip, setTooltip] = useState(null);
  const data = leaveByDepartment || [];

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h2 className="text-lg font-bold mb-4">Leave by Department (This Month)</h2>
        <p className="text-slate-400 text-sm text-center py-10">No data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.leaveCount, d.absentCount]), 1);
  const yMax   = Math.ceil(maxVal * 1.3);
  const svgW   = LEAVE_PAD.left + data.length * LEAVE_GROUP_W - LEAVE_GROUP_GAP + LEAVE_PAD.right;
  const svgH   = LEAVE_PAD.top + LEAVE_CHART_H + LEAVE_PAD.bottom;
  const yTicks = 4;

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Leave by Department (This Month)</h2>
        <div className="flex gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-violet-500" />With Leave
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block bg-red-400" />Absent
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={Math.max(svgW, 200)} height={svgH} style={{ minWidth: svgW }}>
          {/* Y gridlines + tick labels */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const val = Math.round(yMax * i / yTicks);
            const y   = LEAVE_PAD.top + LEAVE_CHART_H - (val / yMax) * LEAVE_CHART_H;
            return (
              <g key={i}>
                <line x1={LEAVE_PAD.left} y1={y} x2={svgW - LEAVE_PAD.right} y2={y}
                  stroke={i === 0 ? "#e2e8f0" : "#f1f5f9"} strokeWidth={1} />
                <text x={LEAVE_PAD.left - 5} y={y + 4} textAnchor="end" fontSize={8} fill="#94a3b8">{val}</text>
              </g>
            );
          })}

          {/* Bar groups */}
          {data.map((dept, i) => {
            const gx      = LEAVE_PAD.left + i * LEAVE_GROUP_W;
            const leaveH  = yMax > 0 ? (dept.leaveCount  / yMax) * LEAVE_CHART_H : 0;
            const absentH = yMax > 0 ? (dept.absentCount / yMax) * LEAVE_CHART_H : 0;
            const labelX  = gx + LEAVE_BAR_W + LEAVE_BAR_GAP / 2;
            const isHov   = tooltip?.idx === i;
            return (
              <g key={i}>
                {/* Hover overlay */}
                <rect
                  x={gx - 6} y={LEAVE_PAD.top}
                  width={LEAVE_BAR_W * 2 + LEAVE_BAR_GAP + 12} height={LEAVE_CHART_H}
                  fill={isHov ? "#f8fafc" : "transparent"}
                  className={onDeptClick ? "cursor-pointer" : ""}
                  onClick={() => onDeptClick && onDeptClick(dept.departmentName)}
                  onMouseEnter={(e) => setTooltip({ idx: i, x: e.clientX, y: e.clientY })}
                  onMouseMove={(e)  => setTooltip((p) => p ? { ...p, x: e.clientX, y: e.clientY } : null)}
                  onMouseLeave={() => setTooltip(null)}
                />
                {/* Leave bar */}
                {leaveH > 0 && (
                  <rect x={gx} y={LEAVE_PAD.top + LEAVE_CHART_H - leaveH}
                    width={LEAVE_BAR_W} height={leaveH} fill="#8B5CF6" rx={2} />
                )}
                {/* Absent bar */}
                {absentH > 0 && (
                  <rect x={gx + LEAVE_BAR_W + LEAVE_BAR_GAP} y={LEAVE_PAD.top + LEAVE_CHART_H - absentH}
                    width={LEAVE_BAR_W} height={absentH} fill="#F87171" rx={2} />
                )}
                {/* Rotated department label */}
                <text
                  transform={`translate(${labelX}, ${LEAVE_PAD.top + LEAVE_CHART_H + 12}) rotate(-38)`}
                  textAnchor="end" fontSize={9} fill={isHov ? "#334155" : "#64748b"}
                  className={onDeptClick ? "cursor-pointer" : ""}
                  onClick={() => onDeptClick && onDeptClick(dept.departmentName)}
                >
                  {dept.departmentName}
                </text>
              </g>
            );
          })}

          {/* X baseline */}
          <line x1={LEAVE_PAD.left} y1={LEAVE_PAD.top + LEAVE_CHART_H}
            x2={svgW - LEAVE_PAD.right} y2={LEAVE_PAD.top + LEAVE_CHART_H}
            stroke="#e2e8f0" strokeWidth={1} />
        </svg>
      </div>

      {/* Tooltip — fixed, follows mouse */}
      {tooltip !== null && data[tooltip.idx] && (
        <div
          className="fixed z-50 bg-slate-800 text-white rounded-xl px-3 py-2.5 pointer-events-none shadow-xl text-xs"
          style={{ top: tooltip.y - 90, left: tooltip.x + 14 }}
        >
          <p className="font-bold mb-1.5 text-slate-200">{data[tooltip.idx].departmentName}</p>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-sm bg-violet-400 inline-block" />
            <span className="text-slate-300">With Leave:</span>
            <span className="font-semibold ml-1">{data[tooltip.idx].leaveCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />
            <span className="text-slate-300">Absent:</span>
            <span className="font-semibold ml-1">{data[tooltip.idx].absentCount}</span>
          </div>
          {onDeptClick && <p className="text-slate-400 mt-1.5 text-[10px]">Click to view details</p>}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Phase 2 — Top Late Employees Ranking
// Rank top 5 employees with most late arrivals this month
// =====================================================

// Medal colors for top 3
const RANK_STYLES = [
  "bg-red-100 text-red-700",
  "bg-amber-100 text-amber-700",
  "bg-orange-100 text-orange-700",
];

// Top Late section — each employee row can be clicked to view detailed late days
function TopLateEmployeesSection({ topLateEmployees, onEmpClick }) {
  const employees = topLateEmployees || [];

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold">Most Late (This Month)</h2>
        <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">Top 5</span>
      </div>

      {employees.length === 0 ? (
        // Empty state — no one late or no data available
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-green-400">check_circle</span>
          <p className="text-slate-500 text-sm mt-2 font-medium">Great!</p>
          <p className="text-slate-400 text-xs mt-1">No late arrivals recorded this month</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((emp, idx) => {
            // Create initials from fullName to display when no avatar
            const parts    = (emp.fullName || "").split(" ").filter(Boolean);
            const initials = parts.length >= 2
              ? `${parts[parts.length - 2][0]}${parts[parts.length - 1][0]}`.toUpperCase()
              : (parts[0]?.[0] || "?").toUpperCase();
            const rankStyle = RANK_STYLES[idx] || "bg-slate-100 text-slate-600";

            return (
              <div
                key={emp.employeeId}
                className={`flex items-center gap-3 rounded-xl px-2 py-1 -mx-2 transition-all ${onEmpClick ? "cursor-pointer hover:bg-slate-50" : ""}`}
                onClick={() => onEmpClick && onEmpClick(emp.employeeId, emp.fullName)}
              >
                {/* Rank number */}
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${rankStyle}`}>
                  {idx + 1}
                </span>
                {/* Avatar or initials */}
                {emp.avatarUrl ? (
                  <img src={emp.avatarUrl} className="w-9 h-9 rounded-full object-cover flex-shrink-0" alt="" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {initials}
                  </div>
                )}
                {/* Name and department */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{emp.fullName}</p>
                  <p className="text-xs text-slate-400 truncate">{emp.departmentName}</p>
                </div>
                {/* Number of late arrivals */}
                <span className="text-sm font-extrabold text-red-500 flex-shrink-0">
                  {emp.lateCount}×
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Phase 3 — Reminders Panel (replaces hardcoded AI Insights)
// Display actual reminders from backend:
//   CONTRACT_EXPIRING, PROBATION_ENDING, BIRTHDAY, OVERDUE_REQUEST, WORK_ANNIVERSARY
// =====================================================

// Icon + color configuration for each reminder type
const REMINDER_CONFIG = {
  CONTRACT_EXPIRING: { icon: "description",     bg: "bg-red-50",     text: "text-red-600"    },
  PROBATION_ENDING:  { icon: "work_history",     bg: "bg-amber-50",   text: "text-amber-600"  },
  BIRTHDAY:          { icon: "cake",             bg: "bg-blue-50",    text: "text-blue-600"   },
  OVERDUE_REQUEST:   { icon: "pending_actions",  bg: "bg-orange-50",  text: "text-orange-600" },
  // Work anniversary — green color
  WORK_ANNIVERSARY:  { icon: "military_tech",    bg: "bg-green-50",   text: "text-green-600"  },
};

// Left border by severity level
const SEVERITY_BORDER = {
  red:   "border-l-red-400",
  amber: "border-l-amber-400",
  blue:  "border-l-blue-400",
  green: "border-l-green-400",
};

// Badge background by severity
const SEVERITY_BADGE = {
  red:   "bg-red-100 text-red-600",
  amber: "bg-amber-100 text-amber-700",
  blue:  "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
};

function RemindersSection({ reminders }) {
  const items = reminders || [];

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="size-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-base">notifications_active</span>
        </div>
        <h2 className="text-lg font-bold">Reminders</h2>
        {/* Badge counting reminders — only shown when items exist */}
        {items.length > 0 && (
          <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        // Empty state — nothing to remind
        <div className="text-center py-8">
          <span className="material-symbols-outlined text-4xl text-green-400">check_circle</span>
          <p className="text-slate-500 text-sm mt-2 font-medium">All done!</p>
          <p className="text-slate-400 text-xs mt-1">No reminders for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const cfg         = REMINDER_CONFIG[item.type] || { icon: "info", bg: "bg-slate-50", text: "text-slate-600" };
            const borderClass = SEVERITY_BORDER[item.severity] || "border-l-slate-300";
            const badgeClass  = SEVERITY_BADGE[item.severity]  || "bg-slate-100 text-slate-600";

            return (
              <div key={i} className={`p-3 rounded-xl border border-l-4 ${borderClass} bg-slate-50`}>
                <div className="flex items-start gap-2.5">
                  {/* Reminder type icon */}
                  <div className={`size-7 rounded-lg flex-shrink-0 flex items-center justify-center ${cfg.bg} ${cfg.text}`}>
                    <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Title + count badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-slate-800">{item.title}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeClass}`}>
                        {item.count}
                      </span>
                    </div>
                    {/* Detailed description */}
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Main Dashboard Component
// Fetch 3 APIs in parallel: dashboard, profile, home
// =====================================================

export default function HRDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [profile,   setProfile]   = useState(null);
  const [home,      setHome]      = useState(null);

  // State for KPI Detail Modal
  const [modal, setModal] = useState({ open: false, type: null, title: "", data: null, loading: false });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Token not found");
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch 3 APIs in parallel to optimize load time
    Promise.all([
      fetch(`${API_BASE_URL}/api/hradmin/dashboard`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/hradmin/me`,        { headers }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/api/hradmin/home`,      { headers }).then((r) => r.json()),
    ])
      .then(([dash, prof, homeData]) => {
        console.log("dashboard response", dash);
        setDashboard(dash);
        setProfile(prof);
        setHome(homeData);
      })
      .catch((err) => console.error("Dashboard fetch error:", err));
  }, []);

  // Open modal + fetch detailed data by type
  const handleCardClick = (type) => {
    const titleMap = {
      NEW_HIRES:     "New Hires This Month",
      PRESENT_TODAY: "Present Today",
      LATE_TODAY:    "Late Today",
      ABSENT_TODAY:  "Absent Today",
      LEAVE_TODAY:   "On Leave Today",
      OT_TODAY:      "OT Today",
    };
    setModal({ open: true, type, title: titleMap[type] || type, data: null, loading: true });

    const token = localStorage.getItem("token");
    fetch(`${API_BASE_URL}/api/hradmin/dashboard/kpi-detail?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((res) => setModal((prev) => ({ ...prev, data: res.employees, title: res.title || prev.title, loading: false })))
      .catch(() => setModal((prev) => ({ ...prev, data: [], loading: false })));
  };

  const closeModal = () => setModal({ open: false, type: null, title: "", displayMode: null, data: null, loading: false });

  // Generic fetch helper for all drill-down types
  const openDetailModal = (url, title, type, displayMode = "EMPLOYEE_LIST") => {
    setModal({ open: true, type, title, displayMode, data: null, loading: true });
    const token = localStorage.getItem("token");
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((res) => setModal((prev) => ({
        ...prev,
        data: res.employees,
        title: res.title || prev.title,
        displayMode: res.displayMode || prev.displayMode,
        loading: false,
      })))
      .catch(() => setModal((prev) => ({ ...prev, data: [], loading: false })));
  };

  // Click donut segment → department employee list
  const handleDeptClick = (departmentName) => {
    openDetailModal(
      `${API_BASE_URL}/api/hradmin/dashboard/department-employees?departmentName=${encodeURIComponent(departmentName)}`,
      `Staff: ${departmentName}`,
      "DEPT_EMPLOYEES",
      "EMPLOYEE_LIST"
    );
  };

  // Click department bar in leave chart → leave record details
  const handleLeaveBarClick = (departmentName) => {
    openDetailModal(
      `${API_BASE_URL}/api/hradmin/dashboard/department-leave-detail?departmentName=${encodeURIComponent(departmentName)}`,
      `Leave This Month: ${departmentName}`,
      "DEPT_LEAVE",
      "EMPLOYEE_LIST"
    );
  };

  // Click employee in Top Late → late history this month
  const handleLateEmpClick = (employeeId, fullName) => {
    openDetailModal(
      `${API_BASE_URL}/api/hradmin/dashboard/employee-late-history?employeeId=${employeeId}`,
      `Late This Month: ${fullName}`,
      "LATE_HISTORY",
      "RECORD_LIST"
    );
  };

  return (
    <div className="space-y-6">
      {/* Phase 1: Welcome Banner */}
      <WelcomeBanner profile={profile} home={home} />

      {/* Phase 1: KPI Cards — pass onCardClick to open modal */}
      <KpiSection dashboard={dashboard} onCardClick={handleCardClick} />

      {/* Row 3: Staff Fluctuation (dual-series) + Reminders (Phase 1 + 3) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StaffFluctuationSection linechart={dashboard?.linechart} />
        </div>
        <div>
          {/* Phase 3: Actual Reminders (replaces hardcoded AI Insights) */}
          <RemindersSection reminders={dashboard?.reminders} />
        </div>
      </section>

      {/* Row 4: Staff Structure (donut, click segment = view employees) + Top Late (click row = view late history) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentStructureSection staffStructure={dashboard?.staffStructure} onDeptClick={handleDeptClick} />
        <TopLateEmployeesSection    topLateEmployees={dashboard?.topLateEmployees} onEmpClick={handleLateEmpClick} />
      </section>

      {/* Row 5: Today's attendance breakdown */}
      <TodayAttendanceChart dashboard={dashboard} onSliceClick={handleCardClick} />

      {/* Row 6: Leave by Department — grouped bar, click to view details */}
      <LeaveByDepartmentSection leaveByDepartment={dashboard?.leaveByDepartment} onDeptClick={handleLeaveBarClick} />

      {/* Row 6: OT by Department (kept from previous version) */}
      <OtDepartmentSection categoryChart={dashboard?.categoryChart} />

      {/* KPI Detail Modal — render last to overlay correctly */}
      <KpiDetailModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        displayMode={modal.displayMode}
        data={modal.data}
        loading={modal.loading}
        onClose={closeModal}
      />
    </div>
  );
}