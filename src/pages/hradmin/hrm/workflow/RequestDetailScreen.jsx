import { useState } from "react";

export default function HRRequestDetailScreen() {
  const [comment, setComment] = useState("");

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">
            Request Detail: <span className="text-primary">#RQ-1024</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Workflow HR / Requests / #RQ-1024
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge color="amber" icon="pending">Status: Pending</Badge>
          <Badge color="primary" icon="hourglass_empty">Step: HR Approval</Badge>
        </div>
      </div>

      <div className="flex gap-8">

        {/* ================= LEFT (70%) ================= */}
        <div className="w-[70%] space-y-6">

          <EmployeeCard />

          <LeaveRequestDetails />

          <ApprovalTimeline />

          <DecisionPanel
            comment={comment}
            onChange={setComment}
          />
          

        </div>

        {/* ================= RIGHT (30%) ================= */}
        <div className="w-[30%] space-y-6">
          <LeaveContext />
          <ActivityFeed />
        </div>

      </div>
    </div>
  );
}

/* ================================================= */
/* ================= COMPONENTS ==================== */
/* ================================================= */

function Badge({ color, icon, children }) {
  const map = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${map[color]}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {children}
    </span>
  );
}

/* ================= EMPLOYEE CARD ================= */

function EmployeeCard() {
  return (
    <section className="bg-white rounded-xl border p-6">
      <div className="flex gap-6">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          className="w-20 h-20 rounded-xl object-cover"
        />

        <div className="grid grid-cols-3 gap-x-12 gap-y-2 flex-1">
          <Info label="Employee Name" value="Johnathan Doe" />
          <Info label="Employee Code" value="EMP-402" />
          <Info label="Department" value="Engineering" />
          <Info label="Position" value="Senior Software Engineer" />
          <Info label="Created Date" value="Oct 10, 2023" />
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

/* ================= REQUEST DETAILS ================= */

function LeaveRequestDetails() {
  return (
    <section className="bg-white rounded-xl border">
      <Header title="Leave Request Details" icon="description" />

      <div className="p-6 grid grid-cols-2 gap-8">
        <div className="space-y-3">
          <Row label="Leave Type" value="Annual Leave" />
          <Row label="From Date" value="Oct 12, 2023" />
          <Row label="To Date" value="Oct 14, 2023" />
          <Row label="Total Duration" value="3 Days" />
        </div>

        <div>
          <p className="text-sm text-slate-500 mb-2">Reason for Request</p>
          <div className="p-4 rounded-lg bg-slate-50 text-sm">
            Requesting time off for family personal reasons. I have ensured that
            my sprint tasks are reassigned and PRs reviewed.
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}

/* ================= TIMELINE ================= */

function ApprovalTimeline() {
  return (
    <section className="bg-white rounded-xl border">
      <Header title="Approval Timeline" icon="route" />

      <div className="p-10 flex justify-between relative">
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200" />

        <TimelineStep done label="Submitted" time="Oct 10, 09:00" />
        <TimelineStep done label="Manager Approved" time="Jane Smith · 14:30" />
        <TimelineStep active label="HR Approval" time="In Progress" />
        <TimelineStep label="Completed" />
      </div>
    </section>
  );
}

function TimelineStep({ done, active, label, time }) {
  return (
    <div className="flex flex-col items-center z-10 w-32">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          done
            ? "bg-green-500 text-white"
            : active
            ? "bg-primary text-white animate-pulse"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        <span className="material-symbols-outlined text-sm">
          {done ? "check" : active ? "hourglass_top" : "radio_button_unchecked"}
        </span>
      </div>
      <p className={`text-xs font-bold mt-2 ${active && "text-primary"}`}>
        {label}
      </p>
      {time && <p className="text-[10px] text-slate-500 text-center">{time}</p>}
    </div>
  );
}

/* ================= DECISION ================= */

function DecisionPanel({ comment, onChange }) {
  return (
    <section className="bg-white rounded-xl border-2 border-primary/20 p-6 bottom-6">
      <label className="text-sm font-bold flex justify-between mb-2">
        Decision Comments
        <span className="text-[10px] text-slate-400">
          * Required for rejection
        </span>
      </label>

      <textarea
        value={comment}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-24 rounded-lg border p-3 text-sm mb-4"
        placeholder="Enter your comments or reasons here..."
      />

      <div className="flex gap-4">
        <ActionBtn color="green" icon="check_circle">
          Approve Request
        </ActionBtn>
        <ActionBtn color="red" icon="cancel">
          Reject Request
        </ActionBtn>
      </div>
    </section>
  );
}

function ActionBtn({ color, icon, children }) {
  return (
    <button
      className={`flex-1 h-12 rounded-lg font-bold flex items-center justify-center gap-2 text-white ${
        color === "green" ? "bg-green-600" : "bg-red-600"
      }`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {children}
    </button>
  );
}

/* ================= RIGHT SIDE ================= */

function LeaveContext() {
  return (
    <section className="bg-white rounded-xl border p-6">
      <h3 className="font-bold text-sm mb-4">Leave Context</h3>

      <div className="bg-primary/5 p-4 rounded-xl mb-4">
        <p className="text-xs text-slate-500">Available Balance</p>
        <p className="text-3xl font-bold text-primary">12 Days</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <MiniStat label="Taken YTD" value="8 Days" />
        <MiniStat label="Pending" value="3 Days" />
      </div>

      <div>
        <div className="w-full h-2 bg-slate-200 rounded-full">
          <div className="h-full w-[40%] bg-primary rounded-full" />
        </div>
        <p className="text-[10px] text-slate-500 mt-2">
          Annual usage: 40% of entitlement
        </p>
      </div>
    </section>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-slate-100 p-3 rounded-lg text-center">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="font-bold text-sm">{value}</p>
    </div>
  );
}

/* ================= ACTIVITY ================= */

function ActivityFeed() {
  return (
    <section className="bg-white rounded-xl border flex flex-col max-h-[600px]">
      <Header title="Activity Feed" icon="history" />

      <div className="p-6 space-y-6 overflow-y-auto text-xs">
        <Activity
          icon="person"
          title="Manager Approval"
          subtitle="by Jane Smith"
          time="Today, 14:30"
          note="Employee has managed their handovers effectively. Recommendation: Approve."
        />
        <Activity
          icon="mail"
          title="Notification Sent"
          time="Today, 14:31"
        />
        <Activity
          icon="send"
          title="Request Submitted"
          time="Today, 09:00"
        />
      </div>

      <button className="text-primary text-xs font-bold py-3 hover:underline">
        View Full Audit Trail
      </button>
    </section>
  );
}

function Activity({ icon, title, subtitle, time, note }) {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
        <span className="material-symbols-outlined text-sm">{icon}</span>
      </div>
      <div>
        <p className="font-bold">
          {title}{" "}
          {subtitle && <span className="text-slate-400 font-normal">{subtitle}</span>}
        </p>
        <p className="text-[11px] text-slate-400">{time}</p>
        {note && (
          <div className="mt-2 italic bg-slate-50 p-2 rounded">
            "{note}"
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ title, icon }) {
  return (
    <div className="px-6 py-4 border-b flex items-center gap-2">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <h3 className="font-bold">{title}</h3>
    </div>
  );
}
