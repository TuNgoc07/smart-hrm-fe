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

  const kpi      = data?.kpi      ?? {};
  const workflow = data?.workflow  ?? {};
  const alerts   = data?.alerts   ?? [];
  const timeline = data?.timeline ?? [];
  const insights = data?.insights ?? {};

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

      {/* ================= AI INSIGHTS SECTION ================= */}
      <InsightSection insights={insights} />

      {/* ================= MAIN CONTENT ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <AlertsSection alerts={alerts} />
        <TimelineSection timeline={timeline} />
        <QuickActions onClick={navigate} />
      </div>
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
  /* ================= AI INSIGHTS SECTION ================= */
  /* ================================================= */
  function InsightSection({ insights }) {
    const trendDir  = insights.otCostTrendDirection;
    const trendIcon = trendDir === "up" ? "trending_up" : trendDir === "down" ? "trending_down" : "trending_flat";
    const trendDesc = insights.otCostTrendLabel && insights.otCostTrendLabel !== "N/A"
      ? `OT cost ${trendDir === "up" ? "increased" : "decreased"} ${insights.otCostTrendLabel} vs last cycle`
      : "Not enough data to compare yet";

    const anomalyDesc = insights.anomalyCount > 0
      ? `${insights.anomalyCount} employee${insights.anomalyCount > 1 ? "s have" : " has"} manual payroll adjustments`
      : "No anomalies detected this cycle";

    return (
      <section className="overflow-hidden">
        <div className="px-0 py-4 flex items-center">
          <span className="material-symbols-outlined text-blue-400 mr-2">auto_awesome</span>
          <h2 className="font-bold">AI Payroll Insights</h2>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-4">
          <InsightCard
            title="OT Cost Trend"
            desc={trendDesc}
            icon={trendIcon}
            tips="Compare with previous payroll cycle"
          />
          <InsightCard
            title="Payroll Anomaly"
            desc={anomalyDesc}
            icon="warning"
            tips={insights.anomalyCount > 0 ? "Review before locking payroll" : "All results look normal"}
          />
          <InsightCard
            title="Cost Summary"
            desc={insights.topOtDepartment ? `High OT detected in ${insights.topOtDepartment}` : "Insufficient data for department analysis"}
            icon="tips_and_updates"
            tips="Review shift allocation if OT is high"
          />
        </div>
      </section>
    );
  }

  function InsightCard ({title, desc, icon, tips}){
    return (
      <div className="flex xl:col-span-4 gap-5 p-7 rounded-xl border border-[#dbe0e6] dark:border-gray-800 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 shadow-sm">
        <div className="size-10 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold text-[#617589] uppercase tracking-wider">{title}</p> 
          <p className="text-sm font-semibold text-[#111418] dark:text-gray-200">{desc}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-[14px] text-primary/60">{icon}</span>
            <p className="text-[11px] text-[#617589] dark:text-gray-400">{tips}</p>
          </div>
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
  