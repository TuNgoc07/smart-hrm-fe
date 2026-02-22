import { useState } from "react";
import { useNavigate } from "react-router-dom";



export default function AttendanceScreen() {
  const navigate = useNavigate();

    return (
      <div className="space-y-8 bg-background-light min-h-screen">
  
        {/* ===== PAGE HEADER ===== */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              Attendance Dashboard
            </h2>
            <p className="text-slate-500">
              Overview for Monday, Oct 23, 2023
            </p>
          </div>
  
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-lg p-1 border">
              <button className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-md">
                Today
              </button>
              <button className="px-4 py-1.5 text-slate-600 text-sm font-medium rounded-md">
                Weekly
              </button>
            </div>
  
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold">
              <span className="material-symbols-outlined">corporate_fare</span>
              All Departments
              <span className="material-symbols-outlined">expand_more</span>
            </button>
  
            <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold">
              <span className="material-symbols-outlined">download</span>
              Export
            </button>
            <button
            onClick = {() => navigate(`/hr/attendance/exceptions`)} 
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-lg text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
              <span className="material-symbols-outlined">report_problem</span>
              Attendance Exceptions
            </button>
            <button 
            onClick={() => navigate(`/hr/attendance/records`)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-blue-600 transition-colors">
              <span className="material-symbols-outlined">grid_on</span>
              Attendance Records
            </button>
          </div>
        </div>
  
        {/* ===== KPI CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { icon: "groups", label: "TOTAL EMPLOYEES", value: "1,240", badge: "+2%", color: "blue" },
            { icon: "how_to_reg", label: "CHECKED-IN", value: "1,102", badge: "89% Rate", color: "emerald" },
            { icon: "history", label: "LATE", value: "45", badge: "+12 vs Avg", color: "amber" },
            { icon: "person_off", label: "ABSENT", value: "93", badge: "7.5%", color: "rose" },
            { icon: "hourglass_top", label: "OT HOURS", value: "240 hrs", badge: "High", color: "indigo" },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex justify-between mb-4">
                <div className={`size-10 rounded-lg bg-${kpi.color}-100 text-${kpi.color}-600 flex items-center justify-center`}>
                  <span className="material-symbols-outlined">{kpi.icon}</span>
                </div>
                <span className={`text-xs font-bold bg-${kpi.color}-50 text-${kpi.color}-600 px-2 py-0.5 rounded-full`}>
                  {kpi.badge}
                </span>
              </div>
              <p className="text-xs font-bold uppercase text-slate-500">
                {kpi.label}
              </p>
              <p className="text-2xl font-black mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>
  
        {/* ===== CHARTS ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BAR CHART */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-6">
              Attendance Status by Department
            </h3>
  
            <div className="flex items-end justify-around h-64 gap-4">
              {[
                { name: "Sales", p: 75, l: 15, a: 10 },
                { name: "IT", p: 90, l: 5, a: 5 },
                { name: "Logistics", p: 70, l: 10, a: 20 },
                { name: "HR", p: 80, l: 12, a: 8 },
              ].map((d) => (
                <div key={d.name} className="flex flex-col items-center gap-2">
                  <div className="w-12 h-48 flex flex-col-reverse bg-slate-100 rounded overflow-hidden">
                    <div className="bg-rose-500" style={{ height: `${d.a}%` }} />
                    <div className="bg-amber-400" style={{ height: `${d.l}%` }} />
                    <div className="bg-emerald-500" style={{ height: `${d.p}%` }} />
                  </div>
                  <span className="text-xs text-slate-500">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
  
          {/* LINE CHART */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-6">OT Hours Trend</h3>
  
            <svg viewBox="0 0 400 150" className="w-full h-64">
              <path
                d="M0,130 L50,110 L100,120 L150,80 L200,60 L250,90 L300,50 L350,70 L400,30"
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
              />
            </svg>
  
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>
  
        {/* ===== TABLE + AI ALERTS ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* TABLE */}
          <div className="xl:col-span-9 bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between">
            <h3 className="text-lg font-bold">Today Attendance Snapshot</h3>
            <button className="text-primary font-bold text-sm">View All</button>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Employee", "Department", "Shift Start", "Status", "Actions"].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y">
              {[
                {
                  name: "Jordan Smith",
                  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                  dept: "Sales & Marketing",
                  time: "09:00 AM",
                  status: "Late (45m)",
                  badge: "bg-amber-100 text-amber-600",
                },
                {
                  name: "Sarah Chen",
                  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                  dept: "IT Infrastructure",
                  time: "08:30 AM",
                  status: "Missing",
                  badge: "bg-rose-100 text-rose-600",
                },
                {
                  name: "Marcus Roe",
                  avatar: "https://randomuser.me/api/portraits/men/65.jpg",
                  dept: "Logistics",
                  time: "09:00 AM",
                  status: "Late (12m)",
                  badge: "bg-amber-100 text-amber-600",
                },
              ].map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.avatar}
                        alt={r.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-bold">{r.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">{r.dept}</td>
                  <td className="px-6 py-4">{r.time}</td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.badge}`}>
                      {r.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1 bg-slate-100 rounded text-xs font-bold">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
          {/* AI ALERTS */}
          <div className="space-y-4 xl:col-span-3">
            <div className="bg-white rounded-xl border shadow-sm">
              <div className="p-6 border-b flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <h3 className="text-lg font-bold">AI Alerts & Exceptions</h3>
              </div>
  
              <div className="p-4 space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <span className="text-[10px] font-bold text-primary">AI DETECTED</span>
                  <p className="font-bold mt-2">Unusual OT Spike</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Logistics department shows 40% higher OT than previous Mondays.
                  </p>
                  <button className="w-full mt-4 py-2 border rounded-lg text-xs font-bold hover:bg-primary hover:text-white">
                    Review Impact
                  </button>
                </div>
  
                <div className="p-4 bg-slate-50 rounded-lg border">
                  <span className="text-[10px] font-bold text-primary">AI DETECTED</span>
                  <p className="font-bold mt-2">Missing Check-outs</p>
                  <p className="text-xs text-slate-500 mt-1">
                    3 employees missed check-out for 2 consecutive days.
                  </p>
                  <button className="w-full mt-4 py-2 border rounded-lg text-xs font-bold hover:bg-primary hover:text-white">
                    Review Exceptions
                  </button>
                </div>
              </div>
            </div>
  
            <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl text-center">
              <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-3xl">task_alt</span>
              </div>
              <h4 className="font-bold">Ready for Payroll?</h4>
              <p className="text-xs text-slate-500 mt-2">
                All exceptions for the morning shift have been logged.
              </p>
              <button className="mt-4 px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg">
                Generate Report
              </button>
            </div>
          </div>
        </div>
  
      </div>
    );
  }
  