import React from "react";

export default function LifecycleTab() {
  return (
    <div className="mt-6">
      <div className="bg-white rounded-xl border shadow-sm">
        {/* ===== HEADER ===== */}
        <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="font-bold flex items-center gap-2 text-lg">
            <span className="material-symbols-outlined text-primary text-[24px]">
              history_edu
            </span>
            Lifecycle History
          </h3>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                search
              </span>
              <input
                className="w-full bg-slate-100 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-primary/20"
                placeholder="Search events..."
              />
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg font-bold text-xs hover:bg-slate-200">
              <span className="material-symbols-outlined text-[16px]">
                filter_list
              </span>
              Filter
            </button>
          </div>
        </div>

        {/* ===== TIMELINE ===== */}
        <div className="p-8">
          <div className="space-y-0">
            <TimelineItem
              icon="edit_document"
              color="blue"
              title="Contract Extended"
              date="Oct 16, 2024"
              description="Employment contract (CT-10293) extended for another 24 months until Oct 31, 2026."
              actor="Admin Jane Doe"
            />

            <TimelineItem
              icon="trending_up"
              color="purple"
              title="Promoted to Senior Product Designer"
              date="Jan 01, 2024"
              description="Promoted from Junior to Senior level following annual performance review Q4 2023."
              actor="System Workflow"
            />

            <TimelineItem
              icon="payments"
              color="amber"
              title="Salary Adjustment"
              date="Oct 12, 2023"
              description="Adjusted to Tier 3 (Design Ops) as part of company-wide market adjustment."
              actor="Finance Admin"
            />

            <TimelineItem
              icon="verified_user"
              color="green"
              title="Passed Probation"
              date="Jan 01, 2022"
              description="Successfully completed 3-month probation period and transitioned to Official contract."
              actor="HR Manager Sarah"
            />

            <TimelineItem
              icon="login"
              color="indigo"
              title="Joined Company"
              date="Oct 12, 2021"
              description="Onboarded as Junior Product Designer on a Probation contract."
              actor="System"
              last
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function TimelineItem({
  icon,
  color,
  title,
  date,
  description,
  actor,
  last,
}) {
  return (
    <div className={`relative flex gap-6 ${!last ? "pb-12" : ""}`}>
      {!last && (
        <span className="absolute left-6 top-14 bottom-0 w-[2px] bg-slate-200" />
      )}

      <div
        className={`relative z-10 w-12 h-12 rounded-xl border flex items-center justify-center
          bg-${color}-50 border-${color}-100 text-${color}-600`}
      >
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-1 gap-2">
          <h4 className="text-base font-bold">{title}</h4>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {date}
          </span>
        </div>

        <p className="text-sm text-slate-500 mb-3">{description}</p>

        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span className="material-symbols-outlined text-[14px]">
            person_check
          </span>
          <span>Performed by: {actor}</span>
        </div>
      </div>
    </div>
  );
}
