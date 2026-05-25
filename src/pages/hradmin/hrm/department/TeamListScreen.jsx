import NewTeamModal from "./NewTeamModal";
import { useState, useEffect, useCallback } from "react";

const PAGE_SIZE = 5;

export default function TeamListScreen() {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("token");

  const [openModal, setOpenModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch departments for filter
  const fetchDepartments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/departments/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === "success") {
        setDepartments(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  }, [token]);

  const fetchTeams = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    const params = new URLSearchParams({ page });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (departmentFilter) params.set("departmentId", departmentFilter);
    const res = await fetch(`${API_BASE_URL}/api/hradmin/teams?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.status === "success") {
      setTeams(data.data.content);
      setTotalElements(data.data.totalElements);
    }
    setIsLoading(false);
  }, [page, debouncedSearch, statusFilter, departmentFilter, token]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleToggleStatus = async (teamId) => {
    if (togglingId) return;
    setTogglingId(teamId);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/teams/${teamId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to toggle status");
      }

      await fetchTeams();
    } catch (err) {
      console.error("Toggle status error:", err);
      const isCorsError = err.message.includes("Failed to fetch") || err.message.includes("CORS");
      setError(isCorsError ? "Backend endpoint not configured. Please check CORS settings." : err.message || "Failed to toggle team status");
      setTimeout(() => setError(null), 5000);
    } finally {
      setTogglingId(null);
    }
  };

  const totalPages = Math.ceil(totalElements / PAGE_SIZE);
  const showFrom = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const showTo = Math.min((page + 1) * PAGE_SIZE, totalElements);

  function suggestTeamIcon(name) {
    const value = name?.trim().toLowerCase() || "";
    if (!value) return { icon: "groups", color: "slate" };
    if (value.includes("backend") || value.includes("back-end") || value.includes("server"))
      return { icon: "dns", color: "blue" };
    if (value.includes("frontend") || value.includes("front-end") || value.includes("ui") || value.includes("ux"))
      return { icon: "web", color: "purple" };
    if (value.includes("qa") || value.includes("quality") || value.includes("test"))
      return { icon: "bug_report", color: "orange" };
    if (value.includes("devops") || value.includes("infrastructure") || value.includes("ops"))
      return { icon: "settings", color: "slate" };
    if (value.includes("data") || value.includes("analytics") || value.includes("bi"))
      return { icon: "analytics", color: "green" };
    if (value.includes("mobile") || value.includes("ios") || value.includes("android"))
      return { icon: "smartphone", color: "blue" };
    if (value.includes("security") || value.includes("sec"))
      return { icon: "security", color: "red" };
    return { icon: "groups", color: "slate" };
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Team Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, manage and monitor organizational teams within departments.
          </p>
        </div>
        <button
          onClick={() => { setEditingTeam(null); setOpenModal(true); }}
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm inline-flex items-center gap-2 shadow-sm hover:bg-primary/90"
        >
          <span className="material-symbols-outlined">add</span>
          Add Team
        </button>
      </div>

      {(openModal || editingTeam) && (
        <NewTeamModal
          team={editingTeam}
          departments={departments}
          onClose={() => { setOpenModal(false); setEditingTeam(null); }}
          onSaved={() => { setOpenModal(false); setEditingTeam(null); fetchTeams(); }}
        />
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">error</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
            placeholder="Search by team name or code..."
          />
        </div>
        <div className="flex items-center gap-3">
          <DepartmentFilterButton
            departments={departments}
            departmentFilter={departmentFilter}
            onFilter={setDepartmentFilter}
          />
          <StatusFilterButton statusFilter={statusFilter} onToggle={setStatusFilter} />
          <div className="w-px h-8 bg-slate-200 hidden sm:block" />
          <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg">
            <span className="material-symbols-outlined">download</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <Th>Team Name</Th>
                <Th>Code</Th>
                <Th>Department</Th>
                <Th>Team Lead</Th>
                <Th>Total Members</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block animate-spin">refresh</span>
                    Loading teams...
                  </td>
                </tr>
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                    No teams found.
                  </td>
                </tr>
              ) : (
                teams.map((team, index) => {
                  const suggestion = suggestTeamIcon(team?.teamName);
                  return (
                    <TeamRow
                      key={team?.teamId || index}
                      team={team}
                      icon={suggestion.icon}
                      color={suggestion.color}
                      onEdit={() => setEditingTeam(team)}
                      onToggleStatus={() => handleToggleStatus(team.teamId)}
                      togglingId={togglingId}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          page={page}
          totalPages={totalPages}
          showFrom={showFrom}
          showTo={showTo}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function Th({ children, align }) {
  return (
    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${align === "right" ? "text-right" : ""}`}>
      {children}
    </th>
  );
}

