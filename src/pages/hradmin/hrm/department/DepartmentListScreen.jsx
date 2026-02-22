import NewDepartmentModal from "./NewDepartmentModal";
import { useState } from "react";

export default function DepartmentListScreen() {
    const [openModal, setOpenModal] = useState(false);

    return (
      <div className="space-y-6">
        {/* ===== PAGE HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              Department Management
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Create, manage and monitor organizational departments.
            </p>
          </div>
  
          <button
            onClick={() => {
                setOpenModal(true);
                
            }}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm inline-flex items-center gap-2 shadow-sm hover:bg-primary/90">
            <span className="material-symbols-outlined">add</span>
            Add Department
          </button>
        </div>
        
        {openModal && (
            <NewDepartmentModal onClose={() => setOpenModal(false)} />
        )}


  
        {/* ===== FILTERS ===== */}
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
              placeholder="Search by department name or code..."
            />
          </div>
  
          <div className="flex items-center gap-3">
            <FilterButton label="Status: Active" />
            <FilterButton label="Location: All" />
  
            <div className="w-px h-8 bg-slate-200 hidden sm:block" />
  
            <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-lg">
              <span className="material-symbols-outlined">download</span>
            </button>
          </div>
        </div>
  
        {/* ===== TABLE ===== */}
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
                <DepartmentRow
                  name="Engineering"
                  code="ENG-001"
                  manager="Alex Rivera"
                  members="42 members"
                  status="Active"
                  icon="developer_board"
                  color="blue"
                />
  
                <DepartmentRow
                  name="Marketing & Growth"
                  code="MKT-004"
                  manager="Sarah Jenkins"
                  members="18 members"
                  status="Active"
                  icon="campaign"
                  color="purple"
                />
  
                <DepartmentRow
                  name="Customer Success"
                  code="CSS-012"
                  manager="David Chen"
                  members="29 members"
                  status="Active"
                  icon="support_agent"
                  color="orange"
                />
  
                <DepartmentRow
                  name="Financial Ops"
                  code="FIN-002"
                  manager="Mark Wilson"
                  members="12 members"
                  status="Inactive"
                  icon="calculate"
                  color="slate"
                  inactive
                />
              </tbody>
            </table>
          </div>
  
          {/* ===== PAGINATION ===== */}
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing 1 to 4 of 28 departments
            </span>
  
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm font-bold border rounded-lg text-slate-400 cursor-not-allowed">
                Previous
              </button>
              <button className="px-3 py-1 text-sm font-bold bg-primary text-white rounded-lg">
                1
              </button>
              <button className="px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
                2
              </button>
              <button className="px-3 py-1 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg">
                3
              </button>
              <button className="px-3 py-1 text-sm font-bold border rounded-lg hover:bg-slate-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  /* ================= HELPERS ================= */
  
  function Th({ children, align }) {
    return (
      <th
        className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${
          align === "right" ? "text-right" : ""
        }`}
      >
        {children}
      </th>
    );
  }
  
  function FilterButton({ label }) {
    return (
      <button className="flex h-10 items-center gap-2 rounded-lg bg-slate-50 px-4 border">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="material-symbols-outlined text-slate-400 text-lg">
          expand_more
        </span>
      </button>
    );
  }
  
  function DepartmentRow({
    name,
    code,
    manager,
    members,
    status,
    icon,
    color,
    inactive,
  }) {
    const colorMap = {
      blue: "bg-blue-50 text-blue-600",
      purple: "bg-purple-50 text-purple-600",
      orange: "bg-orange-50 text-orange-600",
      slate: "bg-slate-100 text-slate-500",
    };
  
    return (
      <tr
        className={`hover:bg-slate-50 transition-colors ${
          inactive ? "opacity-70" : ""
        }`}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                colorMap[color] || "bg-slate-100"
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
            </div>
            <span className="text-sm font-bold">{name}</span>
          </div>
        </td>
  
        <td className="px-6 py-4 text-sm text-slate-600 font-mono">{code}</td>
  
        <td className="px-6 py-4 text-sm font-medium text-slate-700">
          {manager}
        </td>
  
        <td className="px-6 py-4 text-sm text-slate-600">{members}</td>
  
        <td className="px-6 py-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600 border"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                status === "Active" ? "bg-green-600" : "bg-slate-400"
              }`}
            />
            {status}
          </span>
        </td>
  
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-1">
            <button className="p-2 text-slate-400 hover:text-primary">
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
            <button
              className={`p-2 ${
                status === "Active"
                  ? "text-slate-400 hover:text-red-500"
                  : "text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {status === "Active" ? "block" : "check_circle"}
              </span>
            </button>
          </div>
        </td>
      </tr>
    );
  }
  