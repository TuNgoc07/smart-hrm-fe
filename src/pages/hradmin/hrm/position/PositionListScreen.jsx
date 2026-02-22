import { useState } from "react";
import NewPositionModal from "./newPositionModal";

export default function PositionListScreen() {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto ">
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#0d141b]">
              Position Management
            </h2>
            <p className="text-[#4c739a] mt-1">
              Maintain and oversee organizational roles and hierarchical structures.
            </p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Add Position
          </button>
        </div>
        {openModal && (
            <NewPositionModal
            open = {openModal}
            onClose = {() => setOpenModal(false)}
            />
        )}

        {/* SEARCH & FILTER */}
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">
              manage_search
            </span>
            <input
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border rounded-lg text-sm focus:ring-primary focus:border-primary"
              placeholder="Search by position name or code..."
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Select options={["All Departments", "Engineering", "Product", "Design", "HR & Ops"]} />
            <Select options={["All Levels", "L1 - Junior", "L3 - Mid", "L5 - Senior", "L7 - Director"]} />
            <Select options={["All Statuses", "Active", "Inactive", "Draft"]} className="col-span-2 md:col-span-1" />
          </div>

          <button className="px-4 py-2.5 border rounded-lg flex items-center gap-2 hover:bg-slate-50">
            <span className="material-symbols-outlined">filter_list</span>
            <span className="text-sm font-bold">More</span>
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {[
                    "Position Name",
                    "Code",
                    "Department",
                    "Level",
                    "Total Emp.",
                    "Status",
                    "Actions",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className={`px-6 py-4 text-xs font-bold uppercase text-[#4c739a] ${
                        i >= 3 ? "text-center" : ""
                      } ${i === 6 ? "text-right" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y">
                <PositionRow
                  name="Senior Software Engineer"
                  code="ENG-001"
                  dept="Engineering"
                  level="L5"
                  total={12}
                  status="active"
                />
                <PositionRow
                  name="Product Manager"
                  code="PRO-042"
                  dept="Product"
                  level="L4"
                  total={8}
                  status="active"
                />
                <PositionRow
                  name="Junior UI Designer"
                  code="DES-109"
                  dept="Design"
                  level="L2"
                  total={0}
                  status="inactive"
                />
                <PositionRow
                  name="Head of Engineering"
                  code="EXE-002"
                  dept="Engineering"
                  level="L8"
                  total={1}
                  status="active"
                />
                <PositionRow
                  name="HR Specialist"
                  code="HR-101"
                  dept="HR & Ops"
                  level="L3"
                  total={4}
                  status="active"
                />
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-[#4c739a]">
              Showing <b className="text-black">1 – 5</b> of <b className="text-black">42</b> positions
            </p>

            <div className="flex items-center gap-2">
              <button disabled className="size-8 border rounded-lg opacity-30">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="size-8 bg-primary text-white rounded-lg font-bold">1</button>
              <button className="size-8 rounded-lg hover:bg-slate-100">2</button>
              <button className="size-8 rounded-lg hover:bg-slate-100">3</button>
              <span className="px-1 text-[#4c739a]">…</span>
              <button className="size-8 rounded-lg hover:bg-slate-100">9</button>
              <button className="size-8 border rounded-lg">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Positions" value="124" note="+4 this month" highlight />
          <StatCard title="Filled Roles" value="98" note="79% capacity" />
          <StatCard title="Open Positions" value="26" note="Active hiring" primary />
          <StatCard title="Department Max" value="Eng." note="45 positions" />
        </div>
      </div>
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

function Select({ options, className = "" }) {
  return (
    <select className={`bg-slate-50 border rounded-lg text-sm py-2.5 px-3 ${className}`}>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

function PositionRow({ name, code, dept, level, total, status }) {
  const active = status === "active";

  return (
    <tr className="group hover:bg-slate-50 transition-colors">
      <td className={`px-6 py-4 font-bold text-sm ${!active && "text-slate-400"}`}>
        {name}
      </td>
      <td className="px-6 py-4 text-sm text-[#4c739a] font-mono">{code}</td>
      <td className="px-6 py-4">
        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-bold">
          {dept}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span
          className={`px-3 py-1 rounded-full text-xs font-black ${
            active ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-500"
          }`}
        >
          {level}
        </span>
      </td>
      <td className="px-6 py-4 text-center text-sm font-medium">{total}</td>
      <td className="px-6 py-4">
        <span
          className={`flex items-center gap-1.5 text-xs font-bold ${
            active ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              active ? "bg-emerald-600" : "bg-slate-400"
            }`}
          />
          {active ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-lg">
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg">
            <span className="material-symbols-outlined text-lg">
              {active ? "block" : "check_circle"}
            </span>
          </button>
        </div>
      </td>
    </tr>
  );
}

function StatCard({ title, value, note, highlight, primary }) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-[#4c739a]">
        {title}
      </p>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-2xl font-black">{value}</span>
        <span
          className={`text-xs font-bold mb-1 ${
            primary ? "text-primary" : highlight ? "text-emerald-500" : "text-[#4c739a]"
          }`}
        >
          {note}
        </span>
      </div>
    </div>
  );
}
