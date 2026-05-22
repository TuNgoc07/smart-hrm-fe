import { useState, useEffect, useCallback } from "react";
import OrgQuickView from "./OrgQuickView";

export default function OrgChartScreen() {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]); // Danh sách tất cả employees từ backend
    const [departments, setDepartments] = useState([]); // Danh sách departments từ backend
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");

    // API Base URL từ environment variable
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
    const token = localStorage.getItem("token");

    // Fetch employees và departments từ backend khi component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch tất cả employees (page=0, size lớn để lấy hết)
                const empRes = await fetch(`${API_BASE_URL}/api/hradmin/employees?page=0&status=active`, { headers });
                const empData = await empRes.json();
                console.log("org chart: " + JSON.stringify(empData))
                if (empData.status === "success") {
                    // Extract employee list từ paged response
                    const empList = empData.data?.content || [];
                    setEmployees(empList);
                }

                // Fetch departments để lọc
                const deptRes = await fetch(`${API_BASE_URL}/api/hradmin/departments/active`, { headers });
                const deptData = await deptRes.json();
                if (deptData.status === "success") {
                    setDepartments(deptData.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch org chart data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Xây dựng cây org chart từ danh sách employees
    // Logic: Tìm employees không có manager (managerId = null) làm root, sau đó đệ quy tìm direct reports
    const buildOrgTree = useCallback(() => {
        if (!employees.length) return [];

        // Tạo map employeeId -> employee để lookup nhanh
        const empMap = new Map();
        employees.forEach(emp => {
            empMap.set(emp.employeeInfo?.employeeId, emp);
        });

        // Tìm root nodes (employees không có manager hoặc managerId trùng với employeeId - self-reference)
        const roots = employees.filter(emp => !emp.managerInfo?.managerId || emp.managerInfo?.managerId === emp.employeeInfo?.employeeId);

        // Track visited nodes để tránh cycle
        const visited = new Set();

        // Hàm đệ quy để build tree con
        const buildChildren = (parentId) => {
            return employees
                .filter(emp => emp.managerInfo?.managerId === parentId && !visited.has(emp.employeeInfo?.employeeId))
                .map(emp => {
                    visited.add(emp.employeeInfo?.employeeId);
                    return {
                        ...emp,
                        children: buildChildren(emp.employeeInfo?.employeeId)
                    };
                });
        };

        // Build tree từ roots
        return roots.map(root => {
            visited.add(root.employeeInfo?.employeeId);
            return {
                ...root,
                children: buildChildren(root.employeeInfo?.employeeId)
            };
        });
    }, [employees]);

    // Filter employees theo search và department
    const filteredEmployees = useCallback(() => {
        let filtered = employees;

        // Filter theo department
        if (selectedDepartment !== "all") {
            filtered = filtered.filter(emp => emp.employeeInfo?.departmentName === selectedDepartment);
        }

        // Filter theo search (tên hoặc position)
        if (search) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(emp =>
                emp.employeeInfo?.employeeName?.toLowerCase().includes(searchLower) ||
                emp.employeeInfo?.positionName?.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [employees, search, selectedDepartment]);

    const orgTree = buildOrgTree();
    const displayEmployees = search || selectedDepartment !== "all" ? filteredEmployees() : employees;

    return (
      <div className="flex flex-col gap-6">
  
        {/* CONTROL BAR */}
        <ControlBar
            search={search}
            onSearchChange={setSearch}
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
        />
  
        {/* ORG CHART CANVAS */}
        {loading ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
                Loading organization chart...
            </div>
        ) : displayEmployees.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
                No employees found.
            </div>
        ) : (
            <OrgChartCanvas
                employees={search || selectedDepartment !== "all" ? buildFlatTree(displayEmployees) : orgTree}
                onSelect={setSelectedEmployee}
            />
        )}

        {/* OVERLAY */}
        {selectedEmployee && (
            <div
            className="fixed inset-0 bg-slate-200/40 backdrop-blur-sm z-30"
            onClick={() => setSelectedEmployee(null)}
            />
        )}

        {/* SIDE PANEL */}
        <OrgQuickView
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
        />
    
      </div>
    );
  }

  // Helper: Build flat tree cho filtered view (không theo hierarchy)
  function buildFlatTree(employees) {
      return employees.map(emp => ({
          ...emp,
          children: [] // Flat tree không có children
      }));
  }
  
  /* ================= CONTROL BAR ================= */

  function ControlBar({ search, onSearchChange, departments, selectedDepartment, onDepartmentChange }) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">
          <SearchInput search={search} onSearchChange={onSearchChange} />
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
          >
            <option key="all" value="all">All Departments</option>
            {departments.map((dept, index) => (
              <option key={index} value={dept.departmentName}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <IconBtn icon="zoom_in" />
          <IconBtn icon="zoom_out" />
          <IconBtn icon="fullscreen_exit" />
          <button className="ml-2 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
        </div>
      </div>
    );
  }

  function SearchInput({ search, onSearchChange }) {
    return (
      <div className="relative flex-1 max-w-sm">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          placeholder="Search employee or position..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
        />
      </div>
    );
  }
  
  /* ================= ORG CHART ================= */

  function OrgChartCanvas({ employees, onSelect }) {
    // Render tree structure đệ quy
    const renderTree = (node) => {
        if (!node) return null;

        const emp = node.employeeInfo || {};
        const manager = node.managerInfo || {};
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={emp.employeeId} className="flex flex-col items-center">
                <OrgNode
                    name={emp.employeeName || "Unknown"}
                    title={emp.positionName || "No Position"}
                    avatar={emp.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(emp.employeeName || "Unknown")}
                    manager={!!manager.managerId} // Có manager thì hiển thị badge Manager
                    onClick={() => onSelect({
                        employeeId: emp.employeeId,
                        name: emp.employeeName,
                        title: emp.positionName,
                        department: emp.departmentName,
                        location: emp.workingLocation || "Not specified",
                        avatar: emp.avatar,
                        reportsTo: manager.managerName || null,
                        email: emp.workEmail,
                        phone: emp.phoneNumber,
                        status: emp.status,
                    })}
                />

                {hasChildren && (
                    <>
                        <VerticalLine />
                        <HorizontalLine width={`${node.children.length * 200}px`} />
                        <div className="flex gap-8">
                            {node.children.map(child => renderTree(child))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    // Nếu là flat list (khi filter), render dạng grid đơn giản
    if (employees.length > 0 && !employees[0].children) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-12 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {employees.map(emp => {
                        const info = emp.employeeInfo || {};
                        const manager = emp.managerInfo || {};
                        return (
                            <OrgNode
                                key={info.employeeId}
                                name={info.employeeName || "Unknown"}
                                title={info.positionName || "No Position"}
                                avatar={info.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(info.employeeName || "Unknown")}
                                manager={!!manager.managerId}
                                onClick={() => onSelect({
                                    employeeId: info.employeeId,
                                    name: info.employeeName,
                                    title: info.positionName,
                                    department: info.departmentName,
                                    location: info.workingLocation || "Not specified",
                                    avatar: info.avatar,
                                    reportsTo: manager.managerName || null,
                                    email: info.workEmail,
                                    phone: info.phoneNumber,
                                    status: info.status,
                                })}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    // Render tree structure (default view)
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-12 overflow-auto">
            <div className="flex flex-col items-center">
                {employees.map(root => renderTree(root))}
            </div>
        </div>
    );
  }

  /* ================= ORG ELEMENTS ================= */

  function OrgNode({ name, title, avatar, manager, onClick }) {
    return (
      <div
      onClick={onClick} 
      className="w-64 bg-white border border-slate-200 rounded-xl p-4 shadow hover:border-primary transition-all">
        <div className="flex items-center gap-4">
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-full border"
          />
  
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate">{name}</p>
            <p className="text-xs text-slate-500 truncate">{title}</p>
          </div>
  
          {manager && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
              Manager
            </span>
          )}
        </div>
      </div>
    );
  }
  
  /* ================= UI HELPERS ================= */
  
  function IconBtn({ icon }) {
    return (
      <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
        <span className="material-symbols-outlined">{icon}</span>
      </button>
    );
  }
  
  function VerticalLine({ height = "48px" }) {
    return <div className="w-px bg-slate-300" style={{ height }} />;
  }
  
  function HorizontalLine({ width }) {
    return <div className="h-px bg-slate-300" style={{ width }} />;
  }
  