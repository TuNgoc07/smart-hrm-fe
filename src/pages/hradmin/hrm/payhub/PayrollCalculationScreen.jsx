import { useState } from "react";

export default function PayrollCalculationScreen() {
  const [mode, setMode] = useState("full");
  const [running, setRunning] = useState(false);

  return (
    <div className="space-y-8 w-full">
      
      {/* ===== HEADER ===== */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Payroll</span> / <span className="font-bold text-slate-800">Calculation</span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black">Payroll Calculation</h1>
            <p className="text-slate-500 mt-1">October 2024 Billing Period</p>
          </div>

          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            OPEN
          </span>
        </div>
      </div>

      {/* ===== DATA VALIDATION ===== */}
      <section>
        <h2 className="font-bold mb-4">Data Validation</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Employees" value="120" />
          <StatCard title="Attendance Closed" value="Yes" />
          <StatCard title="Pending Requests" value="0" />
          <StatCard title="Total OT Hours" value="350" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ===== CALCULATION OPTIONS ===== */}
        <section className="lg:col-span-8 bg-white rounded-xl border p-6 space-y-6">
          <h2 className="font-bold text-lg">Calculation Options</h2>

          {/* Components */}
          <div>
            <p className="font-bold mb-3">Include Components</p>
            <div className="grid grid-cols-2 gap-4">
              <Check label="Base Salary" />
              <Check label="OT Payment" />
              <Check label="Allowances" />
              <Check label="Deductions" />
            </div>
          </div>

          {/* Mode */}
          <div>
            <p className="font-bold mb-3">Calculation Mode</p>

            <Radio
              checked={mode === "full"}
              onClick={() => setMode("full")}
              title="Full Payroll"
              desc="Recalculate all employees in the current period."
            />

            <Radio
              checked={mode === "selected"}
              onClick={() => setMode("selected")}
              title="Recalculate Selected"
              desc="Only process employees with pending changes."
            />
          </div>
        </section>

        {/* ===== PREVIEW ===== */}
        <section className="lg:col-span-4 bg-slate-900 text-white rounded-xl p-6 flex flex-col">
          <h2 className="font-bold text-lg mb-6">Calculation Preview</h2>

          <div className="flex-1 space-y-6">
            <div>
              <p className="text-xs uppercase text-slate-400">Estimated Total Cost</p>
              <p className="text-4xl font-black mt-1">$450,000.00</p>
            </div>

            <PreviewRow label="Est. OT Cost" value="$12,400.00"  />
            <PreviewRow label="Est. Deductions" value="-$8,250.00" />
            <PreviewRow label="Salary Range" value="$3.2k – $12.5k" />
          </div>

          <p className="text-xs text-slate-400 mt-6 italic">
            * Estimates are based on current attendance records.
          </p>
        </section>
      </div>

      {/* ===== ACTION ===== */}
      <div className="flex justify-end">
        <button
          onClick={() => setRunning(true)}
          className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-3 shadow-lg"
        >
          <span className="material-symbols-outlined">play_circle</span>
          Run Payroll Calculation
        </button>
      </div>

      {/* ===== RUNNING STATE ===== */}
      {running && <RunningOverlay onAbort={() => setRunning(false)} />}
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex justify-between items-center">
      <div>
        <p className="text-xs uppercase text-slate-500">{title}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
      <span className="material-symbols-outlined text-green-500">
        check_circle
      </span>
    </div>
  );
}

function Check({ label }) {
  return (
    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
      <input type="checkbox" defaultChecked className="accent-primary" />
      <span className="font-medium">{label}</span>
    </label>
  );
}

function Radio({ checked, onClick, title, desc }) {
  return (
    <label
      onClick={onClick}
      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer mb-3 ${
        checked ? "bg-primary/5 border-primary" : "hover:bg-slate-50"
      }`}
    >
      <input type="radio" checked={checked} readOnly />
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </label>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-white/10 pb-2">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function RunningOverlay({ onAbort }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border shadow-2xl rounded-2xl p-4 w-[600px] flex items-center gap-4 z-50">
      <span className="material-symbols-outlined animate-spin text-primary">
        sync
      </span>

      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="font-bold">Engine active...</span>
          <span className="text-xs text-slate-500">Step 2 of 4</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full">
          <div className="h-full w-[45%] bg-primary rounded-full" />
        </div>
      </div>

      <button
        onClick={onAbort}
        className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg"
      >
        ABORT
      </button>
    </div>
  );
}
