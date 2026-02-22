import { useState } from "react";

export default function AttendanceAdjustModal({ data, onClose }) {
  const [action, setAction] = useState("manual");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">

      {/* MODAL */}
      <div className="bg-white w-full max-w-[720px] rounded-xl shadow-2xl overflow-hidden border">

        {/* HEADER */}
        <div className="px-8 py-5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Attendance Adjustment</h2>
            <p className="text-sm text-slate-500">
              {data.name} • {data.date}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">

          {/* EMPLOYEE INFO */}
          <Section title="Employee Information">
            <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border">
              <Info label="Name" value={data.name} />
              <Info label="Code" value={data.empId} />
              <Info label="Department" value={data.department || "—"} />
              <Info label="Schedule" value="General (08:00 - 17:00)" />
            </div>
          </Section>

          {/* ORIGINAL DATA */}
          <Section title="Original System Data">
            <div className="flex gap-4">
              <SystemBox
                icon="login"
                label="Check-in"
                value={data.checkIn}
                color="primary"
              />
              <SystemBox
                icon="logout"
                label="Check-out"
                value={data.checkOut === "MISSING" ? "-- (Missing)" : data.checkOut}
                color="red"
              />
              <SystemBox
                icon="warning"
                label="Current Status"
                value={data.status.toUpperCase()}
                color="amber"
              />
            </div>
          </Section>

          {/* ACTION */}
          <Section title="Adjustment Action">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Radio
                checked={action === "manual"}
                onChange={() => setAction("manual")}
                label="Manual Time Adjustment"
                active
              />
              <Radio label="Mark as Leave" />
              <Radio label="Mark as Absent" />
              <Radio label="Resolve Sync Error" />
            </div>

            {/* TIME INPUT */}
            {action === "manual" && (
              <div className="grid grid-cols-2 gap-4">
                <TimeInput label="Adjusted Check-in" defaultValue="08:05" />
                <TimeInput label="Adjusted Check-out" defaultValue="17:05" />
              </div>
            )}
          </Section>

          {/* IMPACT */}
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-6">
            <Impact
              title="Total Hours"
              before="0h"
              after="8.5h"
            />
            <Impact
              title="Payroll Impact"
              after="No OT"
            />
          </div>

          {/* REASON */}
          <Section>
            <label className="block text-sm font-bold mb-2">
              Reason for Adjustment <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full h-24 rounded-lg border p-3 text-sm focus:ring-primary focus:border-primary"
              placeholder="Forgotten punch-out, system issue..."
            />
          </Section>

          {/* CONFIRM */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 rounded text-primary" />
            <div>
              <p className="font-bold text-sm">
                I confirm this adjustment is correct
              </p>
              <p className="text-xs text-slate-500">
                Used for payroll & audit records
              </p>
            </div>
          </label>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 bg-slate-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border text-slate-500 font-bold text-sm hover:bg-white"
          >
            Cancel
          </button>

          <button
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-blue-600 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              save
            </span>
            Save Adjustment
          </button>
        </div>

      </div>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <section>
      {title && (
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase text-slate-500 font-bold">
        {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function SystemBox({ icon, label, value, color }) {
  const colors = {
    primary: "text-primary",
    red: "text-red-500",
    amber: "text-amber-500",
  };

  return (
    <div className="flex-1 p-3 border rounded-lg flex items-center gap-3">
      <span className={`material-symbols-outlined ${colors[color]}`}>
        {icon}
      </span>
      <div>
        <p className="text-[10px] uppercase text-slate-500 font-bold">
          {label}
        </p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

function Radio({ label, checked, onChange, active }) {
  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
        checked || active
          ? "border-primary bg-primary/5"
          : "hover:bg-slate-50"
      }`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="text-primary"
      />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}

function TimeInput({ label, defaultValue }) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2">
        {label}
      </label>
      <input
        type="time"
        defaultValue={defaultValue}
        className="w-full rounded-lg border p-2 focus:ring-primary focus:border-primary"
      />
    </div>
  );
}

function Impact({ title, before, after }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-blue-600">
        {title}
      </p>
      <div className="flex items-center gap-2 text-sm">
        {before && <span className="line-through text-slate-400">Before: {before}</span>}
        {after && <span className="font-bold text-blue-700">After: {after}</span>}
      </div>
    </div>
  );
}
