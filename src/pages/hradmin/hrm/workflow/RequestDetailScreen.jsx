import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

// ================= MAIN COMPONENT =================
export default function HRRequestDetailScreen() {
  const { request_id } = useParams();
  const [comment, setComment] = useState("");
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // ← thêm
 
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${API_BASE_URL}/api/hradmin/requests/${request_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      console.log(JSON.stringify(data));
      setRequest(data);
    };
    fetchData();
  }, [request_id]);
 
  async function handleApprove() {
    setError(null);
    setSuccess(null);
    const response = await fetch(`${API_BASE_URL}/api/hradmin/requests/${request_id}/decide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ decision: "APPROVED", comment }),
    });
 
    if (!response.ok) {
      const data = await response.json();
      setError(data.errorContent || "An unexpected error occurred.");
      return;
    }
 
    setSuccess("Request approved successfully!"); // ← thêm
    // refresh request data after successful action
    const updated = await fetch(`${API_BASE_URL}/api/hradmin/requests/${request_id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setRequest(await updated.json());
 
    // Auto-hide success message sau 3s
    setTimeout(() => setSuccess(null), 3000);
  }
 
  async function handleReject() {
    setError(null);
    setSuccess(null);
    const response = await fetch(`${API_BASE_URL}/api/hradmin/requests/${request_id}/decide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ decision: "REJECTED", comment }),
    });
 
    if (!response.ok) {
      const data = await response.json();
      setError(data.errorContent || "An unexpected error occurred.");
      return;
    }
 
    setSuccess("Request rejected successfully!"); // ← thêm
    const updated = await fetch(`${API_BASE_URL}/api/hradmin/requests/${request_id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setRequest(await updated.json());
 
    // Auto-hide success message sau 3s
    setTimeout(() => setSuccess(null), 3000);
  }
 
  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <ScreenHeader request={request} />
 
      <div className="flex gap-8">
        <div className="w-[70%] space-y-6">
          <EmployeeCard employeeInfo={request?.employeeInfo} />
          <LeaveRequestDetails details={request?.requestDetail} />
          <ApprovalTimeline timeline={request?.timeline} request={request} />
          <DecisionPanel
            comment={comment}
            onChange={setComment}
            onApprove={handleApprove}
            onReject={handleReject}
            error={error}
            success={success} // ← thêm prop
          />
        </div>
 
        <div className="w-[30%] space-y-6">
          <LeaveContext leaveBalance={request?.leaveBalance} />
          <ActivityFeed activities={request?.activities} />
        </div>
      </div>
    </div>
  );
}

// ================= SCREEN HEADER =================
function ScreenHeader({ request }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">
          Request Detail: <span className="text-primary">#{request?.requestCode || "RQ-NaN"}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Workflow HR / Requests / #{request?.requestCode || "RQ-NaN"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge status={request?.status || "PENDING"} icon="pending">Status: {request?.status || "Pending"}</Badge>
        <Badge color="primary" icon="hourglass_empty">Step: {request?.currentStepName || "HR Approval"}</Badge>
      </div>
    </div>
  );
}

// ================= BADGE COMPONENT =================
function Badge({ color, status, icon, children }) {
  const statusMap = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    in_progress: "bg-blue-100 text-blue-700",
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-slate-100 text-slate-700",
  };

  const colorMap = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-100 text-amber-700",
  };

  const className = status ? statusMap[status] || statusMap.pending : colorMap[color] || colorMap.primary;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${className}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {children}
    </span>
  );
}

