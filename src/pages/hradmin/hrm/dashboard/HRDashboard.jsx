export default function HRDashboard() {
    return (
      <div className="space-y-8">
        {/* ===== KPI CARDS ===== */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Employees */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined">groups</span>
              </div>
              <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  trending_up
                </span>
                12%
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">Total Employees</p>
            <h3 className="text-3xl font-extrabold mt-1">1,482</h3>
          </div>
  
          {/* New / Resigned */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined">
                  person_add_disabled
                </span>
              </div>
              <span className="text-xs font-bold text-slate-500">This Month</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">New / Resigned</p>
            <h3 className="text-3xl font-extrabold mt-1">
              24 <span className="text-lg text-slate-300">/</span>{" "}
              <span className="text-red-500 text-2xl">08</span>
            </h3>
          </div>
  
          {/* Late / Absent */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined">alarm_on</span>
              </div>
              <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">warning</span>
                +4%
              </span>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              Late / Vắng (Absent)
            </p>
            <h3 className="text-3xl font-extrabold mt-1">
              15 <span className="text-lg text-slate-300">/</span>{" "}
              <span className="text-amber-600 text-2xl">04</span>
            </h3>
          </div>
  
          {/* OT Hours */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined">more_time</span>
              </div>
              <span className="text-xs font-bold text-slate-500">Cumulative</span>
            </div>
            <p className="text-slate-500 text-sm font-medium">OT Hours</p>
            <h3 className="text-3xl font-extrabold mt-1">452h</h3>
          </div>
        </section>
  
        {/* ===== MAIN GRID ===== */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-8">
            {/* Staff Fluctuation */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">
                  Staff Fluctuation Over Time
                </h2>
                <select className="text-xs border rounded-lg py-1 px-3 bg-slate-50">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
  
              <div className="h-64 relative chart-grid">
                <svg
                  className="absolute inset-0 w-full h-full px-4 pt-10"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,80 Q25,75 40,60 T70,45 T100,30"
                    fill="none"
                    stroke="#137fec"
                    strokeWidth="2"
                  />
                  <circle cx="0" cy="80" r="2" fill="#137fec" />
                  <circle cx="40" cy="60" r="2" fill="#137fec" />
                  <circle cx="70" cy="45" r="2" fill="#137fec" />
                  <circle cx="100" cy="30" r="2" fill="#137fec" />
                </svg>
  
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-6">
                  {["May", "Jun", "Jul", "Aug", "Sep", "Oct"].map((m) => (
                    <span
                      key={m}
                      className="text-[10px] text-slate-400 font-bold uppercase"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
  
            {/* OT by Department */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">OT by Department (Hours)</h2>
                <button className="text-xs text-primary font-bold">
                  View Details
                </button>
              </div>
  
              {[
                ["Technology", "124h", "w-[85%]"],
                ["Operations", "98h", "w-[65%]"],
                ["Sales & Marketing", "56h", "w-[40%]"],
                ["HR & Admin", "12h", "w-[10%]"],
              ].map(([name, value, width]) => (
                <div key={name} className="mb-4">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>{name}</span>
                    <span>{value}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full">
                    <div className={`bg-primary h-full ${width}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* RIGHT – AI INSIGHTS */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="size-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <h2 className="text-xl font-bold">AI Insights</h2>
              </div>
  
              {/* Flight Risk */}
              <div className="p-4 bg-slate-50 rounded-xl border mb-4">
                <div className="flex justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase">
                    Employee Flight Risk
                  </h3>
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
                    High Alert
                  </span>
                </div>
  
                <p className="text-xs text-slate-600">
                  AI detected a significant drop in engagement over the last 3
                  weeks.
                </p>
  
                <button className="mt-4 w-full py-2 border rounded-lg text-xs font-bold">
                  Schedule Retention Meeting
                </button>
              </div>
  
              {/* Attendance */}
              <div className="p-4 bg-amber-50 rounded-xl border mb-4">
                <p className="text-xs font-bold mb-2 text-amber-700">
                  Attendance Anomaly
                </p>
                <p className="text-xs text-amber-800 mb-3">
                  Sales team recorded unusual OT patterns this Tuesday.
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-amber-600 text-white rounded-lg text-[10px] font-bold">
                    Verify Logs
                  </button>
                  <button className="flex-1 py-1.5 bg-white border rounded-lg text-[10px] font-bold">
                    Dismiss
                  </button>
                </div>
              </div>
  
              {/* Hiring */}
              <div className="p-4 bg-blue-50 rounded-xl border">
                <p className="text-xs font-bold mb-2 text-blue-700">
                  Hiring Prediction
                </p>
                <p className="text-xs text-blue-800">
                  You’ll need <strong>3 more Backend Devs</strong> by Q1.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
  