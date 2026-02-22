export default function AutomationRulesScreen() {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 flex h-screen bg-background-light text-[#111418]">
  
        {/* ================= MAIN ================= */}
        <main className="xl:col-span-8 flex-1 flex flex-col">
  
          {/* ===== HEADER ===== */}
          <header className="bg-white border-b px-8 py-4">
            <div className="text-sm text-slate-500 flex gap-2">
              <span>AI & Automation</span>
              <span>/</span>
              <span className="text-black font-semibold">Automation Rules</span>
            </div>
  
            <div className="mt-4 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black">Automation Rules</h1>
                <p className="text-slate-500 mt-1">
                  Configure and manage automated HR workflows and business logic.
                </p>
              </div>
  
              <button className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold flex gap-2">
                <span className="material-symbols-outlined">add</span>
                Create Rule
              </button>
            </div>
          </header>
  
          {/* ===== CONTENT ===== */}
          <div className="flex-1 overflow-y-auto mt-8 space-y-6">
  
            {/* ===== RULE TABLE ===== */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <Tabs />
  
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 text-left">Rule Name</th>
                    <th className="px-6 py-4 text-center">Category</th>
                    <th className="px-6 py-4 text-left">Trigger</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-left">Last Executed</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <RuleRow
                    name="Late Arrival Alert"
                    desc="Notify managers for arrivals after 9:30 AM"
                    trigger="Daily 9:30 AM"
                    last="20 Oct 2023, 09:30"
                    active
                  />
                  <RuleRow
                    name="Absence without Leave"
                    desc="Flag if no check-in by 11:00 AM"
                    trigger="Daily 11:00 AM"
                    last="20 Oct 2023, 11:00"
                    active
                  />
                  <RuleRow
                    name="Overtime Calculation (V2)"
                    desc="Custom shift-based overtime logic"
                    trigger="Weekly Sat 12:00 AM"
                    last="Never"
                    disabled
                  />
                </tbody>
              </table>
            </div>
  
            {/* ===== BOTTOM GRID ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ExecutionLog />
              <AutomationHealth />
            </div>
          </div>
        </main>
  
        {/* ================= RIGHT EDIT PANEL ================= */}
        <RuleEditorPanel />
      </div>
    );
  }
  
  /* ================= COMPONENTS ================= */
  
  function SideItem({ icon, label, active, danger }) {
    return (
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
        ${danger ? "text-red-500 hover:bg-red-50" :
          active ? "bg-primary/10 text-primary font-bold" :
          "text-slate-600 hover:bg-slate-100"}`}
      >
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
    );
  }
  
  function Tabs() {
    return (
      <div className="border-b px-6 flex gap-8 text-sm font-bold">
        {["Attendance", "Workflow / Requests", "Payroll", "Employee Lifecycle", "Notification"]
          .map((t, i) => (
            <div
              key={t}
              className={`py-4 flex gap-2 items-center cursor-pointer
                ${i === 0 ? "border-b-2 border-primary text-primary" : "text-slate-500"}`}
            >
              <span className="material-symbols-outlined text-sm">event_available</span>
              {t}
            </div>
          ))}
      </div>
    );
  }
  
  function RuleRow({ name, desc, trigger, last, active, disabled }) {
    return (
      <tr className={`hover:bg-slate-50 ${disabled && "opacity-50"}`}>
        <td className="px-6 py-5">
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-slate-500">{desc}</p>
        </td>
        <td className="px-6 py-5 text-center">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
            Attendance
          </span>
        </td>
        <td className="px-6 py-5 text-slate-500">{trigger}</td>
        <td className="px-6 py-5 text-center">
          <div className={`w-10 h-5 rounded-full relative mx-auto
            ${active ? "bg-primary" : "bg-gray-300"}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full
              ${active ? "right-0.5" : "left-0.5"}`} />
          </div>
        </td>
        <td className="px-6 py-5 text-slate-500">{last}</td>
        <td className="px-6 py-5 text-right">
          <button className="text-primary font-bold text-sm">Edit</button>
        </td>
      </tr>
    );
  }
  
  function ExecutionLog() {
    return (
      <div className="lg:col-span-2 bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between">
          <h3 className="font-bold flex gap-2 items-center">
            <span className="material-symbols-outlined text-primary">history</span>
            Execution Log
          </h3>
          <button className="text-xs font-bold text-slate-500">View All Logs</button>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y">
            <LogRow rule="Late Arrival Alert" result="12 notifications sent" success />
            <LogRow rule="Absence without Leave" result="4 records updated" success />
            <LogRow rule="Payroll Sync" result="Connection timeout to ERP" failed />
          </tbody>
        </table>
      </div>
    );
  }
  
  function LogRow({ rule, result, success, failed }) {
    return (
      <tr>
        <td className="px-6 py-3 text-slate-500">Oct 20, 14:15</td>
        <td className="px-6 py-3 font-medium">{rule}</td>
        <td className="px-6 py-3 text-slate-500">{result}</td>
        <td className="px-6 py-3">
          {success && <span className="text-green-600 font-bold">Success</span>}
          {failed && <span className="text-red-600 font-bold">Failed</span>}
        </td>
      </tr>
    );
  }
  
  function AutomationHealth() {
    return (
      <div className="bg-primary text-white rounded-xl p-6 flex flex-col justify-between">
        <div>
          <p className="text-xs font-bold uppercase opacity-80">Automation Health</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-black">98.2%</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm font-bold">
              +1.4%
            </span>
          </div>
          <p className="mt-2 text-sm opacity-90">
            1,240 successful executions this month
          </p>
        </div>
      </div>
    );
  }
  
  function RuleEditorPanel() {
    return (
      //  Rule Editor Panel 
    <div className="xl:col-span-4 border-l border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-[#cfdbe7] dark:border-slate-700 flex justify-between items-center">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-[#0d141b] dark:text-white">Rule Configuration</h3>
          <span className="text-xs text-[#4c739a]">ID: RUL-10293-MISSING</span>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[#4c739a]">
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[#0d141b] dark:text-white">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="flex flex-col gap-8">
      {/*  Basic Info  */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="h-6 w-1 bg-primary rounded-full"></span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#4c739a]">Basic Information</h4>
            </div>
            <div className="grid gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0d141b] dark:text-slate-300">Rule Name</label>
                <input className="w-full rounded-lg border-[#cfdbe7] dark:border-slate-700 dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary" type="text" value="Missing Check-in Reminder"/>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0d141b] dark:text-slate-300">Description</label>
                <textarea className="w-full rounded-lg border-[#cfdbe7] dark:border-slate-700 dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary" rows="2">Notify employees who have not clocked in by their scheduled start time.</textarea>
              </div>
            </div>
          </section>
      {/* <!-- Trigger --> */}
          <section className="flex flex-col gap-4 relative">
            <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-primary text-xs">bolt</span>
              </span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#4c739a]">1. Trigger</h4>
            </div>
            <div className="ml-8">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0d141b] dark:text-slate-300">Trigger Type</label>
                <select className="w-full rounded-lg border-[#cfdbe7] dark:border-slate-700 dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>Event-based</option>
                  <option>Time-based</option>
                  <option>Condition-based</option>
                </select>
              </div>
            </div>
          </section>
      {/* <!-- Condition --> */}
          <section className="flex flex-col gap-4 relative">
            <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center z-10">
                <span className="material-symbols-outlined text-primary text-xs">filter_alt</span>
              </span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#4c739a]">2. Conditions</h4>
            </div>
            <div className="ml-8 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-dashed border-[#cfdbe7] dark:border-slate-700 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  <select className="rounded border-[#cfdbe7] dark:border-slate-700 dark:bg-slate-800 text-[11px] p-1 font-medium"><option>Check-in Status</option></select>
                  <select className="rounded border-[#cfdbe7] dark:border-slate-700 dark:bg-slate-800 text-[11px] p-1 font-medium"><option>is empty</option></select>
                  <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded text-[11px] flex items-center px-2">True</div>
                </div>
              <button className="text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
              </div>
              <button className="text-primary text-[11px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">add_circle</span> Add Condition
              </button>
            </div>
          </section>
      {/* <!-- Action --> */}
          <section className="flex flex-col gap-4 relative">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-primary flex items-center justify-center z-10 shadow-sm">
                <span className="material-symbols-outlined text-white text-xs">play_arrow</span>
              </span>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#4c739a]">3. Actions</h4>
            </div>
            <div className="ml-8 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0d141b] dark:text-slate-300">Action Type</label>
                <select className="w-full rounded-lg border-[#cfdbe7] dark:border-slate-700 dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary">
                  <option>Send Notification</option>
                  <option>Create HR Task</option>
                  <option>Trigger n8n Workflow</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0d141b] dark:text-slate-300">Target Recipients</label>
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input checked="" className="rounded border-[#cfdbe7] text-primary focus:ring-primary h-4 w-4" type="checkbox"/>
                    <span className="text-sm">Employee</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input className="rounded border-[#cfdbe7] text-primary focus:ring-primary h-4 w-4" type="checkbox"/>
                    <span className="text-sm">Manager</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input className="rounded border-[#cfdbe7] text-primary focus:ring-primary h-4 w-4" type="checkbox"/>
                    <span className="text-sm">HR Admin</span>
                  </label>
                </div>
              </div>
            </div>
      </section>
      </div>
      </div>
      {/* <!-- Audit Log & Metadata --> */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/80 border-t border-[#cfdbe7] dark:border-slate-700">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] text-[#4c739a] font-bold uppercase tracking-widest">
              <span>Audit Log Preview</span>
              <a className="text-primary hover:underline" href="#">View History</a>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-sm text-green-500">check_circle</span>
                <span className="text-[#0d141b] dark:text-slate-300">Last executed: <strong>Today, 9:30 AM</strong></span>
                <span className="ml-auto text-[#4c739a]">Success</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-sm text-[#4c739a]">person</span>
                <span className="text-[#0d141b] dark:text-slate-300">Created by: <strong>Admin User</strong></span>
                <span className="ml-auto text-[#4c739a]">June 12, 2024</span>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary/90 transition-all">Save Changes</button>
              <button className="px-5 py-2.5 border border-[#cfdbe7] dark:border-slate-700 text-sm font-bold rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-all">Cancel</button>
            </div>
          </div>
      </div>
    </div>
    );
  }
  
  /* ===== small UI ===== */
  
  const EditorSection = ({ title, step, children }) => (
    <section className="space-y-4">
      <h4 className="font-bold uppercase text-sm flex gap-2 items-center">
        <span className="w-6 h-6 bg-slate-200 rounded-full text-xs flex items-center justify-center">
          {step}
        </span>
        {title}
      </h4>
      <div className="space-y-3 ml-8">{children}</div>
    </section>
  );
  
  const Input = ({ label, value, type = "text" }) => (
    <div>
      <label className="text-xs font-bold text-slate-500">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="w-full mt-1 rounded-lg bg-slate-100 border-none"
      />
    </div>
  );
  
  const Textarea = ({ label, value }) => (
    <div>
      <label className="text-xs font-bold text-slate-500">{label}</label>
      <textarea
        defaultValue={value}
        className="w-full mt-1 rounded-lg bg-slate-100 border-none"
        rows={3}
      />
    </div>
  );
  
  const Select = ({ label }) => (
    <div>
      <label className="text-xs font-bold text-slate-500">{label}</label>
      <select className="w-full mt-1 rounded-lg bg-slate-100 border-none">
        <option>Option</option>
      </select>
    </div>
  );
  
  const Checkbox = ({ label, checked }) => (
    <label className="flex gap-3 items-start cursor-pointer">
      <input type="checkbox" defaultChecked={checked} />
      <span className="text-sm">{label}</span>
    </label>
  );
  