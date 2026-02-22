import { useState } from "react";
import ReviewExceptionModal from "./ExceptionReviewModal";

/* ================= MAIN SCREEN ================= */

export default function AttendanceExceptionsScreen() {
    const [reviewing, setReviewing] = useState(null);

  return (
    <div className="space-y-8">

      {/* PAGE HEADER */}
      <PageHeader />

      {/* SUMMARY CARDS */}
      <SummaryGrid />

      {/* FILTER BAR */}
      <FilterBar />

      {/* TABLE */}
      <ExceptionsTable onReview = {setReviewing} />
      
      {reviewing && (
        <ReviewExceptionModal 
            data= {reviewing} 
            onClose={() => setReviewing(null)} />
      )}
    </div>
    
  );
}

/* ================= PAGE HEADER ================= */

function PageHeader() {
  return (
    <div className="flex flex-wrap justify-between items-end gap-3">
      <div>
        <h1 className="text-3xl font-black">Attendance Exceptions</h1>
        <p className="text-slate-500">
          Review and manage attendance irregularities flagged by AI or managers.
        </p>
      </div>

      <button className="flex items-center gap-2 px-4 h-10 bg-white border rounded-lg text-sm font-bold hover:bg-slate-50">
        <span className="material-symbols-outlined">download</span>
        Export Report
      </button>
    </div>
  );
}

/* ================= SUMMARY ================= */

function SummaryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <SummaryCard label="Total Exceptions" value="128" icon="assessment" />
      <SummaryCard label="Pending Review" value="42" icon="pending_actions" amber />
      <SummaryCard label="Approved" value="74" icon="check_circle" green />
      <SummaryCard label="Rejected" value="12" icon="cancel" red />
    </div>
  );
}

function SummaryCard({ label, value, icon, amber, green, red }) {
  const color =
    amber ? "border-l-amber-400 text-amber-600"
    : green ? "border-l-emerald-400 text-emerald-600"
    : red ? "border-l-rose-400 text-rose-600"
    : "border-l-primary text-slate-900";

  return (
    <div className={`bg-white border border-l-4 ${color} rounded-xl p-6 shadow-sm`}>
      <div className="flex justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

/* ================= FILTER BAR ================= */

function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
      <FilterItem icon="calendar_today" label="Oct 01 - Oct 31" />
      <FilterItem label="Dept: Engineering" />
      <FilterItem label="Type: All Exceptions" />
      <FilterItem label="Status: Pending" />

      <button className="ml-auto text-primary text-sm font-bold hover:underline">
        Clear all filters
      </button>
    </div>
  );
}

function FilterItem({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border cursor-pointer">
      {icon && <span className="material-symbols-outlined text-slate-500">{icon}</span>}
      <span className="text-sm font-medium">{label}</span>
      <span className="material-symbols-outlined text-slate-400 ml-auto">expand_more</span>
    </div>
  );
}

/* ================= TABLE ================= */

function ExceptionsTable({ onReview }) {
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
            <Th>Status</Th>
            <Th right>Actions</Th>
          </tr>
        </thead>

        <tbody className="divide-y">
          <ExceptionRow
            highlight
            data={{
              name: "Marcus Thorne",
              empId: "EMP-8821",
              avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              date: "12 Oct 2023",
              type: "Missing Check-in",
              ai: true,
              detectedBy: "System AI",
              reason: "Device battery failure reported",
              status: "Pending",
            }}
            onReview = {onReview}  
          />

          <ExceptionRow
            data={{
              name: "Sarah Jenkins",
              empId: "EMP-9012",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              date: "12 Oct 2023",
              type: "Out of Location",
              detectedBy: "Manager Alpha",
              reason: "Client site visit",
              status: "Approved",
            }}
            onReview = {onReview}  

            
          />
            <ExceptionRow
            data={{
              name: "Sarah Jenkins",
              empId: "EMP-9012",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              date: "12 Oct 2023",
              type: "Out of Location",
              detectedBy: "Manager Alpha",
              reason: "Client site visit",
              status: "Approved",
            }}
            onReview = {onReview}    
          />
            <ExceptionRow
            data={{
              name: "Sarah Jenkins",
              empId: "EMP-9012",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              date: "12 Oct 2023",
              type: "Out of Location",
              detectedBy: "Manager Alpha",
              reason: "Client site visit",
              status: "Rejected",
            }}
            onReview = {onReview}  
            
          />
            <ExceptionRow
            data={{
              name: "Sarah Jenkins",
              empId: "EMP-9012",
              avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              date: "12 Oct 2023",
              type: "Out of Location",
              detectedBy: "Manager Alpha",
              reason: "Client site visit",
              status: "Pending",
            }}
            onReview = {onReview}  
          />
          
        </tbody>
      </table>
    </div>
  );
}

function ExceptionRow({ data, highlight , onReview}) {
  return (
    <tr className={`${highlight ? "bg-amber-50/40 border-l-4 border-l-amber-400" : ""} hover:bg-slate-50`}>
      <Td>
        <div className="flex items-center gap-3">
          <img src={data.avatar} className="w-9 h-9 rounded-full border" />
          <div>
            <p className="font-bold">{data.name}</p>
            <p className="text-xs text-slate-500">ID: {data.empId}</p>
          </div>
        </div>
      </Td>

      <Td>{data.date}</Td>

      <Td>
        <div className="flex items-center gap-2">
          <span>{data.type}</span>
          {data.ai && (
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              AI
            </span>
          )}
        </div>
      </Td>

      <Td className="italic text-slate-500">{data.detectedBy}</Td>
      <Td className="max-w-xs truncate text-slate-500">{data.reason}</Td>

      <Td>
        <StatusBadge status={data.status} />
      </Td>

      <Td right>
        {data.status === "Pending" ? (
          <button
          onClick={() => onReview(data)}
          className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg">
            Review
          </button>
        ) : (
          <button className="text-slate-500 hover:text-primary">
            <span className="material-symbols-outlined">visibility</span>
          </button>
        )}
      </Td>
    </tr>
  );
}

/* ================= UI HELPERS ================= */

function StatusBadge({ status }) {
  const map = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-rose-100 text-rose-700",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status]}`}>
      {status}
    </span>
  );
}

function Th({ children, right }) {
  return (
    <th className={`px-6 py-4 ${right ? "text-right" : ""}`}>
      {children}
    </th>
  );
}

function Td({ children, right }) {
  return (
    <td className={`px-6 py-4 text-sm ${right ? "text-right" : ""}`}>
      {children}
    </td>
  );
}
