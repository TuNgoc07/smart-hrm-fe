import React from "react";

export default function ContractTab() {
  return (
    <div className="space-y-6 mt-6">
      {/* ===== WARNING BANNER ===== */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <span className="material-symbols-outlined text-amber-600">
          warning
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800">
            Contract Expiring Soon
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            The current contract (CT-10293) is set to expire in 15 days on
            October 31, 2024. Please review and process an extension or
            transition.
          </p>
        </div>
        <button className="text-amber-700 hover:bg-amber-100 p-1 rounded">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* ===== CONTRACT OVERVIEW ===== */}
      <Card title="Contract Overview" icon="description">
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <OverviewItem
            label="Employment Status"
            value="Full-time"
            badge="Valid"
          />
          <OverviewItem
            label="Latest Contract ID"
            value="CT-10293"
          />
          <OverviewItem
            label="Effective Date"
            value="Jan 01, 2023"
          />
          <OverviewItem
            label="Salary Tier"
            value="Tier 3 (Design Ops)"
          />
        </div>
      </Card>

      {/* ===== CONTRACT HISTORY ===== */}
      <Card
        title="Contract History"
        icon="history"
        action={
          <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90">
            <span className="material-symbols-outlined text-[16px]">
              add
            </span>
            Add Contract
          </button>
        }
        noPadding
      >
        <ContractTable />
      </Card>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Card({ title, icon, action, children, noPadding }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            {icon}
          </span>
          {title}
        </h3>
        {action}
      </div>
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}

function OverviewItem({ label, value, badge }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-500 mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-lg font-extrabold">{value}</span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function ContractTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold">
            <th className="px-6 py-3 border-b text-left">Contract Type</th>
            <th className="px-6 py-3 border-b">Start Date</th>
            <th className="px-6 py-3 border-b">End Date</th>
            <th className="px-6 py-3 border-b">Status</th>
            <th className="px-6 py-3 border-b text-center">Document</th>
            <th className="px-6 py-3 border-b text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {/* ACTIVE */}
          <tr className="bg-blue-50/50 border-l-4 border-primary">
            <td className="px-6 py-4 font-bold">Fixed-term</td>
            <td className="px-6 py-4 text-slate-500">Jan 01, 2023</td>
            <td className="px-6 py-4 text-slate-500">Oct 31, 2024</td>
            <td className="px-6 py-4">
              <Status active />
            </td>
            <td className="px-6 py-4 text-center">
              <PdfButton />
            </td>
            <td className="px-6 py-4 text-right">
              <ActionButtons active />
            </td>
          </tr>

          {/* EXPIRED */}
          <ExpiredRow
            type="Official"
            start="Jan 01, 2022"
            end="Dec 31, 2022"
          />
          <ExpiredRow
            type="Probation"
            start="Oct 12, 2021"
            end="Dec 31, 2021"
          />
        </tbody>
      </table>
    </div>
  );
}

function Status({ active }) {
  return (
    <span
      className={`flex items-center gap-1.5 font-bold ${
        active ? "text-blue-600" : "text-slate-500"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? "bg-blue-600" : "bg-slate-300"
        }`}
      />
      {active ? "Active" : "Expired"}
    </span>
  );
}

function PdfButton() {
  return (
    <button className="text-red-500 hover:text-red-600">
      <span className="material-symbols-outlined">
        picture_as_pdf
      </span>
    </button>
  );
}

function ActionButtons({ active }) {
  return (
    <div className="flex justify-end gap-2">
      <button className="text-slate-500 hover:text-primary text-xs font-bold px-2 py-1 rounded">
        View
      </button>
      {active && (
        <>
          <button className="text-primary border border-primary/20 hover:bg-primary/10 text-xs font-bold px-2 py-1 rounded">
            Extend
          </button>
          <button className="text-red-500 hover:bg-red-50 text-xs font-bold px-2 py-1 rounded">
            End
          </button>
        </>
      )}
    </div>
  );
}

function ExpiredRow({ type, start, end }) {
  return (
    <tr className="border-t hover:bg-slate-50">
      <td className="px-6 py-4 font-bold">{type}</td>
      <td className="px-6 py-4 text-slate-500">{start}</td>
      <td className="px-6 py-4 text-slate-500">{end}</td>
      <td className="px-6 py-4">
        <Status />
      </td>
      <td className="px-6 py-4 text-center">
        <PdfButton />
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-slate-500 hover:text-primary text-xs font-bold px-2 py-1 rounded">
          View
        </button>
      </td>
    </tr>
  );
}
