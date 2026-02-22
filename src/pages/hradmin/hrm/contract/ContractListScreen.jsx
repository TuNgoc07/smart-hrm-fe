import { useState } from "react";
import ContractRenewalModal from "./ContractRenewalModal";

export default function ContractListScreen() {
  const [selectedContract, setSelectedContract] = useState(null);

  return (
    <div className="space-y-6">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-sm text-[#4c739a]">
        <span>HR Core</span>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-[#0d141b] font-medium">
          Contract Management
        </span>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Contracts"
          value="1,284"
          sub="+2.4% vs last month"
          color="emerald"
          icon="check_circle"
        />
        <StatCard
          title="Expiring Soon"
          value="42"
          sub="Expires within 30 days"
          color="amber"
          icon="warning"
        />
        <StatCard
          title="Expired Contracts"
          value="15"
          sub="-1% Action required"
          color="red"
          icon="cancel"
        />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap items-end gap-4">
        <FilterInput
          label="Search Employee"
          placeholder="Name or Employee ID"
          icon="person_search"
        />
        <FilterSelect
          label="Contract Type"
          options={["All Types", "Probation", "Official", "Fixed-term"]}
        />
        <FilterSelect
          label="Status"
          options={["All Status", "Active", "Expiring Soon", "Expired"]}
        />
        <button className="h-[38px] px-4 flex items-center gap-2 border rounded-lg text-sm font-bold hover:bg-slate-50">
          <span className="material-symbols-outlined text-lg">
            filter_list
          </span>
          More Filters
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <Th>Employee</Th>
              <Th>Department</Th>
              <Th>Type</Th>
              <Th>Duration</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>

          <tbody className="divide-y">
            <ContractRow
              data={{
                name: "John Doe",
                empId: "EMP-8821",
                department: "Engineering",
                type: "Official",
                start: "Jan 12, 2023",
                end: "Indefinite",
                status: "active",
                contractID: "AGR-0912",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
              }}
              onExtend={setSelectedContract}
            />

            <ContractRow
              highlight
              data={{
                name: "Sarah Chen",
                empId: "EMP-9045",
                department: "Product Design",
                type: "Fixed-term",
                start: "Nov 15, 2023",
                end: "Oct 15, 2024",
                status: "expiring",
                contractID: "AGR-0912",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
              }}
              onExtend={setSelectedContract}
            />

            <ContractRow
              data={{
                name: "Marcus Kane",
                empId: "EMP-7712",
                department: "Sales",
                type: "Probation",
                start: "Jun 01, 2024",
                end: "Aug 31, 2024",
                status: "expired",
                contractID: "AGR-0912",
                avatar: "https://randomuser.me/api/portraits/men/54.jpg",
              }}
              onExtend={setSelectedContract}
            />
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedContract && (
        <ContractRenewalModal
          data={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function StatCard({ title, value, sub, icon, color }) {
  const map = {
    emerald: "border-emerald-500 text-emerald-600",
    amber: "border-amber-500 text-amber-600",
    red: "border-red-500 text-red-600",
  };

  return (
    <div className={`bg-white rounded-xl p-6 border-l-4 ${map[color]} shadow-sm`}>
      <div className="flex justify-between items-start">
        <p className="text-sm text-[#4c739a]">{title}</p>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

function FilterInput({ label, placeholder, icon }) {
  return (
    <div className="flex-1 min-w-[200px]">
      <label className="block text-[10px] uppercase font-bold text-[#4c739a] mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">
          {icon}
        </span>
        <input
          className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function FilterSelect({ label, options }) {
  return (
    <div className="w-48">
      <label className="block text-[10px] uppercase font-bold text-[#4c739a] mb-1">
        {label}
      </label>
      <select className="w-full py-2 bg-slate-100 rounded-lg text-sm">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function ContractRow({ data, highlight, onExtend }) {
  return (
    <tr className={`${highlight ? "bg-amber-50/50" : ""} hover:bg-slate-50`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={data.avatar}
            className="w-10 h-10 rounded-full border-2 border-white"
          />
          <div>
            <p className="text-sm font-bold">{data.name}</p>
            <p className="text-xs text-slate-500">{data.empId}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 text-sm">{data.department}</td>
      <td className="px-6 py-4 text-sm">{data.type}</td>

      <td className="px-6 py-4 text-xs">
        <p>{data.start}</p>
        <p className="text-slate-400">{data.end}</p>
      </td>

      <td className="px-6 py-4">
        <StatusBadge status={data.status} />
      </td>

      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2 text-[#4c739a]">
          <IconBtn icon="visibility" />
          <IconBtn icon="history" onClick={() => onExtend(data)} />
          <IconBtn icon="person_remove" danger />
        </div>
      </td>
    </tr>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: { bg: "bg-emerald-100", dot: "bg-emerald-500", text: "text-emerald-700", label: "Active" },
    expiring: { bg: "bg-amber-100", dot: "bg-amber-500", text: "text-amber-700", label: "Expiring Soon" },
    expired: { bg: "bg-red-100", dot: "bg-red-500", text: "text-red-700", label: "Expired" },
  };

  const s = map[status];

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function IconBtn({ icon, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-1 ${danger ? "hover:text-red-500" : "hover:text-primary"}`}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </button>
  );
}

function Th({ children, align }) {
  return (
    <th
      className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c739a] ${
        align === "right" ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}


