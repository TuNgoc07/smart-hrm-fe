import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NewEmployee from "./NewEmployee";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// ─── HEADER ──────────────────────────────────────────────────────────────────
function Header({ activeCount, onAddEmployee }) {
  return (
    <div className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-extrabold">Employee Management</h1>
        <p className="text-slate-500">
          {activeCount !== null
            ? `${Number(activeCount).toLocaleString()} Total Active Employees`
            : "Loading..."}
        </p>
      </div>
      <div className="flex gap-3">
        <button className="px-4 h-10 border rounded-lg font-bold text-sm">Import</button>
        <button className="px-4 h-10 border rounded-lg font-bold text-sm">Export</button>
        <button
          onClick={onAddEmployee}
          className="px-6 h-11 bg-primary text-white rounded-lg font-bold"
        >
          Add Employee
        </button>
      </div>
    </div>
  );
}

// ─── FILTER DROPDOWN ─────────────────────────────────────────────────────────
function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const displayLabel = options.find((o) => o.id === value)?.name || "All";
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-semibold"
      >
        <span className="text-xs font-bold text-slate-500 uppercase">{label}:</span>
        <span className="max-w-[100px] truncate">{displayLabel}</span>
        <span className="material-symbols-outlined text-slate-400 text-base leading-none">expand_more</span>
      </button>
      {open && (
        <div className="absolute top-12 left-0 z-50 bg-white border rounded-xl shadow-lg min-w-[170px] max-h-60 overflow-y-auto py-1">
          {options.map((opt) => (
            <button
              key={opt.id ?? "__all"}
              onClick={() => { onChange(opt.id); setOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${value === opt.id ? "font-bold text-primary" : ""}`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FILTER BAR ───────────────────────────────────────────────────────────────
function FilterBar({ searchInput, onSearchChange, filterOptions, filters, onFilterChange, onClearFilters }) {
  const deptOptions = [{ id: null, name: "All Departments" }, ...(filterOptions.departments || [])];
  const posOptions = [{ id: null, name: "All Positions" }, ...(filterOptions.positions || [])];
  const statusOptions = [
    { id: null, name: "All Statuses" },
    { id: "active", name: "Active" },
    { id: "inactive", name: "Inactive" },
    { id: "terminated", name: "Terminated" },
  ];
  const typeOptions = [
    { id: null, name: "All Types" },
    ...(filterOptions.employmentTypes || []).map((t) => ({ id: t, name: t })),
  ];
  const hasActive = filters.deptId || filters.positionId || filters.status || filters.employmentType || searchInput;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="p-4 flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <label className="relative block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
              <span className="material-symbols-outlined">search</span>
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name or corporate email..."
              className="w-full bg-slate-100 border-none rounded-lg py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown label="Dept" value={filters.deptId} options={deptOptions} onChange={(v) => onFilterChange("deptId", v)} />
          <FilterDropdown label="Pos" value={filters.positionId} options={posOptions} onChange={(v) => onFilterChange("positionId", v)} />
          <FilterDropdown label="Status" value={filters.status} options={statusOptions} onChange={(v) => onFilterChange("status", v)} />
          <FilterDropdown label="Type" value={filters.employmentType} options={typeOptions} onChange={(v) => onFilterChange("employmentType", v)} />

          {hasActive && (
            <button
              onClick={onClearFilters}
              title="Clear all filters"
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 text-red-400 hover:text-red-600 hover:bg-red-50"
            >
              <span className="material-symbols-outlined">filter_list_off</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
function EmployeesTable({ employees, openMenuIndex, onMenuToggle, navigate, onDeactivate, onResign, isLoading, page, totalPages, totalElements, pageSize, onPageChange }) {
  const start = totalElements === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);
  const maxButtons = Math.min(totalPages, 7);
  const startPage = Math.max(0, Math.min(page - 3, totalPages - maxButtons));

  return (
    <div className="bg-white rounded-xl border overflow-visible">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <span className="text-slate-400 animate-pulse text-sm">Loading employees...</span>
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <span className="material-symbols-outlined text-slate-300 text-5xl">people</span>
          <p className="text-slate-400 font-medium">No employees found</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Employee</th>
              <th className="px-6 py-4 text-center">Employee ID</th>
              <th className="px-6 py-4 text-center">Department</th>
              <th className="px-6 py-4 text-center">Position</th>
              <th className="px-6 py-4">Manager</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((emp, i) => (
              <tr
                key={emp?.employeeInfo?.employeeId || i}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => {
                  if (emp?.employeeInfo?.employeeId) {
                    navigate(`/hr/employee-detail/${emp.employeeInfo.employeeId}`);
                  }
                }}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {emp?.employeeInfo?.avatar ? (
                      <img
                        src={emp.employeeInfo.avatar}
                        className="w-10 h-10 rounded-full object-cover bg-slate-100 shrink-0"
                        alt={emp.employeeInfo.employeeName || ""}
                        onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold">{emp?.employeeInfo?.employeeName || "—"}</p>
                      <p className="text-xs text-slate-500">{emp?.employeeInfo?.workEmail || "—"}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-center font-mono text-slate-500">
                  {emp?.employeeInfo?.employeeId || "—"}
                </td>

                <td className="px-6 py-4 text-center">
                  {emp?.employeeInfo?.departmentName ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                      {emp.employeeInfo.departmentName}
                    </span>
                  ) : "—"}
                </td>

                <td className="px-6 py-4 text-center text-slate-600">
                  {emp?.employeeInfo?.positionName || "—"}
                </td>

                <td className="px-6 py-4">
                  {emp?.managerInfo?.managerName ? (
                    <div className="flex items-center gap-2">
                      {emp.managerInfo.managerAvatar ? (
                        <img
                          src={emp.managerInfo.managerAvatar}
                          className="w-6 h-6 rounded-full bg-slate-100 shrink-0"
                          alt={emp.managerInfo.managerName}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0" />
                      )}
                      <span className="text-slate-600">{emp.managerInfo.managerName}</span>
                    </div>
                  ) : (
                    <span className="italic text-slate-400">None assigned</span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-bold capitalize ${
                      emp?.employeeInfo?.status === "active"
                        ? "bg-green-100 text-green-700"
                        : emp?.employeeInfo?.status === "terminated"
                        ? "bg-red-100 text-red-700"
                        : "bg-slate-100 text-slate-600 border"
                    }`}
                  >
                    {emp?.employeeInfo?.status || "—"}
                  </span>
                </td>

                <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onMenuToggle(i)}
                    className="p-2 rounded-lg hover:bg-slate-100"
                  >
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>

                  {openMenuIndex === i && (
                    <div className="absolute right-6 top-12 w-52 bg-white border rounded-xl shadow-lg z-50">
                      <ul className="py-2 text-sm">
                        <li>
                          <button
                            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100"
                            onClick={() => navigate(`/hr/employee-detail/${emp?.employeeInfo?.employeeId}`)}
                          >
                            <span className="material-symbols-outlined text-slate-500">visibility</span>
                            View Profile
                          </button>
                        </li>
                        <li>
                          <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100">
                            <span className="material-symbols-outlined text-slate-500">edit</span>
                            Edit Info
                          </button>
                        </li>
                        <li>
                          <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100">
                            <span className="material-symbols-outlined text-slate-500">sync_alt</span>
                            Assign Department
                          </button>
                        </li>
                        <li className="border-t mt-2">
                          <button
                            className="w-full px-4 py-2 flex items-center gap-3 text-red-600 hover:bg-red-50"
                            onClick={() => onDeactivate(emp?.employeeInfo?.employeeId)}
                          >
                            <span className="material-symbols-outlined">block</span>
                            {emp?.employeeInfo?.status === "active" ? "Deactivate" : "Reactivate"}
                          </button>
                        </li>
                        {emp?.employeeInfo?.status !== "terminated" && (
                          <li>
                            <button
                              className="w-full px-4 py-2 flex items-center gap-3 text-red-600 hover:bg-red-50"
                              onClick={() => onResign(emp?.employeeInfo?.employeeId)}
                            >
                              <span className="material-symbols-outlined">person_remove</span>
                              Mark as Terminated
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="px-6 py-4 flex justify-between items-center border-t bg-slate-50">
        <p className="text-sm text-slate-500">
          {totalElements === 0
            ? "No results"
            : <>Showing <b>{start}–{end}</b> of <b>{totalElements.toLocaleString()}</b> employees</>}
        </p>
        <div className="flex gap-1">
          <button
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="w-9 h-9 border rounded-lg disabled:opacity-40"
          >‹</button>
          {Array.from({ length: maxButtons }).map((_, idx) => {
            const p = startPage + idx;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-lg ${page === p ? "bg-primary text-white" : "border"}`}
              >
                {p + 1}
              </button>
            );
          })}
          <button
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="w-9 h-9 border rounded-lg disabled:opacity-40"
          >›</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function EmployeeListScreen() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCount, setActiveCount] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({ deptId: null, positionId: null, status: null, employmentType: null });
  const [filterOptions, setFilterOptions] = useState({ departments: [], positions: [], employmentTypes: [], roles: [] });
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [showNewEmployee, setShowNewEmployee] = useState(false);
  const navigate = useNavigate();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load filter options + active count on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API_BASE_URL}/api/hradmin/filter-options`, { headers })
      .then((r) => r.json())
      .then((d) => { if (d?.data) setFilterOptions(d.data); })
      .catch(console.error);
    fetch(`${API_BASE_URL}/api/hradmin/employees/count-active`, { headers })
      .then((r) => r.json())
      .then((d) => { if (d?.data !== undefined) setActiveCount(d.data); })
      .catch(console.error);
  }, []);

  // Fetch employees
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsLoading(true);
    const params = new URLSearchParams({ page });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.deptId) params.set("deptId", filters.deptId);
    if (filters.positionId) params.set("positionId", filters.positionId);
    if (filters.status) params.set("status", filters.status);
    if (filters.employmentType) params.set("employmentType", filters.employmentType);
    fetch(`${API_BASE_URL}/api/hradmin/employees?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) {
          console.log(JSON.stringify(d.data));
          setEmployees(d.data.content || []);
          setTotalElements(d.data.totalElements || 0);
          setPageSize(d.data.size || 10);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [page, debouncedSearch, filters]);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  }

  function clearFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setFilters({ deptId: null, positionId: null, status: null, employmentType: null });
    setPage(0);
  }

  async function handleDeactivate(empId) {
    if (!empId) return;
    const token = localStorage.getItem("token");
    const employee = employees.find(e => e?.employeeInfo?.employeeId === empId);
    const currentStatus = employee?.employeeInfo?.status || "active";
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/employees/${empId}/status/${newStatus}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.data) {
        setEmployees((prev) => prev.map((e) => e?.employeeInfo?.employeeId === empId ? data.data : e));
        fetch(`${API_BASE_URL}/api/hradmin/employees/count-active`, { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.json()).then((d) => { if (d?.data !== undefined) setActiveCount(d.data); });
      }
    } catch (e) { console.error(e); }
    setOpenMenuIndex(null);
  }

  async function handleResign(empId) {
    if (!empId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/employees/${empId}/status/terminated`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.data) {
        setEmployees((prev) => prev.map((e) => e?.employeeInfo?.employeeId === empId ? data.data : e));
        fetch(`${API_BASE_URL}/api/hradmin/employees/count-active`, { headers: { Authorization: `Bearer ${token}` } })
          .then((r) => r.json()).then((d) => { if (d?.data !== undefined) setActiveCount(d.data); });
      }
    } catch (e) { console.error(e); }
    setOpenMenuIndex(null);
  }

  function handleEmployeeCreated() {
    const token = localStorage.getItem("token");
    setShowNewEmployee(false);
    setPage(0);
    fetch(`${API_BASE_URL}/api/hradmin/employees/count-active`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json()).then((d) => { if (d?.data !== undefined) setActiveCount(d.data); });
  }

  const totalPages = pageSize > 0 ? Math.ceil(totalElements / pageSize) : 0;

  return (
    <div className="space-y-6" onClick={() => setOpenMenuIndex(null)}>
      <Header activeCount={activeCount} onAddEmployee={() => setShowNewEmployee(true)} />

      <FilterBar
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        filterOptions={filterOptions}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
      />

      <EmployeesTable
        employees={employees}
        openMenuIndex={openMenuIndex}
        onMenuToggle={(i) => setOpenMenuIndex(openMenuIndex === i ? null : i)}
        navigate={navigate}
        onDeactivate={handleDeactivate}
        onResign={handleResign}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={(p) => { setPage(p); setOpenMenuIndex(null); }}
      />

      {showNewEmployee && (
        <NewEmployee
          open={showNewEmployee}
          onClose={() => setShowNewEmployee(false)}
          onSave={handleEmployeeCreated}
          filterOptions={filterOptions}
        />
      )}
    </div>
  );
}