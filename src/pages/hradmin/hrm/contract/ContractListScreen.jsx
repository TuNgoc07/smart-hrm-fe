import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContractRenewalModal from "./ContractRenewalModal";
import EmployeeContractDetailModal from "./EmployeeContractDetailModal";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function ContractListScreen() {
  const navigate = useNavigate();
  const [selectedContract, setSelectedContract] = useState(null);
  const [viewContract, setViewContract] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState({ activeContracts: 0, expiringSoon: 0, expiredContracts: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchContracts();
    fetchStats();
  }, [currentPage, search, typeFilter, statusFilter]);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage);
      if (search) params.append('search', search);
      if (typeFilter !== 'all') params.append('contractType', typeFilter);
      if (statusFilter !== 'all') params.append('contractStatus', statusFilter);

      const res = await fetch(`${API}/api/hradmin/contracts?${params.toString()}`, { headers: authHeader() });
      const json = await res.json();

      if (json.status === "success") {
        setContracts(json.data?.data || []);
        setTotalPages(json.data?.totalPages || 1);
      }
    } catch (e) {
      console.error("Failed to load contracts", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/hradmin/contracts/stats`, { headers: authHeader() });
      const json = await res.json();
      if (json.status === "success") setStats(json.data || {});
    } catch (e) {
      console.error("Failed to load stats", e);
    }
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const diff = (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  };

  const resolveStatus = (c) => {
    if (c.contractStatus === "expired" || c.contractStatus === "terminated") return c.contractStatus;
    if (isExpiringSoon(c.endDate)) return "expiring";
    return c.contractStatus || "active";
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6">

      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#4c739a]">
          <span>HR Core</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-[#0d141b] font-medium">Contract Management</span>
        </div>
        <button
          onClick={() => navigate("/hr/contract-templates")}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold text-[#4c739a] hover:bg-slate-50 hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm">description</span>
          Contract Templates
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Contracts" value={stats.activeContracts ?? 0}
          sub="Currently active" color="emerald" icon="check_circle" />
        <StatCard title="Expiring Soon" value={stats.expiringSoon ?? 0}
          sub="Expires within 30 days" color="amber" icon="warning" />
        <StatCard title="Expired / Terminated" value={(stats.expiredContracts ?? 0) + (stats.terminatedContracts ?? 0)}
          sub="Action required" color="red" icon="cancel" />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl p-4 shadow-sm border flex flex-wrap items-end gap-4">
        <FilterInput label="Search Employee" placeholder="Name or Employee ID"
          icon="person_search" value={search} onChange={setSearch} />
        <FilterSelect label="Contract Type"
          options={[["all", "All Types"], ["probation", "Probation"], ["permanent", "Permanent"], ["fixed_term", "Fixed-term"], ["internship", "Internship"], ["part_time", "Part-time"]]}
          value={typeFilter} onChange={setTypeFilter} />
        <FilterSelect label="Status"
          options={[["all", "All Status"], ["active", "Active"], ["expiring", "Expiring Soon"], ["expired", "Expired"], ["terminated", "Terminated"]]}
          value={statusFilter} onChange={setStatusFilter} />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading contracts…</div>
        ) : (
          <>
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
                {contracts.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No contracts found</td></tr>
                ) : contracts.map((c) => {
                  const status = resolveStatus(c);
                  return (
                    <ContractRow
                      key={c.contractId}
                      highlight={status === "expiring"}
                      data={{
                        contractId: c.contractId,
                        name: c.employeeInfo?.employeeName || "—",
                        empId: c.employeeInfo?.employeeId || "—",
                        department: c.department || "—",
                        type: c.templateName || c.contractType || "—",
                        start: c.startDate || "—",
                        end: c.endDate || "Indefinite",
                        status,
                        contractID: c.contractID || c.contractCode || "—",
                        expiry: c.endDate,
                        avatar: c.avatar || c.employeeInfo?.avatar || "—",
                      }}
                      onExtend={setSelectedContract}
                      onView={() => setViewContract(c)}
                    />
                  );
                })}
              </tbody>
            </table>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page {currentPage + 1} of {totalPages}
                </p>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                    className="px-3 py-1 text-sm bg-white border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 text-sm bg-white border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${currentPage === pageNum
                          ? "bg-primary text-white border-primary"
                          : "bg-white hover:bg-slate-50"
                        }`}
                    >
                      {pageNum + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 text-sm bg-white border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages - 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 text-sm bg-white border rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {selectedContract && (
        <ContractRenewalModal
          data={selectedContract}
          onClose={() => { setSelectedContract(null); fetchContracts(); fetchStats(); }}
        />
      )}

      {viewContract && (
        <EmployeeContractDetailModal
          contract={viewContract}
          onClose={() => setViewContract(null)}
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

function FilterInput({ label, placeholder, icon, value, onChange }) {
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

function FilterSelect({ label, options, value, onChange }) {
  return (
    <div className="w-48">
      <label className="block text-[10px] uppercase font-bold text-[#4c739a] mb-1">
        {label}
      </label>
      <select className="w-full py-2 bg-slate-100 rounded-lg text-sm"
        value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([val, label]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
    </div>
  );
}

function ContractRow({ data, highlight, onExtend, onView }) {
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
            <p className="text-xs text-slate-500">#EMP-{data.empId}</p>
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
          <IconBtn icon="visibility" onClick={onView} />
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
    terminated: { bg: "bg-slate-100", dot: "bg-slate-500", text: "text-slate-700", label: "Terminated" },
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
      className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4c739a] ${align === "right" ? "text-right" : ""
        }`}
    >
      {children}
    </th>
  );
}


