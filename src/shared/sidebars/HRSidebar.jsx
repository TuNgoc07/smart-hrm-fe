import { useState } from "react";
import { NavLink,useNavigate } from "react-router-dom";

export default function HRSidebar() {
  const [openHR, setOpenHR] = useState(false); // mở sẵn cho giống design\
  const [openIntelligence, setIntelligence] = useState(false);

  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-white border-r flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-6 font-extrabold text-primary text-xl">
        SMART HR
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 space-y-2 text-sm">
        {/* Home */}
        <NavLink to ="/hr/home" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-bold">
          <span className="material-symbols-outlined text-lg">grid_view</span>
          Home
        </NavLink>

        {/* HR Management */}
        <div>
          <button
            onClick={() => setOpenHR(!openHR)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">
                groups
              </span>
              HR Management
            </div>

            <span
              className={`material-symbols-outlined text-sm transition-transform ${
                openHR ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>

          {/* Dropdown */}
          <div
            className={`ml-9 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
              openHR ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <NavLink to="/hr/dashboard" className="block px-3 py-1.5 rounded-md text-primary font-semibold bg-primary/10">
              Dashboard
            </NavLink>
            <NavLink to="/hr/employee-list" className="block px-3 py-1.5 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100">
              Employee
            </NavLink>
            <NavLink to="/hr/attendance" className="block px-3 py-1.5 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100">
              Attendance
            </NavLink>
            <NavLink to="/hr/workflow-statistic" className="block px-3 py-1.5 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100">
              Workflow
            </NavLink>
            <NavLink to='/hr/payroll-overview' className="block px-3 py-1.5 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100">
              Payroll
            </NavLink>
            <NavLink to='/hr/department-list' className="block px-3 py-1.5 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100">
              Department
            </NavLink>
            <NavLink to='/hr/position-list' className="block px-3 py-1.5 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100">
              Position
            </NavLink>
            <NavLink to='/hr/contract-list' className="block px-3 py-1.5 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100">
              Contracts
            </NavLink>               
          </div>
        </div>

        {/* Recruitment */}
        <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold">
          <span className="material-symbols-outlined text-lg">
            work_history
          </span>
          Recruitment ATS
        </a>

        {/* Reports */}
        <a className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold">
          <span className="material-symbols-outlined text-lg">
            analytics
          </span>
          Reports
        </a>
        <NavLink
        to="/hr/org-chart"
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 font-semibold">
          <span className="material-symbols-outlined text-lg">
            account_tree
          </span>
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
          <div
            className={`ml-9 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
              openIntelligence ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <NavLink to="/hr/ai-insights" className="block px-3 py-1.5 rounded-md text-primary font-semibold bg-primary/10 flex items-center">
              <span className="material-symbols-outlined text-lg mr-1">
              psychology
              </span> 
              Insights
            </NavLink>
            <NavLink to="/hr/ai-assistant" className="block px-3 py-1.5 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100 flex items-center">
              <span className="material-symbols-outlined text-lg mr-1">
                smart_toy
              </span>  
              Assistant
            </NavLink>
            <NavLink to="/hr/automation-rules" className="block px-3 py-1.5 rounded-md text-slate-600 hover:text-primary hover:bg-slate-100 flex items-center">
              <span className="material-symbols-outlined text-lg mr-1">
                settings_suggest
              </span>  
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
  );
}
