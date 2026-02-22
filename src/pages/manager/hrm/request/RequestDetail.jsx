import { useNavigate } from "react-router-dom";

export default function RequestDetailScreen() {
    const navigate = useNavigate();
    return (
      <main className="w-full">
        <BackSection navigate = {() => navigate(-1)} />
        <RequestHeader />
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <LeftColumn />
          <RightColumn />
        </div>
      </main>
    );
  }
  
  /* =========================
     BACK + BREADCRUMB
  ========================= */
  function BackSection({navigate}) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <button
          onClick =  {navigate}
          className="flex items-center gap-2 text-primary text-sm font-bold hover:underline">
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Back to Requests
          </button>
        </div>
      </div>
    );
  }
  
  /* =========================
     HEADER
  ========================= */
  function RequestHeader() {
    return (
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight">
              Leave Request
            </h2>
            <StatusBadge />
          </div>
          <p className="text-[#4c739a] text-sm ">
            Submitted on Oct 20, 2024 • Request ID: #LR-92841
          </p>
        </div>
      </div>
    );
  }
  
  function StatusBadge() {
    return (
      <div className="flex h-7 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30 px-3 border border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-700 dark:text-yellow-500 text-xs font-bold uppercase tracking-wider">
          Pending
        </p>
      </div>
    );
  }
  
  /* =========================
     LEFT COLUMN
  ========================= */
  function LeftColumn() {
    return (
      <div className="lg:col-span-2 flex flex-col gap-6">
        <RequestSummary />
        <ContextImpact />
        <DecisionWorkspace />
      </div>
    );
  }
  
  /* =========================
     REQUEST SUMMARY
  ========================= */
  function RequestSummary() {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 shadow-sm">
        <SectionTitle icon="description" title="Request Summary" />
  
        <div className="grid grid-cols-2 gap-y-6">
          <InfoBlock label="Employee">
            <EmployeeInfo />
          </InfoBlock>
  
          <InfoBlock label="Request Type">
            <p className="text-sm font-semibold">Annual Leave</p>
          </InfoBlock>
  
          <InfoBlock label="Dates">
            <p className="text-sm font-semibold">
              Oct 21 - Oct 23, 2024
            </p>
          </InfoBlock>
  
          <InfoBlock label="Duration">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">
                3 Days
              </span>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                Full Days
              </span>
            </div>
          </InfoBlock>
  
          <div className="col-span-2">
            <p className="text-[#4c739a] text-xs font-bold uppercase mb-1">
              Reason
            </p>
            <p className="text-sm leading-relaxed bg-background-light dark:bg-slate-800 p-3 rounded-lg italic">
              "Family event - attending a relative's wedding in another
              city. Need these days to travel and participate in ceremonies."
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  function EmployeeInfo() {
    return (
      <div className="flex items-center gap-2">
        <div
          className="size-8 rounded-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDppj6XtOycXrCw61DS0CdqKd_kYnt2pb2gQEkLEIERIOiie8GT3a7eo9ocPTKmZggzeHFG0AMcTe5LvxIL_3T-8_sNFfMJF5ai1ir7L38qwNbnCr9vHaclTQCanGRAHGmvAF92Fmpkj10RLkBmY4Y40AQTevkqS9wh1oE8fuNSMMbKLdRo5SJqtDYx05XDDwqW5o3NHgob3ptQad9nEztQX5CYVyQ5FaBgJF6U3e9QynpFT5RzgQBwQlN8ey8SZBm8ZLf9dZ97eEQ')",
          }}
        />
        <div>
          <p className="text-sm font-bold">John Doe</p>
          <p className="text-xs text-[#4c739a]">UI Designer</p>
        </div>
      </div>
    );
  }
  
  function InfoBlock({ label, children }) {
    return (
      <div>
        <p className="text-[#4c739a] text-xs font-bold uppercase mb-1">
          {label}
        </p>
        {children}
      </div>
    );
  }
  
  /* =========================
     CONTEXT & IMPACT
  ========================= */
  function ContextImpact() {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 shadow-sm">
        <SectionTitle
          icon="analytics"
          title="Context & Impact Assessment"
          iconColor="text-amber-500"
        />
  
        <div className="space-y-4">
          <ImpactBox
            color="amber"
            icon="group_off"
            title="Team Impact"
            desc="2 other members (Sarah J., Mike R.) are also off on these dates. Team capacity will be at 60%."
          />
          <ImpactBox
            color="red"
            icon="error"
            title="Project Impact"
            desc="Milestone Alpha might be delayed. John is the primary owner of the final UI handoff scheduled for Oct 23."
          />
        </div>
      </div>
    );
  }
  
  function ImpactBox({ color, icon, title, desc }) {
    return (
      <div
        className={`flex gap-4 p-4 rounded-lg bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-100 dark:border-${color}-900/30`}
      >
        <span className={`material-symbols-outlined text-${color}-500`}>
          {icon}
        </span>
        <div>
          <p className={`text-sm font-bold text-${color}-800 dark:text-${color}-400`}>
            {title}
          </p>
          <p className={`text-sm text-${color}-700 dark:text-${color}-500`}>
            {desc}
          </p>
        </div>
      </div>
    );
  }
  
  /* =========================
     DECISION WORKSPACE
  ========================= */
  function DecisionWorkspace() {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-primary/20 dark:border-primary/40 p-8 shadow-md">
        <h3 className="text-lg font-bold mb-4">
          Decision Workspace
        </h3>
  
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[#4c739a]">
              Decision Comment
            </span>
            <textarea
              className="form-textarea w-full rounded-lg border dark:bg-slate-800 h-24 placeholder:text-sm"
              placeholder="Add a comment to support your decision... (Mandatory for rejection)"
            />
          </label>
  
          <div className="flex gap-4 mt-2">
            <DecisionButton
              color="emerald"
              icon="check_circle"
              label="Approve Request"
            />
            <DecisionButton
              color="rose"
              icon="cancel"
              label="Reject Request"
            />
          </div>
  
          <p className="text-center text-xs text-[#4c739a] italic">
            A notification will be sent immediately to John Doe upon decision.
          </p>
        </div>
      </div>
    );
  }
  
  function DecisionButton({ color, icon, label }) {
    return (
      <button
        className={`flex-1 h-12 bg-${color}-600 hover:bg-${color}-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors`}
      >
        <span className="material-symbols-outlined">
          {icon}
        </span>
        {label}
      </button>
    );
  }
  
  /* =========================
     RIGHT COLUMN
  ========================= */
  function RightColumn() {
    return (
      <div className="flex flex-col gap-6">
        <HistoryTimeline />
      </div>
    );
  }
  
  /* =========================
     HISTORY & TIMELINE
  ========================= */
  function HistoryTimeline() {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 shadow-sm sticky top-24">
        <SectionTitle icon="history" title="History & Timeline" />
  
        <div className="relative pl-6 border-l-2 flex flex-col gap-8">
          <TimelineStep
            color="blue"
            title="Request Submitted"
            by="by John Doe"
            time="Oct 20, 09:00 AM"
          />
          <TimelineStep
            color="orange"
            title="Awaiting Decision"
            by="Assigned to Alex Thompson"
            status="Pending Review"
          />
          <TimelineStep
            color="emerald"
            title="Done"
            by="Manager of Financial Division"
            status="Pending Review"
          />
  
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-sm">
                info
              </span>
              <span className="text-xs font-bold text-primary">
                Auto-Escalation
              </span>
            </div>
            <p className="text-[11px] text-[#4c739a]">
              This request will be automatically escalated to Department Head
              if not actioned by Oct 21, 09:00 AM.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  function TimelineStep({ color, title, by, time, status }) {
    return (
      <div className="relative">
        <div
          className={`absolute -left-[33px] top-0 size-4 bg-${color}-500 rounded-full border-4 border-white dark:border-slate-900`}
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold leading-none">{title}</p>
          <p className="text-xs text-[#4c739a]">{by}</p>
          {time && (
            <p className="text-[10px] bg-[#e7edf3] dark:bg-slate-800 self-start px-2 py-0.5 rounded">
              {time}
            </p>
          )}
          {status && (
            <p className="text-[10px] text-[#4c739a] font-medium">
              Status: {status}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  /* =========================
     SHARED
  ========================= */
  function SectionTitle({ icon, title, iconColor = "text-primary" }) {
    return (
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
        <span className={`material-symbols-outlined ${iconColor}`}>
          {icon}
        </span>
        {title}
      </h3>
    );
  }
  