// ================= EMPLOYEE CARD =================
function EmployeeCard({ employeeInfo }) {
  return (
    <section className="bg-white rounded-xl border p-6">
      <div className="flex gap-6">
        <img
          src={employeeInfo?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"}
          className="w-20 h-20 rounded-xl object-cover"
        />

        <div className="grid grid-cols-3 gap-x-12 gap-y-2 flex-1">
          <Info label="Employee Name" value={employeeInfo?.employeeName || "Unknown"} />
          <Info label="Employee Code" value={"#EMP-" + (employeeInfo?.employeeId || "Unknown")} />
          <Info label="Department" value={employeeInfo?.departmentName || "Unknown"} />
          <Info label="Position" value={employeeInfo?.positionName || "Unknown"} />
          <Info label="Work Email" value={employeeInfo?.workEmail || "Unknown"} />
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

// ================= LEAVE REQUEST DETAILS =================
function LeaveRequestDetails({ details }) {
  return (
    <section className="bg-white rounded-xl border">
      <SectionHeader title="Leave Request Details" icon="description" />

      <div className="p-6 grid grid-cols-2 gap-8">
        <div className="space-y-3">
          <Row label="Leave Type" value={details?.leaveType || "Annual Leave"} />
          <Row label="From Date" value={details?.startDate || "Oct 12, 2023"} />
          <Row label="To Date" value={details?.endDate || "Oct 14, 2023"} />
          <Row label="Total Duration" value={details?.durationDays + "(" + details?.durationUnit + ")" || "1 Day"} />
        </div>

        <div>
          <p className="text-sm text-slate-500 mb-2">Reason for Request</p>
          <div className="p-4 rounded-lg bg-slate-50 text-sm">
            {details?.reason || "Annual leave"}
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

// ================= APPROVAL TIMELINE =================
function ApprovalTimeline({ timeline, request }) {
  return (
    <section className="bg-white rounded-xl border">
      <SectionHeader title="Approval Timeline" icon="route" />

      <div className="p-10 flex justify-between relative">
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200" />
        <TimelineStep done={!!request?.submittedAt} label="Submitted" time={request?.submittedAt} />

        {timeline?.map((step) => (
          <TimelineStep
            key={step?.stepId}
            done={step?.status === "done"}
            active={step?.status === "active"}
            rejected={step?.status === "rejected"}
            label={step.stepName}
            time={step.actedAt || (step.status === "active" ? "In Progress" : null)}
          />
        ))}

        <TimelineStep
          done={request?.status === "approved"}
          active={false}
          label="Completed"
          time={request?.completedAt || (request?.status === "approved" ? request?.decisionAt : null)}
        />
      </div>
    </section>
  );
}

function TimelineStep({ done, active, rejected, label, time }) {
  return (
    <div className="flex flex-col items-center z-10 w-32">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center ${done
            ? "bg-green-500 text-white"
            : rejected
              ? "bg-red-500 text-white"
              : active
                ? "bg-primary text-white animate-pulse"
                : "bg-slate-200 text-slate-500"
          }`}
      >
        <span className="material-symbols-outlined text-sm">
          {done ? "check" : rejected ? "close" : active ? "hourglass_top" : "radio_button_unchecked"}
        </span>
      </div>
      <p className={`text-xs font-bold mt-2 ${active ? "text-primary" : rejected ? "text-red-500" : ""}`}>
        {label}
      </p>
      {time && <p className="text-[10px] text-slate-500 text-center">{time}</p>}
    </div>
  );
}

// ================= DECISION PANEL =================
function DecisionPanel({ comment, onChange, onApprove, onReject, error, success }) {
  return (
    <section className="bg-white rounded-xl border-2 border-primary/20 p-6">
      <label className="text-sm font-bold flex justify-between mb-2">
        Decision Comments
        <span className="text-[10px] text-slate-400">* Required for rejection</span>
      </label>
 
      <textarea
        value={comment}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-24 rounded-lg border p-3 text-sm mb-4"
        placeholder="Enter your comments or reasons here..."
      />
 
      {/* Success banner */}
      {success && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          <span className="material-symbols-outlined text-base mt-0.5">check_circle</span>
          {success}
        </div>
      )}
 
      {/* Error banner */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <span className="material-symbols-outlined text-base mt-0.5">error</span>
          {error}
        </div>
      )}
 
      <div className="flex gap-4">
        <ActionBtn color="green" icon="check_circle" onClick={onApprove}>
          Approve Request
        </ActionBtn>
        <ActionBtn color="red" icon="cancel" onClick={onReject}>
          Reject Request
        </ActionBtn>
      </div>
    </section>
  );
}

function ActionBtn({ color, icon, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-12 rounded-lg font-bold flex items-center justify-center gap-2 text-white ${color === "green" ? "bg-green-600" : "bg-red-600"}`}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {children}
    </button>
  );
}

// ================= LEAVE CONTEXT =================
function LeaveContext({ leaveBalance }) {
  const leaveData = leaveBalance || {
    availableBalance: 12,
    takenYTD: 8,
    pending: 3,
    annualUsage: 40,
  };

  return (
    <section className="bg-white rounded-xl border p-6">
      <h3 className="font-bold text-sm mb-4">Leave Context</h3>

      <div className="bg-primary/5 p-4 rounded-xl mb-4">
        <p className="text-xs text-slate-500">Available Balance</p>
        <p className="text-3xl font-bold text-primary">{leaveData.entitledDays} Days</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <MiniStat label="Taken YTD" value={`${leaveData.usedDays} Days`} />
        <MiniStat label="Pending" value={`${leaveData.pendingDays} Days`} />
      </div>

      <div>
        <div className="w-full h-2 bg-slate-200 rounded-full">
          <div className="h-full bg-primary rounded-full" style={{ width: `${leaveData.usagePercentage}%` }} />
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Annual usage: {leaveData.usagePercentage} of entitlement</p>
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

// ================= ACTIVITY FEED =================
function ActivityFeed({ activities }) {
  const activityList = activities || [
    {
      icon: "person",
      title: "Manager Approval",
      subtitle: "by Jane Smith",
      time: "Today, 14:30",
      note: "Employee has managed their handovers effectively. Recommendation: Approve.",
    },
    {
      icon: "mail",
      title: "Notification Sent",
      time: "Today, 14:31",
    },
    {
      icon: "send",
      title: "Request Submitted",
      time: "Today, 09:00",
    },
  ];

  return (
    <section className="bg-white rounded-xl border flex flex-col max-h-[600px]">
      <SectionHeader title="Activity Feed" icon="history" />

      <div className="p-6 space-y-6 overflow-y-auto text-xs">
        {activityList.map((activity, index) => (
          <Activity key={index} icon={activity.icon} title={activity.title} subtitle={activity.subtitle} time={activity.time} note={activity.note} />
        ))}
      </div>

      <button className="text-primary text-xs font-bold py-3 hover:underline">View Full Audit Trail</button>
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
          {title} {subtitle && <span className="text-slate-400 font-normal">{subtitle}</span>}
        </p>
        <p className="text-[11px] text-slate-400">{time}</p>
        {note && <div className="mt-2 italic bg-slate-50 p-2 rounded">"{note}"</div>}
      </div>
    </div>
  );
}

// ================= SHARED COMPONENTS =================
function SectionHeader({ title, icon }) {
  return (
    <div className="px-6 py-4 border-b flex items-center gap-2">
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <h3 className="font-bold">{title}</h3>
    </div>
  );
}
