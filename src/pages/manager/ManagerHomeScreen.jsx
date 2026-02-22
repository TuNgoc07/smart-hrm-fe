export default function ManagerHomeScreen() {
  return (
    <div className="flex flex-col gap-8">

      {/* ===== QUICK STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Team Size"
          icon="groups"
          value="12"
          trend="+2 this month"
        />
        <StatCard
          title="Active Jobs Assigned"
          icon="work"
          value="4"
          subtitle="On track for Q3"
        />
        <StatCard
          title="Interviews This Week"
          icon="event_available"
          value="8"
          trend="+15% vs last week"
        />
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ===== LEFT COLUMN ===== */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Pending Actions */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#0d141b] dark:text-white text-xl font-bold tracking-tight">
              Pending Actions
            </h3>
            <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-bold">
              3 Urgent
            </span>
          </div>

          <div className="bg-white dark:bg-[#1a2632] rounded-xl border border-[#cfdbe7] dark:border-slate-800 overflow-hidden divide-y divide-[#cfdbe7] dark:divide-slate-800">
            <ActionItem
              icon="quick_reference_all"
              title="Review CV: Senior Frontend Developer"
              desc="4 new applications received today"
              action="Review Now"
            />
            <ActionItem
              icon="rate_review"
              title="Submit Feedback: Jane Smith"
              desc="Interviewed 2 hours ago • Product Manager"
              action="Complete"
            />
            <ActionItem
              icon="gavel"
              title="Final Decision: Backend Engineer"
              desc="2 candidates reached final stage"
              action="Decide"
            />
          </div>

          {/* Recent Activity */}
          <div className="mt-4">
            <h3 className="text-[#0d141b] dark:text-white text-xl font-bold tracking-tight mb-4">
              Recent Activity
            </h3>

            <div className="flex flex-col gap-4">
              <TimelineItem
                active
                title="New application received for Lead Designer"
                meta="Sarah Connor • 15 minutes ago"
              />
              <TimelineItem
                title="Interview scheduled with Marcus Aurelius"
                meta="Backend Engineer • 45 minutes ago"
              />
              <TimelineItem
                last
                title="Job 'Customer Success Manager' went live"
                meta="Internal • 2 hours ago"
              />
            </div>
          </div>
        </div>

        {/* ===== RIGHT COLUMN ===== */}
        <div className="flex flex-col gap-6">

          {/* Quick Access */}
          <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#cfdbe7] dark:border-slate-800">
            <h4 className="text-[#0d141b] dark:text-white text-sm font-bold uppercase tracking-wider mb-4">
              Quick Access
            </h4>

            <div className="grid gap-3">
              <QuickLink icon="diversity_3" label="Team Performance" />
              <QuickLink icon="hub" label="ATS Pipeline View" />
              <QuickLink icon="description" label="Hiring Guidelines" />
            </div>
          </div>

          {/* Team Focus */}
          <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-xl text-white shadow-lg overflow-hidden relative">
            <div className="relative z-10">
              <h4 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-4">
                Current Focus
              </h4>
              <p className="text-xl font-bold mb-2">
                Build the Next Generation Engineering Team
              </p>
              <p className="text-sm opacity-90 mb-6">
                You've successfully filled 3 positions out of 6 targets this quarter.
              </p>
              <button className="w-full py-2.5 bg-white text-primary rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">
                View Q3 Goals
              </button>
            </div>

            <div className="absolute -right-8 -bottom-8 opacity-20">
              <span className="material-symbols-outlined text-[120px]">
                architecture
              </span>
            </div>
          </div>

          {/* Today Interviews */}
          <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#cfdbe7] dark:border-slate-800">
            <h4 className="text-[#0d141b] dark:text-white text-sm font-bold uppercase tracking-wider mb-4">
              Today's Interviews
            </h4>

            <div className="flex flex-col gap-4">
              <InterviewItem
                title="Interview: Tim Drake"
                time="14:00 - 15:00 • Video Call"
              />
              <InterviewItem
                title="Feedback: Barbara G."
                time="16:30 - 17:00 • In-Person"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */

function StatCard({ title, icon, value, trend, subtitle }) {
  return (
    <div className="bg-white dark:bg-[#1a2632] p-6 rounded-xl border border-[#cfdbe7] dark:border-slate-800 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <p className="text-[#4c739a] text-sm font-semibold uppercase tracking-wider">
          {title}
        </p>
        <span className="material-symbols-outlined text-primary">
          {icon}
        </span>
      </div>

      <p className="text-[#0d141b] dark:text-white text-3xl font-black">
        {value}
      </p>

      {trend && (
        <div className="flex items-center gap-1.5 text-[#078838] text-sm font-bold">
          <span className="material-symbols-outlined text-[16px]">
            trending_up
          </span>
          <span>{trend}</span>
        </div>
      )}

      {subtitle && (
        <p className="text-[#4c739a] text-sm font-medium">{subtitle}</p>
      )}
    </div>
  );
}

function ActionItem({ icon, title, desc, action }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <div className="bg-[#e7edf3] dark:bg-slate-700 p-3 rounded-lg text-primary">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-[#0d141b] dark:text-white font-bold">
          {title}
        </p>
        <p className="text-[#4c739a] text-sm">{desc}</p>
      </div>
      <button className="px-4 py-2 bg-[#e7edf3] dark:bg-slate-700 text-sm font-bold rounded-lg hover:bg-primary hover:text-white transition-all">
        {action}
      </button>
    </div>
  );
}

function TimelineItem({ title, meta, active, last }) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div
          className={`size-2.5 rounded-full mt-2 ${
            active ? "bg-primary" : "bg-slate-300"
          }`}
        />
        {!last && (
          <div className="w-0.5 grow bg-[#cfdbe7] dark:bg-slate-800 my-1" />
        )}
      </div>
      <div>
        <p className="text-sm font-bold text-[#0d141b] dark:text-white">
          {title}
        </p>
        <p className="text-xs text-[#4c739a]">{meta}</p>
      </div>
    </div>
  );
}

function QuickLink({ icon, label }) {
  return (
    <a
      href="#"
      className="flex items-center justify-between p-3 rounded-lg border border-[#cfdbe7] dark:border-slate-700 hover:border-primary transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">
          {icon}
        </span>
        <span className="text-sm font-bold text-[#0d141b] dark:text-white">
          {label}
        </span>
      </div>
      <span className="material-symbols-outlined text-slate-300">
        chevron_right
      </span>
    </a>
  );
}

function InterviewItem({ title, time }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 min-w-[50px]">
        <span className="text-xs font-bold text-primary uppercase">Oct</span>
        <span className="text-lg font-black">24</span>
      </div>
      <div>
        <p className="text-sm font-bold text-[#0d141b] dark:text-white">
          {title}
        </p>
        <p className="text-xs text-[#4c739a]">{time}</p>
      </div>
    </div>
  );
}
