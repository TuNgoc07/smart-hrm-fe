import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE_URL=import.meta.env.VITE_API_BASE_URL || "http://localhost:8000".replace(/\/$/, "");

/* ─── Main Screen ─────────────────────────────────────────────── */
export default function RequestDetailScreen() {
  const navigate   = useNavigate();
  const { request_id } = useParams();

  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [comment,   setComment]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback,  setFeedback]  = useState(null);

  useEffect(() => {
    if (!request_id) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/manager/requests/${request_id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then((json) => setData(json.data ?? json))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [request_id]);

  const decide = async (decision) => {
    if (decision === "REJECTED" && !comment.trim()) {
      setFeedback({ type: "error", msg: "Comment is mandatory when rejecting." });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manager/requests/${request_id}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ decision, comment }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed");
      const msg = decision === "APPROVED"
        ? "Request approved. Attendance record will be updated automatically."
        : "Request rejected. Attendance record has been updated with notes.";
      setFeedback({ type: "success", msg: json.message ?? msg });
      setTimeout(() => navigate(-1), 1500);
    } catch (e) {
      setFeedback({ type: "error", msg: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin size-10 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (error) return (
    <div className="p-8 text-center text-red-500 font-medium">Failed to load request: {error}</div>
  );
  if (!data) return null;

  return (
    <main className="w-full">
      <BackSection navigate={() => navigate(-1)} />
      <RequestHeader data={data} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <LeftColumn
          data={data}
          comment={comment}
          setComment={setComment}
          decide={decide}
          submitting={submitting}
          feedback={feedback}
        />
        <RightColumn data={data} />
      </div>
    </main>
  );
}

/* ─── Back ────────────────────────────────────────────────────── */
function BackSection({ navigate }) {
  return (
    <div className="mb-8">
      <button
        onClick={navigate}
        className="flex items-center gap-2 text-primary text-sm font-bold hover:underline"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Requests
      </button>
    </div>
  );
}

/* ─── Header ──────────────────────────────────────────────────── */
function RequestHeader({ data }) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-black tracking-tight">{data.typeLabel}</h2>
          <StatusBadge status={data.status} />
        </div>
        <p className="text-[#4c739a] text-sm">
          Submitted on {data.submittedAtFormatted} &bull; Request ID:{" "}
          <span className="font-bold">#{data.requestCode ?? data.requestId}</span>
        </p>
      </div>
      {data.priority && (
        <PriorityBadge priority={data.priority} />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status ?? "").toLowerCase();
  const cfg = {
    pending:  "bg-yellow-100 text-yellow-700 border-yellow-200",
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  }[s] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <div className={`flex h-7 items-center justify-center rounded-lg px-3 border ${cfg}`}>
      <p className="text-xs font-bold uppercase tracking-wider">{status}</p>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const p = (priority ?? "").toLowerCase();
  const cfg = {
    high:   "bg-red-50 text-red-600 border-red-200",
    urgent: "bg-red-100 text-red-700 border-red-300",
    normal: "bg-blue-50 text-blue-600 border-blue-200",
    low:    "bg-slate-50 text-slate-500 border-slate-200",
  }[p] ?? "bg-slate-50 text-slate-500 border-slate-200";
  return (
    <div className={`flex h-7 items-center rounded-lg px-3 border text-xs font-bold uppercase ${cfg}`}>
      {priority} Priority
    </div>
  );
}

/* ─── Left Column ─────────────────────────────────────────────── */
function LeftColumn({ data, comment, setComment, decide, submitting, feedback }) {
  return (
    <div className="lg:col-span-2 flex flex-col gap-6">
      <RequestSummary data={data} />
      {data.impacts && data.impacts.length > 0 && <ContextImpact impacts={data.impacts} />}
      <DecisionWorkspace
        data={data}
        comment={comment}
        setComment={setComment}
        decide={decide}
        submitting={submitting}
        feedback={feedback}
      />
    </div>
  );
}

/* ─── Request Summary ─────────────────────────────────────────── */
function RequestSummary({ data }) {
  const isLeave = data.requestType === "LEAVE";
  const isOT    = data.requestType === "OT";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 shadow-sm">
      <SectionTitle icon="description" title="Request Summary" />
      <div className="grid grid-cols-2 gap-y-6">

        <InfoBlock label="Employee">
          <div className="flex items-center gap-2">
            <Avatar name={data.name} avatarUrl={data.avatarUrl} size={8} />
            <div>
              <p className="text-sm font-bold">{data.name}</p>
              <p className="text-xs text-[#4c739a]">
                {data.position ?? data.empCode}
                {data.department ? ` • ${data.department}` : ""}
              </p>
            </div>
          </div>
        </InfoBlock>

        <InfoBlock label="Request Type">
          <p className="text-sm font-semibold">{data.typeLabel}</p>
          {isLeave && data.leaveType && (
            <p className="text-xs text-[#4c739a] mt-0.5">{data.leaveType}</p>
          )}
        </InfoBlock>

        {isLeave && data.startDate && (
          <InfoBlock label="Dates">
            <p className="text-sm font-semibold">
              {formatDate(data.startDate)} – {formatDate(data.endDate)}
            </p>
          </InfoBlock>
        )}

        {isOT && data.otDate && (
          <InfoBlock label="OT Date">
            <p className="text-sm font-semibold">{formatDate(data.otDate)}</p>
            {data.otStartTime && (
              <p className="text-xs text-[#4c739a] mt-0.5">{data.otStartTime} – {data.otEndTime}</p>
            )}
          </InfoBlock>
        )}

        {isLeave && data.durationDays && (
          <InfoBlock label="Duration">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">{data.durationDays} Day{data.durationDays !== "1" ? "s" : ""}</span>
              {data.dayType && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                  {data.dayType}
                </span>
              )}
            </div>
          </InfoBlock>
        )}

        {(data.reason || data.otReason || data.description) && (
          <div className="col-span-2">
            <p className="text-[#4c739a] text-xs font-bold uppercase mb-1">Reason</p>
            <p className="text-sm leading-relaxed bg-background-light dark:bg-slate-800 p-3 rounded-lg italic">
              "{data.reason ?? data.otReason ?? data.description}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Context & Impact ────────────────────────────────────────── */
const SEVERITY_CFG = {
  critical: { color: "red",    icon: "error" },
  high:     { color: "red",    icon: "error" },
  medium:   { color: "amber",  icon: "warning" },
  low:      { color: "blue",   icon: "info" },
};

function ContextImpact({ impacts }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 shadow-sm">
      <SectionTitle icon="analytics" title="Context & Impact Assessment" iconColor="text-amber-500" />
      <div className="space-y-4">
        {impacts.map((imp, i) => {
          const cfg = SEVERITY_CFG[(imp.severity ?? "medium").toLowerCase()] ?? SEVERITY_CFG.medium;
          return (
            <ImpactBox
              key={i}
              color={cfg.color}
              icon={cfg.icon}
              title={imp.title}
              desc={imp.description}
            />
          );
        })}
      </div>
    </div>
  );
}

function ImpactBox({ color, icon, title, desc }) {
  return (
    <div className={`flex gap-4 p-4 rounded-lg bg-${color}-50 dark:bg-${color}-900/10 border border-${color}-100 dark:border-${color}-900/30`}>
      <span className={`material-symbols-outlined text-${color}-500`}>{icon}</span>
      <div>
        <p className={`text-sm font-bold text-${color}-800 dark:text-${color}-400`}>{title}</p>
        <p className={`text-sm text-${color}-700 dark:text-${color}-500`}>{desc}</p>
      </div>
    </div>
  );
}

/* ─── Decision Workspace ──────────────────────────────────────── */
function DecisionWorkspace({ data, comment, setComment, decide, submitting, feedback }) {
  const isPending = (data.status ?? "").toLowerCase() === "pending";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border-2 border-primary/20 dark:border-primary/40 p-8 shadow-md">
      <h3 className="text-lg font-bold mb-4">Decision Workspace</h3>
      {!isPending ? (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-[#4c739a]">
          This request has already been <span className="font-bold capitalize">{data.status}</span>.
          No further action is required.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-bold text-[#4c739a]">Decision Comment</span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="form-textarea w-full rounded-lg border dark:bg-slate-800 h-24 placeholder:text-sm"
              placeholder="Add a comment to support your decision... (Mandatory for rejection)"
              disabled={submitting}
            />
          </label>

          {feedback && (
            <p className={`text-sm font-medium px-3 py-2 rounded-lg ${
              feedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
            }`}>
              {feedback.msg}
            </p>
          )}

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => decide("APPROVED")}
              disabled={submitting}
              className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Approve Request
            </button>
            <button
              onClick={() => decide("REJECTED")}
              disabled={submitting}
              className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined">cancel</span>
              Reject Request
            </button>
          </div>

          <p className="text-center text-xs text-[#4c739a] italic">
            A notification will be sent immediately to {data.name} upon decision.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Right Column ────────────────────────────────────────────── */
function RightColumn({ data }) {
  return (
    <div className="flex flex-col gap-6">
      <HistoryTimeline data={data} />
    </div>
  );
}

/* ─── History & Timeline ──────────────────────────────────────── */
const STEP_STATUS_COLOR = {
  approved: "emerald",
  rejected: "rose",
  pending:  "orange",
  skipped:  "slate",
};

function HistoryTimeline({ data }) {
  const steps = data.approvalSteps ?? [];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border p-6 shadow-sm sticky top-24">
      <SectionTitle icon="history" title="History & Timeline" />

      {/* Submitted step always first */}
      <div className="relative pl-6 border-l-2 flex flex-col gap-8">
        <TimelineStep
          color="blue"
          title="Request Submitted"
          by={`by ${data.name}`}
          time={data.submittedAtFormatted}
        />

        {steps.map((step, i) => {
          const color = STEP_STATUS_COLOR[(step.status ?? "pending").toLowerCase()] ?? "orange";
          return (
            <TimelineStep
              key={step.stepId ?? i}
              color={color}
              title={step.stepName}
              by={step.approverName}
              time={step.actedAt ? fmtDateTime(step.actedAt) : null}
              status={step.isCurrent ? "Pending Review" : (step.status ? capitalise(step.status) : null)}
              comment={step.comment}
              dueAt={step.isCurrent && step.dueAt ? `Due by ${fmtDateTime(step.dueAt)}` : null}
            />
          );
        })}

        {/* Auto-escalation banner */}
        {data.hasEscalation && data.escalationDeadline && (
          <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-sm">info</span>
              <span className="text-xs font-bold text-primary">Auto-Escalation</span>
            </div>
            <p className="text-[11px] text-[#4c739a]">
              This request will be automatically escalated
              {data.escalationTargetName ? ` to ${data.escalationTargetName}` : ""}
              {" "}if not actioned by {fmtDateTime(data.escalationDeadline)}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineStep({ color, title, by, time, status, comment, dueAt }) {
  return (
    <div className="relative">
      <div className={`absolute -left-[33px] top-0 size-4 bg-${color}-500 rounded-full border-4 border-white dark:border-slate-900`} />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold leading-none">{title}</p>
        <p className="text-xs text-[#4c739a]">{by}</p>
        {time && (
          <p className="text-[10px] bg-[#e7edf3] dark:bg-slate-800 self-start px-2 py-0.5 rounded">{time}</p>
        )}
        {status && (
          <p className="text-[10px] text-[#4c739a] font-medium">Status: {status}</p>
        )}
        {dueAt && (
          <p className="text-[10px] text-orange-500 font-medium">{dueAt}</p>
        )}
        {comment && (
          <p className="text-[11px] italic text-slate-500 mt-1">"{comment}"</p>
        )}
      </div>
    </div>
  );
}

/* ─── Shared ──────────────────────────────────────────────────── */
function SectionTitle({ icon, title, iconColor = "text-primary" }) {
  return (
    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
      <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
      {title}
    </h3>
  );
}

function InfoBlock({ label, children }) {
  return (
    <div>
      <p className="text-[#4c739a] text-xs font-bold uppercase mb-1">{label}</p>
      {children}
    </div>
  );
}

function Avatar({ name, avatarUrl, size }) {
  const initials = name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
  const cls = `w-${size} h-${size} rounded-full flex-shrink-0`;
  if (avatarUrl) return <img src={avatarUrl} alt={name} className={`${cls} object-cover border`} />;
  return (
    <div className={`${cls} bg-primary text-white flex items-center justify-center text-xs font-bold`}>
      {initials}
    </div>
  );
}

/* ─── Date helpers ────────────────────────────────────────────── */
function formatDate(str) {
  if (!str) return "—";
  try {
    const d = new Date(str);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return str; }
}

function fmtDateTime(str) {
  if (!str) return "—";
  try {
    const d = new Date(str.replace(" ", "T"));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      + ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch { return str; }
}

function capitalise(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
