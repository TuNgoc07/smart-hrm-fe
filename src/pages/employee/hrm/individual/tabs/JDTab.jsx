import React from "react";

export default function JobDetailsTab({ employee }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
      {/* LEFT: JOB FORM */}
      <div className="xl:col-span-2 bg-white rounded-xl border">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Job Information</h3>
          <button className="text-sm font-semibold text-primary hover:underline">
            View Job Change History
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Department" value="Product & Design" />
          <Field label="Position" value="Senior Product Designer" />
          <Field label="Job Level" value="Level 4 (Senior)" />
          <Field label="Employment Type" value="Full-time" />
          <Field label="Direct Manager" value="Le Thi B (NV1002)" />
          <Field label="Work Location" value="Head Office (HCM)" />
          <Field label="Start Date" value="10 Oct, 2021" />

          {/* Working Model */}
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-2">
              WORKING MODEL
            </label>
            <div className="flex gap-2">
              <Tag active>Onsite</Tag>
              <Tag>Hybrid</Tag>
              <Tag>Remote</Tag>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end">
          <button className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold">
            Save Changes
          </button>
        </div>
      </div>

      {/* RIGHT: AI + STATS */}
      <div className="space-y-6">
       
        <QuickStats />
      </div>
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

function QuickStats() {
  return (
    <div className="bg-white rounded-xl border p-5 grid grid-cols-2 gap-4 text-center">
      <Stat label="TENURE" value="2.4y" />
      <Stat label="PROMOTIONS" value="1" />
      <Stat label="DEPARTMENT CHANGES" value="2" />
      <Stat label="CURRENT LEVEL" value="Senior" />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 font-semibold">{label}</p>
      <p className="text-xl font-extrabold">{value}</p>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1">
        {label.toUpperCase()}
      </label>
      <div className="bg-slate-100 rounded-lg px-4 py-2.5 text-sm font-semibold">
        {value}
      </div>
    </div>
  );
}

function Tag({ children, active }) {
  return (
    <span
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer
        ${
          active
            ? "bg-primary text-white border-primary"
            : "bg-white border-slate-300 text-slate-600"
        }`}
    >
      {children}
    </span>
  );
}
