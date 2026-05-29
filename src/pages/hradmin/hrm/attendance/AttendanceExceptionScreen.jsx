import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ReviewExceptionModal from "./ExceptionReviewModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/* ================= MAIN SCREEN ================= */

export default function AttendanceExceptionsScreen() {
  const navigate = useNavigate();
  const [reviewing, setReviewing]   = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setFilter]   = useState("all");

  const fetchExceptions = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res  = await fetch(`${API_BASE}/api/hradmin/attendance-exceptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExceptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch exceptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExceptions(); }, [fetchExceptions]);

  const filtered = statusFilter === "all"
    ? exceptions
    : exceptions.filter(e => e.status === statusFilter);

  const counts = {
    all:                   exceptions.length,
    pending:               exceptions.filter(e => e.status === "pending").length,
    pending_employee:      exceptions.filter(e => e.status === "pending_employee").length,
    explanation_submitted: exceptions.filter(e => e.status === "explanation_submitted").length,
    approved:              exceptions.filter(e => e.status === "approved").length,
    rejected:              exceptions.filter(e => e.status === "rejected").length,
  };

  return (
    <div className="space-y-8">
      <PageHeader onRefresh={fetchExceptions} />
      <SummaryGrid counts={counts} />
      <FilterBar active={statusFilter} onChange={setFilter} counts={counts} />

      {loading
        ? <LoadingState />
        : <ExceptionsTable
            data={filtered}
            onReview={setReviewing}
            onRefresh={fetchExceptions}
            navigate={navigate}
          />
      }

      {reviewing && (
        <ReviewExceptionModal
          data={reviewing}
          onClose={() => setReviewing(null)}
          onResolved={() => { setReviewing(null); fetchExceptions(); }}
        />
      )}
    </div>
  );
}

/* ================= PAGE HEADER ================= */

function PageHeader({ onRefresh }) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-3">
      <div>
        <h1 className="text-3xl font-black">Attendance Exceptions</h1>
        <p className="text-slate-500">Review and manage attendance irregularities detected by the system.</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onRefresh}
          className="flex items-center gap-2 px-4 h-10 bg-white border rounded-lg text-sm font-bold hover:bg-slate-50">
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
        <button className="flex items-center gap-2 px-4 h-10 bg-white border rounded-lg text-sm font-bold hover:bg-slate-50">
          <span className="material-symbols-outlined">download</span>
          Export
        </button>
      </div>
    </div>
  );
}

/* ================= SUMMARY ================= */

function SummaryGrid({ counts }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <SummaryCard label="Total" value={counts.all} icon="assessment" />
      <SummaryCard label="Pending Review" value={counts.pending} icon="pending_actions" color="amber" />
      <SummaryCard label="Awaiting Employee" value={counts.pending_employee} icon="hourglass_top" color="indigo" />
      <SummaryCard label="Explanation Ready" value={counts.explanation_submitted} icon="mark_email_read" color="blue" />
      <SummaryCard label="Resolved" value={counts.approved + counts.rejected} icon="check_circle" color="emerald" />
    </div>
  );
}

function SummaryCard({ label, value, icon, color }) {
  const styles = {
    amber:   "border-l-amber-400 text-amber-600",
    indigo:  "border-l-indigo-400 text-indigo-600",
    blue:    "border-l-blue-400 text-blue-600",
    emerald: "border-l-emerald-400 text-emerald-600",
  };
  const style = styles[color] || "border-l-slate-400 text-slate-900";
  return (
    <div className={`bg-white border border-l-4 ${style} rounded-xl p-5 shadow-sm`}>
      <div className="flex justify-between">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        <span className="material-symbols-outlined text-sm opacity-60">{icon}</span>
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

/* ================= FILTER BAR ================= */

const FILTERS = [
  { key: "all",                   label: "All" },
  { key: "pending",               label: "Pending" },
  { key: "pending_employee",      label: "Awaiting Employee" },
  { key: "explanation_submitted", label: "Explanation Ready" },
  { key: "approved",             label: "Approved" },
  { key: "rejected",             label: "Rejected" },
];

function FilterBar({ active, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-2 bg-white p-3 rounded-xl border shadow-sm">
      {FILTERS.map(f => (
        <button key={f.key} onClick={() => onChange(f.key)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
            active === f.key
              ? "bg-primary text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}>
          {f.label}
          {counts[f.key] > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              active === f.key ? "bg-white/30 text-white" : "bg-slate-300 text-slate-700"
            }`}>{counts[f.key]}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ================= TABLE ================= */

function ExceptionsTable({ data, onReview, navigate }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-16 text-center text-slate-400">
        <span className="material-symbols-outlined text-5xl block mb-3">check_circle</span>
        <p className="font-semibold">No exceptions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase">
          <tr>
            <Th>Employee</Th>
            <Th>Date</Th>
            <Th>Exception Type</Th>
            <Th>Detected By</Th>
            <Th>Reason</Th>
            <Th>Reference</Th>
            <Th>Status</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map(ex => <ExceptionRow key={ex.exceptionId} data={ex} onReview={onReview} navigate={navigate} />)}
        </tbody>
      </table>
    </div>
  );
}

