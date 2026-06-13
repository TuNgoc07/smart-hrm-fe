import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPayrollDashboard, fetchAllPayrollCycles } from "../../../../utils/hrApi";

export default function PayrollOverviewScreen() {
  const navigate = useNavigate();
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [cycles, setCycles]           = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);

  useEffect(() => {
    fetchAllPayrollCycles()
      .then((list) => setCycles(list))
      .catch(() => setCycles([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchPayrollDashboard(selectedCycleId)
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedCycleId]);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-5">
        <span className="material-symbols-outlined text-red-500">error</span>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const kpi                 = data?.kpi                ?? {};
  const workflow            = data?.workflow            ?? {};
  const alerts              = data?.alerts              ?? [];
  const timeline            = data?.timeline            ?? [];
  const insights            = data?.insights            ?? {};
  const costTrend           = data?.costTrend           ?? [];
  const costBreakdown       = data?.costBreakdown       ?? null;
  const deptPayroll         = data?.deptPayroll         ?? [];
  const pendingRequestItems = data?.pendingRequestItems ?? [];
  const salaryDistribution  = data?.salaryDistribution  ?? [];

  return (
    <div className="space-y-8">

      {/* ================= HEADER ================= */}
      <Header
        cycleName={data?.cycleName}
        status={data?.status}
        startDate={data?.startDate}
        endDate={data?.endDate}
        cycles={cycles}
        selectedCycleId={selectedCycleId}
        onCycleChange={setSelectedCycleId}
      />

      {/* ================= KPI CARDS ================= */}
      <KPISection kpi={kpi} />

      {/* ================= PAYROLL WORKFLOW ================= */}
      <PayrollWorkflow workflow={workflow} />

      {/* ================= COST TREND + BREAKDOWN ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <CostTrendChartSection costTrend={costTrend} />
        <CostBreakdownSection costBreakdown={costBreakdown} />
      </div>

      {/* ================= DEPT ANALYSIS + PENDING APPROVALS ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <DeptPayrollSection deptPayroll={deptPayroll} />
        <PendingApprovalSection
          pendingRequestItems={pendingRequestItems}
          workflow={workflow}
          navigate={navigate}
        />
      </div>

      {/* ================= AI RISK INSIGHTS ================= */}
      <InsightSection insights={insights} />

      {/* ================= MAIN CONTENT ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <AlertsSection alerts={alerts} />
        <TimelineSection timeline={timeline} />
        <QuickActions onClick={navigate} />
      </div>

      {/* ================= SALARY DISTRIBUTION ================= */}
      <SalaryDistributionSection salaryDistribution={salaryDistribution} />
    </div>
  );
}
  
  /* ================================================= */
  /* ================= HEADER ======================== */
  /* ================================================= */

  function Header({ cycleName, status, startDate, endDate, cycles, selectedCycleId, onCycleChange }) {
    const statusColor = {
      open: "text-green-600",
      attendance_closed: "text-amber-600",
      payroll_processing: "text-blue-600",
      completed: "text-indigo-600",
    }[status?.toLowerCase()] ?? "text-slate-500";

    const statusLabel = {
      open: "Open",
      attendance_closed: "Attendance Closed",
      payroll_processing: "Processing",
      completed: "Completed",
    }[status?.toLowerCase()] ?? status ?? "—";

    const periodLabel = startDate && endDate
      ? `${new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : "No active cycle";

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{cycleName ?? "Payroll Dashboard"}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {periodLabel} • Status: <span className={`font-bold ${statusColor}`}>{statusLabel}</span>
          </p>
        </div>
        {cycles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">date_range</span>
            <select
              value={selectedCycleId ?? ""}
              onChange={(e) => onCycleChange(e.target.value ? Number(e.target.value) : null)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[200px]"
            >
              <option value="">Latest Cycle</option>
              {cycles.map((c) => (
                <option key={c.cycleId} value={c.cycleId}>
                  {c.cycleName ?? `Cycle #${c.cycleId}`}
                  {c.startDate ? ` (${c.startDate})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  /* ================================================= */
  /* ================= KPI SECTION =================== */
  /* ================================================= */
  
  function KPISection({ kpi }) {
    const fmt = (n) => n != null ? Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "—";
    const fmtMoney = (n) => n != null ? Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "—";

    const statusAmber = ["attendance_closed", "payroll_processing"].includes(kpi.payrollStatusLabel?.toLowerCase?.() ?? "");
    const statusGreen = kpi.payrollStatusLabel === "Open";

    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI icon="groups" label="Total Employees" value={fmt(kpi.totalActiveEmployees)} />
        <KPI
          icon="task_alt"
          label="Attendance"
          value={`${fmt(kpi.attendanceCompletedCount)} / ${fmt(kpi.attendanceTotalCount)}`}
          badge={kpi.attendanceRatePct != null ? `${kpi.attendanceRatePct}% Done` : undefined}
          green
        />
        <KPI icon="pending_actions" label="Payroll Status" value={kpi.payrollStatusLabel ?? "—"} amber={statusAmber} green={statusGreen} />
        <KPI icon="payments" label="Total Cost" value={fmtMoney(kpi.totalCost)} primary />
        <KPI icon="timer" label="Overtime Cost" value={fmtMoney(kpi.otCost)}
          note={kpi.otCostTrendLabel !== "N/A" ? kpi.otCostTrendLabel : undefined} red />
      </section>
    );
  }
  
  function KPI({ icon, label, value, note, badge, green, amber, primary, red }) {
    const color =
      green ? "text-green-600 bg-green-100"
      : amber ? "text-amber-600 bg-amber-100"
      : red ? "text-red-500 bg-red-50"
      : primary ? "text-primary bg-primary/10"
      : "text-primary bg-primary/10";
  
    return (
      <div className="bg-white border rounded-xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className={`material-symbols-outlined p-2 rounded-lg ${color}`}>
            {icon}
          </span>
          {note && <span className="text-xs font-bold text-green-600">{note}</span>}
          {badge && (
            <span className="text-[10px] font-bold uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded">
              {badge}
            </span>
          )}
        </div>
  
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
      </div>
    );
  }
  
  /* ================================================= */
  /* ================= WORKFLOW ====================== */
  /* ================================================= */
  
  function PayrollWorkflow({ workflow }) {
    const hasPendingIssues = (workflow.pendingRequestCount > 0) || (workflow.pendingExceptionCount > 0);
    const totalIssues = (workflow.pendingRequestCount ?? 0) + (workflow.pendingExceptionCount ?? 0);

    const step1Status = workflow.attendanceClosed ? "done" : "active";
    const step2Status = workflow.attendanceClosed
      ? hasPendingIssues ? "warning" : "done"
      : "locked";
    const step3Status = workflow.payrollCalculated ? "done" : "locked";
    const step4Status = workflow.payrollLocked ? "done" : "locked";

    const line1 = workflow.attendanceClosed ? "completedLine" : "incompletedLine";
    const line2 = workflow.attendanceClosed && !hasPendingIssues ? "completedLine" : "incompletedLine";
    const line3 = workflow.payrollCalculated ? "completedLine" : "incompletedLine";

    return (
      <section className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-6">Payroll Cycle Workflow</h3>
        <div className="flex items-center w-full">
          <Step icon="check" label="Attendance Closed" status={step1Status} />
          <Line colorLine={line1} />
          <Step
            icon={hasPendingIssues ? "warning" : "check"}
            label="Data Validation"
            status={step2Status}
            sub={hasPendingIssues ? `${totalIssues} Pending Issue${totalIssues > 1 ? "s" : ""}` : undefined}
          />
          <Line colorLine={line2} />
          <Step icon={workflow.payrollCalculated ? "check" : "lock"} label="Payroll Calculated" status={step3Status} />
          <Line colorLine={line3} />
          <Step icon={workflow.payrollLocked ? "lock" : "lock"} label="Payroll Locked" status={step4Status} />
        </div>
      </section>
    );
  }
  
  function Step({ icon, label, status, sub }) {
    const map = {
      done: "bg-green-500 text-white",
      warning: "bg-amber-500 text-white",
      locked: "bg-gray-200 text-gray-500",
    };
  
    return (
      <div className="flex flex-col items-center min-w-[120px]">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${map[status]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="text-xs font-bold mt-2 text-center">{label}</p>
        {sub && <p className="text-[10px] text-amber-600 font-bold">{sub}</p>}
      </div>
    );
  }
  
  function Line({colorLine}) {
    const colors = {
        completedLine : "bg-green-500",
        incompletedLine: "bg-gray-300"
    };
    return <div className = {`flex-1 h-[4px] mx-2 ${colors[colorLine]}`} />;
  }

  /* ================================================= */
  /* ========= AI PAYROLL RISK INSIGHTS ============== */
  /* ================================================= */
  function InsightSection({ insights }) {
    const trendDir  = insights.otCostTrendDirection;
    const trendIcon = trendDir === "up" ? "trending_up" : trendDir === "down" ? "trending_down" : "trending_flat";
    const trendDesc = insights.otCostTrendLabel && insights.otCostTrendLabel !== "N/A"
      ? `OT cost ${trendDir === "up" ? "increased" : "decreased"} ${insights.otCostTrendLabel} vs last cycle`
      : "Not enough data to compare yet";
    const anomalyDesc = insights.anomalyCount > 0
      ? `${insights.anomalyCount} employee${insights.anomalyCount > 1 ? "s have" : " has"} manual adjustments`
      : "No anomalies detected this cycle";
    const trendRisk   = trendDir === "up";
    const anomalyRisk = insights.anomalyCount > 0;
    return (
      <section className="bg-gradient-to-br from-slate-900 to-primary/80 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-blue-300">auto_awesome</span>
          <h2 className="font-bold text-white">AI Payroll Risk Insights</h2>
          <span className="text-[10px] bg-blue-400/20 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30 ml-1">AI Analysis</span>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <AIRiskCard icon={trendIcon} title="OT Cost Trend" desc={trendDesc} risk={trendRisk}
            tip="Compare with previous payroll cycle" />
          <AIRiskCard
            icon={anomalyRisk ? "warning" : "verified"}
            title="Payroll Anomaly Detection"
            desc={anomalyDesc}
            risk={anomalyRisk}
            tip={anomalyRisk ? "Review adjusted results before locking" : "All results look normal"}
          />
          <AIRiskCard
            icon="tips_and_updates"
            title="Department Cost Signal"
            desc={insights.topOtDepartment
              ? `High OT concentration in ${insights.topOtDepartment}`
              : "Insufficient data for department analysis"}
            risk={!!insights.topOtDepartment}
            tip="Consider reviewing shift allocation for high-OT departments"
          />
        </div>
      </section>
    );
  }

  function AIRiskCard({ icon, title, desc, tip, risk }) {
    return (
      <div className="flex gap-4 p-5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
        <div className={`size-10 shrink-0 rounded-lg flex items-center justify-center ${
          risk ? "bg-amber-400/20 text-amber-300" : "bg-green-400/20 text-green-300"
        }`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{title}</p>
            {risk && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-pulse" />}
          </div>
          <p className="text-sm font-semibold text-white">{desc}</p>
          <p className="text-[11px] text-white/50 mt-0.5">{tip}</p>
        </div>
      </div>
    );
  }
  
  
  /* ================================================= */
  /* ================= ALERTS & TIMELINE SECTION======================== */
  /* ================================================= */
  
  function AlertsSection({ alerts }) {
    return (
      <section className="bg-white border xl:col-span-4 shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold">Alerts & Critical Issues</h3>
          {alerts.length > 0 ? (
            <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded uppercase">
              {alerts.length} Action Item{alerts.length > 1 ? "s" : ""}
            </span>
          ) : (
            <span className="text-[10px] bg-green-50 text-green-600 font-bold px-2 py-0.5 rounded uppercase">All Clear</span>
          )}
        </div>
        <div className="divide-y">
          {alerts.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-400">
              <span className="material-symbols-outlined block text-3xl mb-1 text-green-400">check_circle</span>
              No action items for this cycle
            </div>
          )}
          {alerts.map((a, i) => (
            <Alert
              key={i}
              icon={a.severity === "red" ? "error" : a.severity === "amber" ? "notification_important" : "info"}
              title={a.title}
              desc={a.desc}
              amber={a.severity === "amber"}
              red={a.severity === "red"}
            />
          ))}
        </div>
      </section>
    );
  }

  function TimelineSection({ timeline }) {
    const fmtTime = (raw) => {
      if (!raw) return "—";
      try {
        return new Date(raw).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
      } catch { return raw; }
    };

    return (
      <section className="bg-white border xl:col-span-4 shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold">Payroll Activity Timeline</h3>
          <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded uppercase">
            {timeline.length} Event{timeline.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="divide-y">
          {timeline.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-400">No events yet</div>
          )}
          {timeline.map((t, i) => (
            <Timeline key={i} icon={t.icon} title={t.title} desc={t.desc} time={fmtTime(t.time)} color={t.color} />
          ))}
        </div>
      </section>
    );
  }

  function Timeline({icon, title, desc, time, color}){
    return (
      <div className="p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer">
        <div className="flex gap-4 items-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} `}>
            <span className="material-symbols-outlined text-white">{icon}</span>
          </div>
          <div>
            <p className="text-sm font-bold">{title}</p>
            <p className="text-xs text-slate-500">{desc}</p>
            <p className="text-xs text-slate-500">{time}</p>

          </div>
        </div>
  
        <span className="material-symbols-outlined text-slate-400">
          chevron_right
        </span>
      </div>
    );
  }


  
  function Alert({ icon, title, desc, amber, primary, red }) {
    const color =
      amber ? "text-amber-600 bg-amber-50"
      : red ? "text-red-500 bg-red-50"
      : "text-primary bg-primary/10";
  
    return (
      <div className="p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer">
        <div className="flex gap-4 items-center">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div>
            <p className="text-sm font-bold">{title}</p>
            <p className="text-xs text-slate-500">{desc}</p>
          </div>
        </div>
  
        <span className="material-symbols-outlined text-slate-400">
          chevron_right
        </span>
      </div>
    );
  }
  
  /* ================================================= */
  /* ================= QUICK ACTIONS ================= */
  /* ================================================= */
  
  function QuickActions({onClick}) {
    return (
      <section className="bg-white border xl:col-span-4 shadow-sm p-6 flex flex-col gap-6">
        <h3 className="font-bold">Quick Actions</h3>
  
        <Action primary icon="play_circle" label="Go to Payroll Calculation" navigate = {onClick} act = "payroll-calculation" />
        <Action icon="visibility" label="View Payroll Result" navigate = {onClick} act = "payroll-results" />
        <Action icon="settings_suggest" label="Payroll Configuration" navigate = {onClick} act = "payroll-config" />
  
        <div className="mt-auto border-t pt-6">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-xs text-slate-500 leading-relaxed">
              <b className="text-slate-900">System Note:</b> Calculation engine was
              updated 2 days ago. All statutory tax rates for Oct 2024 are applied.
            </p>
          </div>
        </div>
      </section>
    );
  }
  
  function Action({ icon, label, primary, navigate, act }) {
    return (
      <button
        onClick = {() => {navigate(`/hr/${act}`)}}
        className={`flex justify-between items-center px-5 py-4 rounded-xl font-bold transition-all ${
          primary
            ? "bg-primary text-white shadow-md shadow-primary/20"
            : "bg-slate-100 hover:bg-slate-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined">{icon}</span>
          <span className="text-sm">{label}</span>
        </div>
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    );
  }

  /* ================================================= */
  /* =========== SVG DONUT MATH HELPERS ============== */
  /* ================================================= */
  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function describeDonutSlice(cx, cy, outerR, innerR, startAngle, endAngle) {
    if (endAngle - startAngle >= 360) endAngle = startAngle + 359.99;
    const os = polarToCartesian(cx, cy, outerR, startAngle);
    const oe = polarToCartesian(cx, cy, outerR, endAngle);
    const is = polarToCartesian(cx, cy, innerR, endAngle);
    const ie = polarToCartesian(cx, cy, innerR, startAngle);
    const la = endAngle - startAngle > 180 ? 1 : 0;
    return [
      `M ${os.x.toFixed(2)} ${os.y.toFixed(2)}`,
      `A ${outerR} ${outerR} 0 ${la} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)}`,
      `L ${is.x.toFixed(2)} ${is.y.toFixed(2)}`,
      `A ${innerR} ${innerR} 0 ${la} 0 ${ie.x.toFixed(2)} ${ie.y.toFixed(2)}`,
      "Z",
    ].join(" ");
  }

  /* ================================================= */
  /* ========= PAYROLL COST TREND CHART ============== */
  /* ================================================= */
  function CostTrendChartSection({ costTrend }) {
    return (
      <section className="bg-white border rounded-xl shadow-sm xl:col-span-8 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">show_chart</span>
            <h3 className="font-bold">Payroll Cost Trend</h3>
          </div>
          <span className="text-xs text-slate-400">Last {costTrend.length} cycle{costTrend.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="p-6">
          {costTrend.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-slate-400 text-sm">No payroll data available</div>
          ) : (
            <>
              <CostTrendChart costTrend={costTrend} />
              <div className="flex items-center gap-5 mt-2 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                  <span className="text-xs text-slate-500">Total Cost</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-orange-400" />
                  <span className="text-xs text-slate-500">OT Cost</span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  function CostTrendChart({ costTrend }) {
    const W = 500, H = 200, padL = 65, padR = 16, padT = 20, padB = 44;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const maxVal = Math.max(...costTrend.map((d) => Number(d.totalCost || 0)), 1);
    const scale  = chartH / maxVal;
    const n      = costTrend.length;
    const groupW = chartW / n;
    const barW   = Math.min(groupW * 0.32, 26);
    const fmtY   = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : `${v}`;
    const ticks  = [0, 0.25, 0.5, 0.75, 1];
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {ticks.map((pct) => {
          const y = padT + chartH * (1 - pct);
          return (
            <g key={pct}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={padL - 5} y={y + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8">{fmtY(maxVal * pct)}</text>
            </g>
          );
        })}
        <line x1={padL} x2={W - padR} y1={padT + chartH} y2={padT + chartH} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={padL} x2={padL} y1={padT} y2={padT + chartH} stroke="#e2e8f0" strokeWidth="1" />
        {costTrend.map((d, i) => {
          const cx   = padL + i * groupW + groupW / 2;
          const tVal = Number(d.totalCost || 0);
          const oVal = Number(d.otCost    || 0);
          const tH   = tVal * scale;
          const oH   = oVal * scale;
          const bx1  = cx - barW - 1;
          const bx2  = cx + 1;
          let label  = d.cycleMonth || d.cycleName || "";
          if (/^\d{4}-\d{2}/.test(label)) {
            const [yr, mo] = label.split("-");
            const mNames   = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
            label          = `${mNames[parseInt(mo, 10) - 1]} '${yr.slice(2)}`;
          } else if (label.length > 8) label = label.slice(0, 8);
          return (
            <g key={i}>
              {tH > 0 && <rect x={bx1} y={padT + chartH - tH} width={barW} height={tH} fill="#6366f1" rx="2" opacity="0.85" />}
              {oH > 0 && <rect x={bx2} y={padT + chartH - oH} width={barW} height={oH} fill="#fb923c" rx="2" opacity="0.85" />}
              <text x={cx} y={padT + chartH + 14} textAnchor="middle" fontSize="9" fill="#64748b">{label}</text>
            </g>
          );
        })}
      </svg>
    );
  }

  /* ================================================= */
  /* =========== COST BREAKDOWN DONUT ================ */
  /* ================================================= */
  function CostBreakdownSection({ costBreakdown }) {
    return (
      <section className="bg-white border rounded-xl shadow-sm xl:col-span-4 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">donut_large</span>
          <h3 className="font-bold">Cost Breakdown</h3>
        </div>
        <div className="p-6">
          <CostBreakdownDonut costBreakdown={costBreakdown} />
        </div>
      </section>
    );
  }

  function CostBreakdownDonut({ costBreakdown }) {
    if (!costBreakdown) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No data</div>;
    const segments = [
      { label: "Base Salary",     value: Number(costBreakdown.baseSalary      || 0), color: "#6366f1" },
      { label: "Allowances",      value: Number(costBreakdown.allowances      || 0), color: "#22c55e" },
      { label: "OT Pay",          value: Number(costBreakdown.overtimePay     || 0), color: "#fb923c" },
      { label: "Tax & Insurance", value: Number(costBreakdown.taxAndInsurance || 0), color: "#ef4444" },
    ].filter((s) => s.value > 0);
    const total = segments.reduce((s, d) => s + d.value, 0);
    if (total === 0) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Run payroll to see breakdown</div>;
    const cx = 90, cy = 90, outerR = 72, innerR = 44;
    let angle = 0;
    const slices = segments.map((s) => {
      const sweep = (s.value / total) * 360;
      const sl = { ...s, startAngle: angle, endAngle: angle + sweep };
      angle += sweep;
      return sl;
    });
    const fmtM   = (v) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}K`;
    const fmtPct = (v) => `${((v / total) * 100).toFixed(1)}%`;
    return (
      <div className="w-full">
        <div className="flex justify-center">
          <svg viewBox="0 0 180 180" className="w-44 h-44">
            {slices.map((s, i) => (
              <path key={i} d={describeDonutSlice(cx, cy, outerR, innerR, s.startAngle, s.endAngle)} fill={s.color} />
            ))}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">Total</text>
            <text x={cx} y={cy + 9} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e293b">{fmtM(total)}</text>
          </svg>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-2">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-500 leading-tight truncate">{s.label}</p>
                <p className="text-xs font-bold text-slate-800">{fmtPct(s.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ================================================= */
  /* ======= DEPARTMENT PAYROLL ANALYSIS ============= */
  /* ================================================= */
  function DeptPayrollSection({ deptPayroll }) {
    return (
      <section className="bg-white border rounded-xl shadow-sm xl:col-span-7 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">table_chart</span>
          <h3 className="font-bold">Department Payroll Analysis</h3>
        </div>
        <div className="p-6">
          {deptPayroll.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">Run payroll to see department breakdown</div>
          ) : (
            <DeptPayrollTable deptPayroll={deptPayroll} />
          )}
        </div>
      </section>
    );
  }

  function DeptPayrollTable({ deptPayroll }) {
    const maxGross = Math.max(...deptPayroll.map((d) => Number(d.totalGross || 0)), 1);
    const fmtM = (v) => {
      const n = Number(v || 0);
      return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;
    };
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-400 border-b">
              <th className="pb-3 text-left font-semibold">Department</th>
              <th className="pb-3 text-right font-semibold">Gross</th>
              <th className="pb-3 text-right font-semibold pr-4">OT Cost</th>
              <th className="pb-3 text-right font-semibold">HC</th>
              <th className="pb-3 w-24" />
            </tr>
          </thead>
          <tbody>
            {deptPayroll.map((d, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                <td className="py-3 font-semibold text-sm">{d.departmentName}</td>
                <td className="py-3 text-right text-sm font-mono">{fmtM(d.totalGross)}</td>
                <td className="py-3 text-right text-sm font-mono text-orange-500 pr-4">{fmtM(d.totalOt)}</td>
                <td className="py-3 text-right text-sm text-slate-500">{d.employeeCount}</td>
                <td className="py-3 w-24">
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 rounded-full transition-all duration-700"
                      style={{ width: `${(Number(d.totalGross) / maxGross) * 100}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  /* ================================================= */
  /* ========= PENDING APPROVAL WIDGET =============== */
  /* ================================================= */
  function PendingApprovalSection({ pendingRequestItems, workflow, navigate }) {
    const total = (workflow?.pendingRequestCount ?? 0) + (workflow?.pendingExceptionCount ?? 0);
    const typeLabel = (t) => {
      if (!t) return "Request";
      const tl = t.toLowerCase();
      if (tl.includes("ot"))         return "OT";
      if (tl.includes("leave"))      return "Leave";
      if (tl.includes("adjustment")) return "Adjust";
      return t.split("_")[0];
    };
    const typeCls = (t) => {
      const lbl = typeLabel(t);
      if (lbl === "OT")     return "bg-orange-100 text-orange-700 border-orange-200";
      if (lbl === "Leave")  return "bg-blue-100 text-blue-700 border-blue-200";
      if (lbl === "Adjust") return "bg-violet-100 text-violet-700 border-violet-200";
      return "bg-slate-100 text-slate-600 border-slate-200";
    };
    return (
      <section className="bg-white border rounded-xl shadow-sm xl:col-span-5 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[20px]">pending_actions</span>
              <h3 className="font-bold">Pending Approvals</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 ml-7">Required before payroll lock</p>
          </div>
          {total > 0 ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {total} pending
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
              All clear
            </span>
          )}
        </div>
        <div className="divide-y flex-1">
          {pendingRequestItems.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">
              <span className="material-symbols-outlined block text-3xl mb-2 text-green-400">check_circle</span>
              No pending requests this cycle
            </div>
          )}
          {pendingRequestItems.map((req, i) => (
            <div key={i} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${typeCls(req.type)}`}>
                  {typeLabel(req.type)}
                </span>
                <div>
                  <p className="text-sm font-semibold leading-tight">{req.employeeName}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {req.requestCode} • {req.submittedAt ? req.submittedAt.substring(0, 10) : "—"}
                  </p>
                </div>
              </div>
              {req.priority === "high" && (
                <span className="material-symbols-outlined text-red-400 text-[18px]">priority_high</span>
              )}
            </div>
          ))}
        </div>
        {total > 0 && (
          <div className="px-6 py-3 bg-slate-50 border-t">
            <button
              onClick={() => navigate("/hr/requests")}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <span>View all {total} requests</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        )}
      </section>
    );
  }

  /* ================================================= */
  /* ========= SALARY DISTRIBUTION CHART ============= */
  /* ================================================= */
  function SalaryDistributionSection({ salaryDistribution }) {
    const total    = salaryDistribution.reduce((s, b) => s + b.count, 0);
    const maxCount = Math.max(...salaryDistribution.map((b) => b.count), 1);
    const hasData  = salaryDistribution.some((b) => b.count > 0);
    return (
      <section className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">bar_chart</span>
          <h3 className="font-bold">Net Salary Distribution</h3>
          <span className="text-xs text-slate-400 ml-auto">{total} employee{total !== 1 ? "s" : ""} · current cycle</span>
        </div>
        <div className="p-6">
          {!hasData ? (
            <div className="flex items-center justify-center h-28 text-slate-400 text-sm">No payroll data for distribution</div>
          ) : (
            <div className="space-y-2.5">
              {salaryDistribution.map((bucket, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-14 text-right shrink-0 font-mono">{bucket.rangeLabel}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary/70 to-primary rounded transition-all duration-700"
                      style={{ width: bucket.count > 0 ? `${Math.max((bucket.count / maxCount) * 100, 2)}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-6 text-right shrink-0">{bucket.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }
  