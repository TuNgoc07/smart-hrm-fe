import { useNavigate } from "react-router-dom";

export default function PayrollOverviewScreen() {
  const navigate = useNavigate();
    return (
      <div className="space-y-8 ">
  
        {/* ================= HEADER ================= */}
        <Header />
  
        {/* ================= KPI CARDS ================= */}
        <KPISection />
  
        {/* ================= PAYROLL WORKFLOW ================= */}
        <PayrollWorkflow />

        {/* ================= AI INSIGHTS SECTION ================= */}
        <InsightSection/>
  
        {/* ================= MAIN CONTENT ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <AlertsSection />
          <TimelineSection />
          <QuickActions onClick = {navigate} />
        </div>
      </div>
    );
  }
  
  /* ================================================= */
  /* ================= HEADER ======================== */
  /* ================================================= */
  
  function Header() {
    return (
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Payroll Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            October 2024 • Status: <span className="text-green-600 font-bold">Open</span>
          </p>
        </div>
  
        
      </div>
    );
  }
  
  /* ================================================= */
  /* ================= KPI SECTION =================== */
  /* ================================================= */
  
  function KPISection() {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI icon="groups" label="Total Employees" value="1,240" note="+2.4%" />
        <KPI icon="task_alt" label="Attendance" value="1,215 / 1,240" badge="98% Done" green />
        <KPI icon="pending_actions" label="Payroll Status" value="In Progress" amber />
        <KPI icon="payments" label="Total Cost" value="$450,200.00" primary />
        <KPI icon="timer" label="Overtime Cost" value="$12,450.00" red />
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
  
  function PayrollWorkflow() {
    return (
      <section className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-6">Payroll Cycle Workflow</h3>
  
        <div className="flex items-center w-full">
                {/* STEP 1 */}
                <Step
                icon="check"
                label="Attendance Closed"
                status="done"
                />

                <Line colorLine = "completedLine" />
                {/* <Line color = "bg-green-300"/> */}

                {/* STEP 2 */}
                <Step
                icon="warning"
                label="Data Validation In Progress"
                status="warning"
                sub="2 Pending Issues"
                />

                <Line colorLine = "completedLine" />
                {/* <Line color = "bg-green-300"/> */}

                {/* STEP 3 */}
                <Step
                icon="lock"
                label="Payroll Calculated"
                status="locked"
                />

                <Line colorLine ="incompletedLine" />
                {/* <Line color = "bg-green-300"/> */}

                {/* STEP 4 */}
                <Step
                icon="lock"
                label="Payroll Locked"
                status="locked"
                />
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
  function InsightSection(){
    return (
      <section className="xl:col-span-5  overflow-hidden">
        <div className="px-6 py-4 flex items-center">
          <span class="material-symbols-outlined text-blue-400 mr-2">auto_awesome</span>
          <h2 className="font-bold">AI Payroll Insights </h2>
          
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 flex mb-4 ">
          <InsightCard 
            title = "OT Cost Trend"
            desc = "OT cost increased 12% than last month"
            icon = "trending_up"
            tips = "Possible cause: weekend deployment"
          />
          <InsightCard 
            title = "Payroll Anomaly"
            desc = "3 employees have abnormal payroll adjustments"
            icon = "warning"
            tips = "Review before locking payroll"
          />
          <InsightCard 
            title = "Cost Optimization"
            desc = "High OT detected in Engineer Team"
            icon = "tips_and_updates"
            tips = "Suggested Review: shift allocation"
          />
        </div>
      </section>
      
    );

  }

  function InsightCard ({title, desc, icon, tips}){
    return (
      <div class="flex xl:col-span-4 gap-5 p-7 rounded-xl border border-[#dbe0e6] dark:border-gray-800 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10 shadow-sm">
        <div class="size-10 shrink-0 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
          <span class="material-symbols-outlined">{icon}</span>
        </div>
        <div class="flex flex-col gap-1">
          <p class="text-xs font-bold text-[#617589] uppercase tracking-wider">{title}</p> 
          <p class="text-sm font-semibold text-[#111418] dark:text-gray-200">{desc}</p>
          <div class="flex items-center gap-1.5 mt-1">
            <span class="material-symbols-outlined text-[14px] text-primary/60">{icon}</span>
            <p class="text-[11px] text-[#617589] dark:text-gray-400">{tips}</p>
          </div>
        </div>
      </div>
    );
  }
  
  
  /* ================================================= */
  /* ================= ALERTS & TIMELINE SECTION======================== */
  /* ================================================= */
  
  function AlertsSection() {
    return (
      <section className="bg-white border xl:col-span-4 shadow-sm">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold">Alerts & Critical Issues</h3>
          <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded uppercase">
            3 Action Items
          </span>
        </div>
  
        <div className="divide-y">
          <Alert
            icon="notification_important"
            title="3 OT Requests pending approval"
            desc="Operations Dept • Required for calculation"
            amber
          />
          <Alert
            icon="event_busy"
            title="1 Leave Request waiting for HR"
            desc="John Doe • Unpaid leave adjustment"
            primary
          />
          <Alert
            icon="error"
            title="2 Employees with missing check-ins"
            desc="Manual override required to proceed"
            red
          />
        </div>
      </section>
    );
  }

  function TimelineSection(){
    return (
      <section className="bg-white border xl:col-span-4 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold">Payroll Activity Timeline</h3>
          <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded uppercase">
            3 Timelines
          </span>
        </div>
  
        <div className="divide-y">
          <Timeline
          icon = "check_circle"
          title = "Attendance Closed"
          desc = "By HRAdmin • Nguyen Thi A "
          time = "OCT 22 2026 10:00 AM"
          color = "bg-green-600"
          />
          <Timeline
          icon = "warning"
          title = "OT Approved (Partial)"
          desc = "By HRAdmin • Nguyen Van B "
          time = "OCT 22 2026 11:00 AM"
          color = "bg-red-600"

          />
          <Timeline
          icon = "hourglass_empty"
          title = "Payroll Caculation Started"
          desc = "By HRAdmin • Nguyen Thi A "
          time = "OCT 22 2026 16:00 PM"
          color = "bg-blue-600"

          />
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
  