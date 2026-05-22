import { useState, useEffect, useCallback } from "react";
import NewPositionModal from "./NewPositionModal";

const PAGE_SIZE = 10;
const JOB_LEVELS = ["L1", "L2", "L3", "L4", "L5", "L6", "M1", "M2", "D1"];

export default function PositionListScreen() {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("token");

  const [openModal, setOpenModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [positions, setPositions] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [departments, setDepartments] = useState([]);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const fetchDepts = async () => {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/departments/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") setDepartments(data.data || []);
    };
    fetchDepts().catch(() => {});
  }, []);

  const fetchPositions = useCallback(async () => {
    if (!token) return;
    const params = new URLSearchParams({ page });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (departmentFilter) params.set("departmentId", departmentFilter);
    if (levelFilter) params.set("jobLevel", levelFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`${API_BASE_URL}/api/hradmin/positions?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.status === "success") {
      setPositions(data.data.content);
      setTotalElements(data.data.totalElements);
    }
  }, [page, debouncedSearch, departmentFilter, levelFilter, statusFilter]);

  useEffect(() => { fetchPositions(); }, [fetchPositions]);

  const handleToggleStatus = async (positionId) => {
    if (togglingId) return;
    setTogglingId(positionId);
    try {
      await fetch(`${API_BASE_URL}/api/hradmin/positions/${positionId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await fetchPositions();
    } catch {
      setError("Failed to toggle status");
      setTimeout(() => setError(null), 4000);
    } finally {
      setTogglingId(null);
    }
  };

  const totalPages = Math.ceil(totalElements / PAGE_SIZE);
  const showFrom = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const showTo = Math.min((page + 1) * PAGE_SIZE, totalElements);

  const totalHeadcount = positions.reduce((s, p) => s + (p.headcount || 0), 0);
  const totalFilled = positions.reduce((s, p) => s + (p.totalEmployee || 0), 0);
  const totalVacancy = positions.reduce((s, p) => s + (p.vacancy || 0), 0);

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[#0d141b]">Position Management</h2>
          <p className="text-[#4c739a] mt-1">Maintain and oversee organizational roles and headcount planning.</p>
        </div>
        <button
          onClick={() => { setEditingPosition(null); setOpenModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Add Position
        </button>
      </div>

      {(openModal || editingPosition) && (
        <NewPositionModal
          position={editingPosition}
          onClose={() => { setOpenModal(false); setEditingPosition(null); }}
          onSaved={() => { setOpenModal(false); setEditingPosition(null); fetchPositions(); }}
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Positions" value={totalElements} note="in current filter" />
        <StatCard title="Headcount" value={totalHeadcount} note="planned seats" />
        <StatCard title="Filled" value={totalFilled} note="current employees" highlight />
        <StatCard title="Vacancy" value={totalVacancy} note="open seats" primary />
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">manage_search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
            placeholder="Search by position name or code..."
          />
        </div>
        <select
          value={departmentFilter}
          onChange={(e) => { setDepartmentFilter(e.target.value); setPage(0); }}
          className="bg-slate-50 border rounded-lg text-sm py-2.5 px-3 min-w-[160px]"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
          ))}
        </select>
        <select
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPage(0); }}
          className="bg-slate-50 border rounded-lg text-sm py-2.5 px-3 min-w-[130px]"
        >
          <option value="">All Levels</option>
          {JOB_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <StatusFilterButton statusFilter={statusFilter} onToggle={(v) => { setStatusFilter(v); setPage(0); }} />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <Th>Position Name</Th>
                <Th>Code</Th>
                <Th>Job</Th>
                <Th>Department</Th>
                <Th center>Level</Th>
                <Th center>Filled / HC</Th>
                <Th center>Vacancy</Th>
                <Th>Status</Th>
                <Th right>Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">work_outline</span>
                    No positions found.
                  </td>
                </tr>
              ) : (
                positions.map((pos, i) => (
                  <PositionRow
                    key={pos?.positionId || i}
                    position={pos}
                    onEdit={() => setEditingPosition(pos)}
                    onToggleStatus={() => handleToggleStatus(pos.positionId)}
                    isToggling={togglingId === pos.positionId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <p className="text-sm text-[#4c739a]">
            Showing <b className="text-black">{showFrom} – {showTo}</b> of <b className="text-black">{totalElements}</b> positions
          </p>
          <div className="flex items-center gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="size-8 border rounded-lg disabled:opacity-40 hover:bg-slate-50">‹</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)} className={`size-8 rounded-lg ${page === i ? "bg-primary text-white font-bold" : "border hover:bg-slate-50"}`}>
                {i + 1}
              </button>
            ))}
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} className="size-8 border rounded-lg disabled:opacity-40 hover:bg-slate-50">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

function Th({ children, center, right }) {
  return (
    <th className={`px-6 py-4 text-xs font-bold uppercase text-[#4c739a] ${center ? "text-center" : ""} ${right ? "text-right" : ""}`}>
      {children}
    </th>
  );
}

function StatusFilterButton({ statusFilter, onToggle }) {
  const options = ["all", "active", "inactive"];
  const labels = { all: "All Status", active: "Active", inactive: "Inactive" };
  const next = options[(options.indexOf(statusFilter) + 1) % options.length];
  return (
    <button
      onClick={() => onToggle(next)}
      className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2.5 border hover:bg-slate-100 text-sm font-semibold text-slate-700"
    >
      {labels[statusFilter]}
      <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
    </button>
  );
}

function PositionRow({ position, onEdit, onToggleStatus, isToggling }) {
  const active = position?.status === "active";
  const vacancy = position?.vacancy ?? 0;

  return (
    <tr className={`group hover:bg-slate-50 transition-colors ${!active ? "opacity-70" : ""}`}>
      <td className={`px-6 py-4 font-bold text-sm ${!active ? "text-slate-400" : ""}`}>
        {position?.positionName || "—"}
      </td>
      <td className="px-6 py-4 text-sm text-[#4c739a] font-mono">{position?.positionCode || "—"}</td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
          {position?.jobName || "—"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-bold">
          {position?.departmentName || "—"}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        {position?.level ? (
          <span className={`px-3 py-1 rounded-full text-xs font-black ${active ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-500"}`}>
            {position.level}
          </span>
        ) : "—"}
      </td>
      <td className="px-6 py-4 text-center text-sm font-medium">
        <span className="text-slate-700">{position?.totalEmployee ?? 0}</span>
        <span className="text-slate-400 mx-1">/</span>
        <span className="font-bold">{position?.headcount ?? "—"}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${vacancy > 0 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
          {vacancy > 0 ? `+${vacancy} open` : "Full"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`flex items-center gap-1.5 text-xs font-bold ${active ? "text-emerald-600" : "text-slate-400"}`}>
          <span className={`size-1.5 rounded-full ${active ? "bg-emerald-600" : "bg-slate-400"}`} />
          {active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg" title="Edit">
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            onClick={onToggleStatus}
            disabled={isToggling}
            className={`p-1.5 rounded-lg ${active ? "hover:bg-red-50 hover:text-red-500" : "hover:bg-green-50 hover:text-green-600"} ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
            title={active ? "Deactivate" : "Activate"}
          >
            {isToggling
              ? <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
              : <span className="material-symbols-outlined text-lg">{active ? "block" : "check_circle"}</span>
            }
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatCard({ title, value, note, highlight, primary }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-[#4c739a]">{title}</p>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-2xl font-black">{value}</span>
        <span className={`text-xs font-bold mb-1 ${primary ? "text-primary" : highlight ? "text-emerald-500" : "text-[#4c739a]"}`}>
          {note}
        </span>
      </div>
    </div>
  );
}