function DepartmentFilterButton({ departments, departmentFilter, onFilter }) {
  const selectedDept = departments.find(d => d.deptId == departmentFilter);
  return (
    <select
      value={departmentFilter}
      onChange={(e) => onFilter(e.target.value)}
      className="flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-4 border hover:bg-slate-100 text-sm font-semibold text-slate-700"
    >
      <option value="">Department: All</option>
      {departments.map(dept => (
        <option key={dept.deptId} value={dept.deptId}>{dept.deptName}</option>
      ))}
    </select>
  );
}

function StatusFilterButton({ statusFilter, onToggle }) {
  const options = ["all", "active", "inactive"];
  const labels = { all: "Status: All", active: "Status: Active", inactive: "Status: Inactive" };
  const next = options[(options.indexOf(statusFilter) + 1) % options.length];
  return (
    <button
      onClick={() => onToggle(next)}
      className="flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-4 border hover:bg-slate-100"
    >
      <span className="text-sm font-semibold text-slate-700">{labels[statusFilter]}</span>
      <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
    </button>
  );
}

function TeamRow({ team, icon, color, onEdit, onToggleStatus, togglingId }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    slate: "bg-slate-100 text-slate-500",
  };
  const isActive = team?.status === "active";
  const isToggling = togglingId === team?.teamId;

  return (
    <tr className={`hover:bg-slate-50 transition-colors ${!isActive ? "opacity-70" : ""}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorMap[color] || "bg-slate-100"}`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <span className="text-sm font-bold">{team?.teamName || "—"}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{team?.teamCode || "—"}</td>
      <td className="px-6 py-4 text-sm font-medium text-slate-700">{team?.departmentName || "—"}</td>
      <td className="px-6 py-4 text-sm font-medium text-slate-700">{team?.managerName || "—"}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{team?.totalMembers ?? 0}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 border"}`}>
          <span className={`size-1.5 rounded-full ${isActive ? "bg-green-600" : "bg-slate-400"}`} />
          {team?.status || "—"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button onClick={onEdit} className="p-2 text-slate-400 hover:text-primary" title="Edit">
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          <button
            onClick={onToggleStatus}
            disabled={isToggling}
            className={`p-2 ${isActive ? "text-slate-400 hover:text-red-500" : "text-slate-400 hover:text-green-600"} ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isActive ? "Deactivate" : "Activate"}
          >
            {isToggling ? (
              <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-xl">{isActive ? "block" : "check_circle"}</span>
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

function Pagination({ page, totalPages, showFrom, showTo, totalElements, onPageChange }) {
  if (totalPages === 0) return null;
  return (
    <div className="px-6 py-4 border-t flex items-center justify-between">
      <span className="text-xs text-slate-500">
        Showing {showFrom} to {showTo} of {totalElements} teams
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="w-9 h-9 border rounded-lg disabled:opacity-40 hover:bg-slate-50"
        >
          ‹
        </button>
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => onPageChange(index)}
            className={`w-9 h-9 rounded-lg ${page === index ? "bg-primary text-white" : "border hover:bg-slate-50"}`}
          >
            {index + 1}
          </button>
        ))}
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="w-9 h-9 border rounded-lg disabled:opacity-40 hover:bg-slate-50"
        >
          ›
        </button>
      </div>
    </div>
  );
}
