import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function HRSidebar({ isOpen, setIsOpen }) {
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openPayroll, setOpenPayroll] = useState(false);
  const [openIntelligence, setIntelligence] = useState(false);

  const navigate = useNavigate();

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r flex flex-col overflow-y-auto transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Header with Logo and Close Button */}
      <div className="p-6 flex items-center justify-between border-b">
        <div className="font-extrabold text-primary text-xl">
          SMART HR
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
        >
          <span className="material-symbols-outlined text-slate-600">close</span>
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-2 text-sm">
        {/* Home */}
        <NavLink to="/hr/home" onClick={handleLinkClick} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-semibold ${isActive ? "bg-primary/10 text-primary" : "hover:bg-slate-100"}`}>
          <span className="material-symbols-outlined text-lg">home</span>
          Home
        </NavLink>

        {/* Dashboard */}
        <NavLink to="/hr/dashboard" onClick={handleLinkClick} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-semibold ${isActive ? "bg-primary/10 text-primary" : "hover:bg-slate-100"}`}>
          <span className="material-symbols-outlined text-lg">dashboard</span>
          Dashboard
        </NavLink>

        {/* Notifications */}
        <NavLink to="/hr/notifications" onClick={handleLinkClick} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-semibold ${isActive ? "bg-primary/10 text-primary" : "hover:bg-slate-100"}`}>
          <span className="material-symbols-outlined text-lg">notifications</span>
          Notifications
        </NavLink>

        {/* Employee Management */}
        <div>
          <button
            onClick={() => setOpenEmployee(!openEmployee)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">people</span>
              Employee Management
            </div>
            <span className={`material-symbols-outlined text-sm transition-transform ${openEmployee ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>
          <div className={`ml-9 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${openEmployee ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <NavLink to="/hr/employee-list" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">person</span>
              Employee List
            </NavLink>
            <NavLink to="/hr/department-list" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">corporate_fare</span>
              Department
            </NavLink>
            <NavLink to="/hr/position-list" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">badge</span>
              Position
            </NavLink>
            <NavLink to="/hr/contract-list" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">description</span>
              Contracts
            </NavLink>
            <NavLink to="/hr/jobs" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">work</span>
              Jobs
            </NavLink>
            <NavLink to="/hr/teams" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">work</span>
              Team
            </NavLink>
            <NavLink to="/hr/leave-policies" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">policy</span>
              Leave Policies
            </NavLink>
            <NavLink to="/hr/checklist-templates" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">checklist</span>
              Checklist Templates
            </NavLink>
            <NavLink to="/hr/checklist-assignments" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">assignment</span>
              Checklist Assignments
            </NavLink>
          </div>
        </div>

        {/* Attendance */}
        <NavLink to="/hr/attendance" onClick={handleLinkClick} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-semibold ${isActive ? "bg-primary/10 text-primary" : "hover:bg-slate-100"}`}>
          <span className="material-symbols-outlined text-lg">schedule</span>
          Attendance
        </NavLink>

        {/* Workflow */}
        <NavLink to="/hr/workflow-statistic" onClick={handleLinkClick} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-semibold ${isActive ? "bg-primary/10 text-primary" : "hover:bg-slate-100"}`}>
          <span className="material-symbols-outlined text-lg">assignment</span>
          Workflow
        </NavLink>

        {/* Payroll */}
        <div>
          <button
            onClick={() => setOpenPayroll(!openPayroll)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">payments</span>
              Payroll
            </div>
            <span className={`material-symbols-outlined text-sm transition-transform ${openPayroll ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </button>
          <div className={`ml-9 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${openPayroll ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"}`}>
            <NavLink to="/hr/payroll-overview" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">assessment</span>
              Payroll Overview
            </NavLink>
            <NavLink to="/hr/payroll-calculation" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">calculate</span>
              Payroll Calculation
            </NavLink>
            <NavLink to="/hr/payroll-results" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">receipt_long</span>
              Payroll Results
            </NavLink>
            <NavLink to="/hr/payslip-history" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">history</span>
              Payslip History
            </NavLink>
            <NavLink to="/hr/payroll-config" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">settings</span>
              Payroll Configuration
            </NavLink>
            <NavLink to="/hr/holiday-calendar" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">event</span>
              Holiday Calendar
            </NavLink>
            <NavLink to="/hr/attendance-period-config" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">date_range</span>
              Attendance Period Config
            </NavLink>
            <NavLink to="/hr/work-locations" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-2">location_on</span>
              Work Locations
            </NavLink>
          </div>
        </div>

        {/* Recruitment ATS */}
        <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold">
          <span className="material-symbols-outlined text-lg">work_history</span>
          Recruitment ATS
        </a>

        {/* Reports */}
        <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold">
          <span className="material-symbols-outlined text-lg">analytics</span>
          Reports
        </a>

        {/* Org Chart */}
        <NavLink to="/hr/org-chart" onClick={handleLinkClick} className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg font-semibold ${isActive ? "bg-primary/10 text-primary" : "hover:bg-slate-100"}`}>
          <span className="material-symbols-outlined text-lg">account_tree</span>
          Org Chart
        </NavLink>

        {/* AI Insights & Intelligence */}
        <div>
          <button
            onClick={() => setIntelligence(!openIntelligence)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">
                auto_awesome
              </span>
              Insights & Intelligence
            </div>

            <span
              className={`material-symbols-outlined text-sm transition-transform ${
                openIntelligence ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>

          {/* Dropdown */}
          <div className={`ml-9 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${openIntelligence ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <NavLink to="/hr/ai-insights" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-1">psychology</span>
              Insights
            </NavLink>
            <NavLink to="/hr/ai-assistant" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-1">smart_toy</span>
              Assistant
            </NavLink>
            <NavLink to="/hr/automation-rules" onClick={handleLinkClick} className={({ isActive }) => `block px-3 py-1.5 rounded-md flex items-center ${isActive ? "text-primary font-semibold bg-primary/10" : "text-slate-600 hover:text-primary hover:bg-slate-100"}`}>
              <span className="material-symbols-outlined text-lg mr-1">settings_suggest</span>
              Automation Rules
            </NavLink>
          </div>
        </div>
        
      </nav>

      {/* Logout */}
      <button className="m-4 py-2 bg-slate-100 rounded-lg font-bold hover:bg-red-50 hover:text-red-600 transition">
        Logout
      </button>
    </aside>
    </>
  );
}
