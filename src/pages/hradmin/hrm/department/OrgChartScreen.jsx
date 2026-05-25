import { useState, useEffect, useCallback } from "react";
import OrgQuickView from "./OrgQuickView";

export default function OrgChartScreen() {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employees, setEmployees] = useState([]); // Danh sách tất cả employees từ backend
    const [departments, setDepartments] = useState([]); // Danh sách departments từ backend
    const [teams, setTeams] = useState([]); // Danh sách teams từ backend
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [selectedTeam, setSelectedTeam] = useState("all");

    // API Base URL từ environment variable
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
    const token = localStorage.getItem("token");

    // Fetch employees và departments từ backend khi component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const headers = { Authorization: `Bearer ${token}` };

                // Fetch tất cả employees bằng cách loop qua các pages
                let allEmployees = [];
                let page = 0;
                let hasMore = true;
                while (hasMore) {
                    const empRes = await fetch(`${API_BASE_URL}/api/hradmin/employees?page=${page}&size=100&status=active`, { headers });
                    const empData = await empRes.json();
                    if (empData.status === "success") {
                        const empList = empData.data?.content || [];
                        allEmployees = [...allEmployees, ...empList];
                        hasMore = empList.length > 0 && allEmployees.length < empData.data?.totalElements;
                        page++;
                    } else {
                        hasMore = false;
                    }
                }
                console.log("Total employees fetched:", allEmployees.length);
                setEmployees(allEmployees);

                // Fetch departments để lọc
                const deptRes = await fetch(`${API_BASE_URL}/api/hradmin/departments/active`, { headers });
                const deptData = await deptRes.json();
                if (deptData.status === "success") {
                    setDepartments(deptData.data || []);
                }

                // Fetch teams để lọc
                const teamRes = await fetch(`${API_BASE_URL}/api/hradmin/teams/active`, { headers });
                const teamData = await teamRes.json();
                if (teamData.status === "success") {
                    setTeams(teamData.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch org chart data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Xây dựng cây org chart theo cấu trúc: Department → Department Manager → Teams → Team Lead → Members
    const buildOrgTree = useCallback(() => {
        if (!departments.length) return [];

        // Create department nodes from departments data (not just from employees)
        const deptMap = new Map();
        departments.forEach(dept => {
            deptMap.set(dept.deptName, {
                type: 'department',
                name: dept.deptName,
                departmentId: dept.deptId,
                children: []
            });
        });

        // Group employees by Department
        employees.forEach(emp => {
            const deptName = emp.employeeInfo?.departmentName || "Unassigned";
            if (deptMap.has(deptName)) {
                deptMap.get(deptName).children.push(emp);
            }
        });

        // For each department, build structure
        deptMap.forEach(dept => {
            // Find department manager (employee who is manager of this department)
            const deptData = departments.find(d => d.deptName === dept.name);
            const deptManager = dept.children.find(emp => {
                return deptData && deptData.managerId === emp.employeeInfo?.employeeId;
            });

            // Remove manager from children list
            if (deptManager) {
                dept.children = dept.children.filter(emp => emp !== deptManager);
            }

            // Check if teams data exists and has items for this department
            const deptTeams = teams.filter(t => t.departmentName === dept.name);

            if (deptTeams && deptTeams.length > 0) {
                // Build structure: Department Manager + Teams
                const deptChildren = [];

                // Add Department Manager first
                if (deptManager) {
                    deptChildren.push({
                        type: 'employee',
                        ...deptManager,
                        isDeptManager: true
                    });
                }

                // For each team in this department
                deptTeams.forEach(team => {
                    // Find team members (employees with this teamId)
                    const teamMembers = dept.children.filter(emp => emp.employeeInfo?.teamId === team.teamId);

                    // Find team lead
                    const teamLead = teamMembers.find(emp => emp.employeeInfo?.employeeId === team.managerId);

                    // Remove team lead from members
                    const members = teamMembers.filter(emp => emp.employeeInfo?.employeeId !== team.managerId);

                    // Build team node
                    const teamNode = {
                        type: 'team',
                        name: team.teamName,
                        teamId: team.teamId,
                        children: []
                    };

                    // Add team lead if exists
                    if (teamLead) {
                        teamNode.children.push({
                            type: 'employee',
                            ...teamLead,
                            isTeamLead: true
                        });
                    }

                    // Add team members
                    members.forEach(member => {
                        teamNode.children.push({
                            type: 'employee',
                            ...member
                        });
                    });

                    deptChildren.push(teamNode);
                });

                // Add employees without team (unassigned)
                const unassignedEmployees = dept.children.filter(emp => !emp.employeeInfo?.teamId);
                unassignedEmployees.forEach(emp => {
                    deptChildren.push({
                        type: 'employee',
                        ...emp
                    });
                });

                dept.children = deptChildren;
            } else {
                // No teams - show Department Manager + Employees directly
                const deptChildren = [];

                if (deptManager) {
                    deptChildren.push({
                        type: 'employee',
                        ...deptManager,
                        isDeptManager: true
                    });
                }

                dept.children.forEach(emp => {
                    deptChildren.push({
                        type: 'employee',
                        ...emp
                    });
                });

                dept.children = deptChildren;
            }
        });

        // Convert department map to array
        return Array.from(deptMap.values());
    }, [departments, employees, teams]);

    // Filter employees theo search, department và team
    const filteredEmployees = useCallback(() => {
        let filtered = employees;

        // Filter theo department
        if (selectedDepartment !== "all") {
            filtered = filtered.filter(emp => emp.employeeInfo?.departmentName === selectedDepartment);
        }

        // Filter theo team
        if (selectedTeam !== "all") {
            filtered = filtered.filter(emp => emp.employeeInfo?.teamName === selectedTeam);
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
    }, [employees, search, selectedDepartment, selectedTeam]);

    const orgTree = buildOrgTree();
    const displayEmployees = search || selectedDepartment !== "all" || selectedTeam !== "all" ? filteredEmployees() : orgTree;

    return (
      <div className="flex flex-col gap-6">
  
        {/* CONTROL BAR */}
        <ControlBar
            search={search}
            onSearchChange={setSearch}
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            teams={teams}
            selectedTeam={selectedTeam}
            onTeamChange={setSelectedTeam}
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
                teams={teams}
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

  function ControlBar({ search, onSearchChange, departments, selectedDepartment, onDepartmentChange, teams, selectedTeam, onTeamChange }) {
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
          <select
            value={selectedTeam}
            onChange={(e) => onTeamChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
            disabled={selectedDepartment === "all"}
          >
            <option key="all" value="all">All Teams</option>
            {teams.filter(t => selectedDepartment === "all" || t.departmentName === selectedDepartment).map((team, index) => (
              <option key={index} value={team.teamName}>
                {team.teamName}
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

  function OrgChartCanvas({ employees, onSelect, teams }) {
    // Check if employee is a team lead
    const isTeamLead = (employeeId) => {
        return teams.some(team => team.managerId === employeeId);
    };

    // Render tree structure đệ quy cho hierarchy mới
    const renderTree = (node) => {
        if (!node) return null;

        const hasChildren = node.children && node.children.length > 0;

        // Render dựa trên type của node
        if (node.type === 'department') {
            return (
                <div key={`dept-${node.name}`} className="flex flex-col items-center">
                    <DepartmentNode name={node.name} />
                    {hasChildren && (
                        <>
                            <VerticalLine />
                            <div className="flex gap-4 flex-wrap justify-center">
                                {node.children.map(child => renderTree(child))}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        if (node.type === 'team') {
            return (
                <div key={`team-${node.name}`} className="flex flex-col items-center">
                    <TeamNode name={node.name} />
                    {hasChildren && (
                        <>
                            <VerticalLine />
                            <div className="flex gap-4 flex-wrap justify-center">
                                {node.children.map(child => renderTree(child))}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        // Employee node
        const emp = node.employeeInfo || node;
        const manager = node.managerInfo || {};
        return (
            <div key={emp.employeeId} className="flex flex-col items-center">
                <OrgNode
                    name={emp.employeeName || "Unknown"}
                    title={emp.positionName || "No Position"}
                    avatar={emp.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(emp.employeeName || "Unknown")}
                    manager={node.isDeptManager || !!manager.managerId}
                    teamLead={node.isTeamLead || isTeamLead(emp.employeeId)}
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
            </div>
        );
    };

    // Nếu là flat list (khi filter), render dạng grid đơn giản
    if (employees.length > 0 && !employees[0].type) {
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
                                teamLead={isTeamLead(info.employeeId)}
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
            <div className="flex flex-col items-center gap-8">
                {employees.map(root => renderTree(root))}
            </div>
        </div>
    );
  }

  /* ================= ORG ELEMENTS ================= */

  function DepartmentNode({ name }) {
    return (
      <div className="px-6 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
        <span className="material-symbols-outlined text-blue-600 text-2xl">business</span>
        <p className="font-bold text-blue-900 text-sm mt-1">{name}</p>
      </div>
    );
  }

  function TeamNode({ name }) {
    return (
      <div className="px-6 py-3 bg-purple-50 border-2 border-purple-200 rounded-lg text-center">
        <span className="material-symbols-outlined text-purple-600 text-2xl">groups</span>
        <p className="font-bold text-purple-900 text-sm mt-1">{name}</p>
      </div>
    );
  }

  function OrgNode({ name, title, avatar, manager, teamLead, onClick }) {
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

          <div className="flex flex-col gap-1">
            {manager && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                Manager
              </span>
            )}
            {teamLead && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase">
                Team Lead
              </span>
            )}
          </div>
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
  