function ExceptionRow({ data, onReview, navigate }) {
  const isExplanationReady = data.status === "explanation_submitted";
  const highlight = data.status === "pending" || isExplanationReady;
  const borderColor = isExplanationReady ? "border-l-blue-400" : "border-l-amber-400";
  console.log("data = " + JSON.stringify(data))

  return (
    <tr className={`${
      highlight ? `bg-amber-50/30 border-l-4 ${borderColor}` : ""
    } hover:bg-slate-50`}>
      <Td>
        <div className="flex items-center gap-3">
          <img src={data?.employeeInfo?.avatar} alt={data?.employeeInfo?.employeeName} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border" />
          <div>
            <p className="font-bold">{data?.employeeInfo?.employeeName || `Employee #${data?.employeeInfo?.employeeId}`}</p>
            <p className="text-xs text-slate-500">ID: #EMP-{data?.employeeInfo?.employeeId}</p>
          </div>
        </div>
      </Td>
      <Td>{data.attendanceDate}</Td>
      <Td>
        <div className="flex items-center gap-2">
          <ExceptionTypeBadge type={data.exceptionType} />
          {data.detectedBy === "SYSTEM" && (
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              AI
            </span>
          )}
        </div>
      </Td>
      <Td><span className="text-slate-500 italic">{data.detectedBy}</span></Td>
      <Td><span className="text-slate-500 text-xs max-w-[180px] block truncate" title={data.reason}>{data.reason}</span></Td>
      <Td>
        {data.referenceId ? (
          <button
            onClick={() => navigate(`/hr/request-details/${data.referenceId}`)}
            className="text-primary text-xs font-bold hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">link</span>
            #{data.referenceId}
            <span className="text-slate-400 font-normal">({data.referenceType})</span>
          </button>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </Td>
      <Td><StatusBadge status={data.status} /></Td>
      <Td right>
        <RowAction data={data} onReview={onReview} />
      </Td>
    </tr>
  );
}

function RowAction({ data, onReview }) {
  const { status } = data;
  if (status === "pending") {
    return (
      <button onClick={() => onReview(data)}
        className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600">
        Review
      </button>
    );
  }
  if (status === "explanation_submitted") {
    return (
      <button onClick={() => onReview(data)}
        className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">mark_email_read</span>
        Review
      </button>
    );
  }
  if (status === "pending_employee") {
    return (
      <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg flex items-center gap-1 border border-indigo-200">
        <span className="material-symbols-outlined text-sm">hourglass_top</span>
        Awaiting
      </span>
    );
  }
  return (
    <button onClick={() => onReview(data)} className="text-slate-400 hover:text-primary p-1">
      <span className="material-symbols-outlined">visibility</span>
    </button>
  );
}

/* ================= LOADING ================= */

function LoadingState() {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-16 text-center text-slate-400">
      <span className="material-symbols-outlined text-5xl block mb-3 animate-spin">autorenew</span>
      <p className="font-semibold">Loading exceptions...</p>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function StatusBadge({ status }) {
  const map = {
    pending:               "bg-amber-100 text-amber-700",
    pending_employee:      "bg-indigo-100 text-indigo-700",
    explanation_submitted: "bg-blue-100 text-blue-700",
    approved:              "bg-emerald-100 text-emerald-700",
    rejected:              "bg-rose-100 text-rose-700",
  };
  const labels = {
    pending:               "Pending",
    pending_employee:      "Awaiting Employee",
    explanation_submitted: "Explanation Ready",
    approved:              "Approved",
    rejected:              "Rejected",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {labels[status] || status}
    </span>
  );
}

function ExceptionTypeBadge({ type }) {
  const map = {
    EARLY_DEPARTURE:          "bg-orange-100 text-orange-700",
    OVERTIME:                 "bg-indigo-100 text-indigo-700",
    INSUFFICIENT_HOURS:       "bg-rose-100 text-rose-700",
    LATE_ARRIVAL:             "bg-amber-100 text-amber-700",
    MISSING_CHECKOUT:         "bg-red-100 text-red-700",
    LEAVE_OVERRIDE_CHECKIN:   "bg-amber-100 text-amber-800",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${map[type] || "bg-slate-100 text-slate-600"}`}>
      {type?.replace(/_/g, " ")}
    </span>
  );
}

function Th({ children, right }) {
  return <th className={`px-6 py-4 ${right ? "text-right" : ""}`}>{children}</th>;
}

function Td({ children, right }) {
  return <td className={`px-6 py-4 text-sm ${right ? "text-right" : ""}`}>{children}</td>;
}
