import { useNavigate } from "react-router-dom";

export default function WorkflowStatisticScreen() {
  const navigate = useNavigate();

  return (
      <div className="space-y-8">
  
        {/* ================= BREADCRUMB + TITLE ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <nav className="flex text-xs text-slate-500 mb-1">
              <span>HR Module</span>
              <span className="mx-2">/</span>
              <span className="font-semibold text-slate-900">
                Workflow Dashboard
              </span>
            </nav>
            <h1 className="text-2xl font-bold">Workflow Dashboard</h1>
          </div>
  
          {/* FILTER */}
          <div className="bg-white p-2 rounded-xl border flex items-center gap-4 shadow-sm">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button className="px-4 py-1.5 text-sm font-medium bg-white text-primary rounded-md shadow">
                Today
              </button>
              <button className="px-4 py-1.5 text-sm text-slate-500">
                This week
              </button>
              <button className="px-4 py-1.5 text-sm text-slate-500">
                This month
              </button>
            </div>
  
            <div className="h-6 w-px bg-slate-200" />
  
            <select className="text-sm font-medium bg-transparent border-none focus:ring-0">
              <option>All Types</option>
              <option>Leave Request</option>
              <option>OT Approval</option>
              <option>Transfer</option>
            </select>
          </div>
        </div>
  
        {/* ================= SUMMARY CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Requests" value="1,482" />
          <StatCard label="Pending Approval" value="28" badge="Pending" amber />
          <StatCard label="Approved" value="1,240" badge="Approved" green />
          <StatCard label="Rejected" value="214" badge="Rejected" red />
        </div>
  
        {/* ================= CHARTS ================= */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-2 flex">
          <RequestsByType />
          <RequestsByStatus />
        </div>
  
        {/* ================= RECENT REQUESTS ================= */}
        <RecentRequests navigate = {navigate} />
        <QuickAction navigate = {navigate}/>
      </div>
    );
  }
  
  /* ================= COMPONENTS ================= */
  
  function StatCard({ label, value, badge, amber, green, red }) {
    const badgeStyle =
      amber ? "bg-amber-100 text-amber-600"
      : green ? "bg-emerald-100 text-emerald-600"
      : red ? "bg-rose-100 text-rose-600"
      : "";
  
    return (
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-slate-500">{label}</p>
          {badge && (
            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${badgeStyle}`}>
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
    );
  }
  
  /* ================= REQUESTS BY TYPE ================= */
  
  function RequestsByType() {
    return (
      <div className="bg-white p-6  xl:col-span-7 border shadow-sm">
        <h4 className="font-bold mb-6">Requests by Type</h4>
  
        <div className="flex gap-12 items-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle r="40" cx="50" cy="50" fill="transparent" stroke="#3B82F6" strokeWidth="12" strokeDasharray="100 151" />
              <circle r="40" cx="50" cy="50" fill="transparent" stroke="#818CF8" strokeWidth="12" strokeDasharray="62 189" strokeDashoffset="-100" />
              <circle r="40" cx="50" cy="50" fill="transparent" stroke="#FBBF24" strokeWidth="12" strokeDasharray="50 201" strokeDashoffset="-162" />
              <circle r="40" cx="50" cy="50" fill="transparent" stroke="#F87171" strokeWidth="12" strokeDasharray="39 212" strokeDashoffset="-212" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-bold">
              100%
            </div>
          </div>
  
          <div className="space-y-3 text-sm text-slate-500">
            <Legend color="bg-blue-500" label="Leave (40%)" />
            <Legend color="bg-indigo-400" label="OT (25%)" />
            <Legend color="bg-amber-400" label="Transfer (20%)" />
            <Legend color="bg-rose-400" label="Resignation (15%)" />
          </div>
        </div>
      </div>
    );
  }
  
  function Legend({ color, label }) {
    return (
      <div className="flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${color}`} />
        {label}
      </div>
    );
  }
  
  /* ================= REQUESTS BY STATUS ================= */
  
  function RequestsByStatus() {
    return (
      <div className="bg-white p-6  xl:col-span-5 border shadow-sm">
        <h4 className="font-bold mb-6">Requests by Status</h4>
  
        <div className="flex items-end justify-between h-40">
          <Bar label="Pending" percent={40} color="bg-amber-400" />
          <Bar label="Approved" percent={80} color="bg-emerald-500" />
          <Bar label="Rejected" percent={15} color="bg-rose-500" />
          <Bar label="In Review" percent={55} color="bg-blue-500" />
        </div>
      </div>
    );
  }
  
  function Bar({ label, percent, color }) {
    return (
      <div className="flex flex-col gap-2">
        <div className="w-10 h-32 bg-slate-100 rounded-t-lg relative w-20">
          <div
            className={`absolute bottom-0 w-full rounded-t-lg ${color}`}
            style={{ height: `${percent}%` }}
          />
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-400">
          {label}
        </span>
      </div>
    );
  }
  
  /* ================= RECENT REQUESTS ================= */
  
  function RecentRequests({navigate}) {
    return (
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h4 className="font-bold">Recent Requests</h4>
          <button
          onClick = {() => navigate(`/hr/requests`)} 
          className="text-primary text-sm font-semibold hover:underline">
            View all
          </button>
        </div>
  
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <RecentRow name="Nguyễn Minh Tâm" dept="Engineering" type="Leave Request" date="Oct 23, 2023 - 09:15 AM" status="Pending" />
            <RecentRow name="Trần Thanh Hà" dept="Marketing" type="OT Approval" date="Oct 23, 2023 - 11:40 AM" status="Approved" />
            <RecentRow name="Lê Quốc Bảo" dept="Sales" type="Transfer Request" date="Oct 22, 2023 - 04:30 PM" status="Rejected" />
          </tbody>
        </table>
      </div>
    );
  }
  
  function RecentRow({ name, dept, type, date, status }) {
    const map = {
      Pending: "bg-amber-100 text-amber-600",
      Approved: "bg-emerald-100 text-emerald-600",
      Rejected: "bg-rose-100 text-rose-600",
    };
  
    return (
      <tr className="hover:bg-slate-50">
        <td className="px-6 py-4">
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-slate-500">{dept} Dept.</p>
        </td>
        <td className="px-6 py-4 text-sm">{type}</td>
        <td className="px-6 py-4 text-sm text-slate-500">{date}</td>
        <td className="px-6 py-4">
          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${map[status]}`}>
            {status}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <button className="px-4 py-1.5 text-xs font-bold bg-blue-50 text-primary rounded-lg hover:bg-primary hover:text-white">
            View
          </button>
        </td>
      </tr>
    );
  }
  
  function QuickAction ({navigate}){
    return (
      <div className="bg-white rounded-2xl border shadow-sm">
          <div className="p-6">
            <button
            onClick= {() => navigate(`/hr/workflow-configuration`)} 
            className="p-3 rounded-md border shadow-md text-primary text-sm font-semibold hover:bg-blue-50">
                Workflow Configuration
            </button>
            <button
            onClick= {() => navigate(`/hr/requests`)} 
            className="p-3 rounded-md border shadow-md text-primary text-sm font-semibold hover:bg-blue-50">
                Requests
            </button>
          </div>
      </div>
    );
  }