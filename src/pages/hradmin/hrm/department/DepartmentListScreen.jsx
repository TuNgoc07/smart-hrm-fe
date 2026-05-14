import NewDepartmentModal from "./NewDepartmentModal";
import { useState, useEffect, useCallback } from "react";

const PAGE_SIZE = 5;

export default function DepartmentListScreen() {
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const token = localStorage.getItem("token");

  const [openModal, setOpenModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
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

  const fetchDepartments = useCallback(async () => {
    if (!token) return;
    const params = new URLSearchParams({ page });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter !== "all") params.set("status", statusFilter);
    const res = await fetch(`${API_BASE_URL}/api/hradmin/departments?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.status === "success") {
      setDepartments(data.data.content);
      setTotalElements(data.data.totalElements);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleToggleStatus = async (deptId) => {
    if (togglingId) return;
    setTogglingId(deptId);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/departments/${deptId}/status`, {
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

      await fetchDepartments();
    } catch (err) {
      console.error("Toggle status error:", err);
      const isCorsError = err.message.includes("Failed to fetch") || err.message.includes("CORS");
      setError(isCorsError ? "Backend endpoint not configured. Please check CORS settings." : err.message || "Failed to toggle department status");
      setTimeout(() => setError(null), 5000);
    } finally {
      setTogglingId(null);
    }
  };

  const totalPages = Math.ceil(totalElements / PAGE_SIZE);
  const showFrom = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const showTo = Math.min((page + 1) * PAGE_SIZE, totalElements);

  function suggestDepartmentIcon(name) {
    const value = name?.trim().toLowerCase() || "";
    if (!value) return { icon: "apartment", color: "slate" };
    if (value.includes("engineering") || value.includes("engineer") || value.includes("developer") || value.includes("it") || value.includes("tech"))
      return { icon: "developer_board", color: "blue" };
    if (value.includes("marketing") || value.includes("growth") || value.includes("brand") || value.includes("communication"))
      return { icon: "campaign", color: "purple" };
    if (value.includes("customer success") || value.includes("customer service") || value.includes("support") || value.includes("care"))
      return { icon: "support_agent", color: "orange" };
    if (value.includes("finance") || value.includes("financial") || value.includes("accounting") || value.includes("account"))
      return { icon: "calculate", color: "slate" };
    if (value.includes("human resource") || value.includes("hr") || value.includes("people") || value.includes("talent"))
      return { icon: "groups", color: "blue" };
    if (value.includes("legal") || value.includes("compliance"))
      return { icon: "gavel", color: "slate" };
    if (value.includes("operation") || value.includes("admin"))
      return { icon: "business_center", color: "slate" };
    return { icon: "apartment", color: "slate" };
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Department Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create, manage and monitor organizational departments.
          </p>
        </div>
        <button
          onClick={() => { setEditingDept(null); setOpenModal(true); }}
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm inline-flex items-center gap-2 shadow-sm hover:bg-primary/90"
        >
          <span className="material-symbols-outlined">add</span>
          Add Department
        </button>
      </div>

      {(openModal || editingDept) && (
        <NewDepartmentModal
          department={editingDept}
          onClose={() => { setOpenModal(false); setEditingDept(null); }}
          onSaved={() => { setOpenModal(false); setEditingDept(null); fetchDepartments(); }}
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
            placeholder="Search by department name or code..."
          />
        </div>
        <div className="flex items-center gap-3">
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
                <Th>Department Name</Th>
                <Th>Code</Th>
                <Th>Manager</Th>
                <Th>Total Members</Th>
                <Th>Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                    No departments found.
                  </td>
                </tr>
              ) : (
                departments.map((dept, index) => {
                  const suggestion = suggestDepartmentIcon(dept?.deptName);
                  return (
                    <DepartmentRow
                      key={dept?.deptId || index}
                      dept={dept}
                      icon={suggestion.icon}
                      color={suggestion.color}
                      onEdit={() => setEditingDept(dept)}
                      onToggleStatus={() => handleToggleStatus(dept.deptId)}
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

function DepartmentRow({ dept, icon, color, onEdit, onToggleStatus, togglingId }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    slate: "bg-slate-100 text-slate-500",
  };
  const isActive = dept?.status === "active";
  const isToggling = togglingId === dept?.deptId;

  return (
    <tr className={`hover:bg-slate-50 transition-colors ${!isActive ? "opacity-70" : ""}`}>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorMap[color] || "bg-slate-100"}`}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <span className="text-sm font-bold">{dept?.deptName || "—"}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 font-mono">{dept?.deptCode || "—"}</td>
      <td className="px-6 py-4 text-sm font-medium text-slate-700">{dept?.managerName || "—"}</td>
      <td className="px-6 py-4 text-sm text-slate-600">{dept?.totalMembers ?? 0}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 border"}`}>
          <span className={`size-1.5 rounded-full ${isActive ? "bg-green-600" : "bg-slate-400"}`} />
          {dept?.status || "—"}
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
        Showing {showFrom} to {showTo} of {totalElements} departments
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