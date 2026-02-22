export default function HRHomeScreen () {
  return (
    <div className="space-y-8">
      {/* ===== WELCOME ===== */}
      <section className="relative overflow-hidden rounded-2xl bg-primary px-8 py-10 text-white">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <p className="text-primary-100 font-medium">
              Monday, 23 October 2023
            </p>
            <h1 className="text-4xl font-black">
              Welcome back, Nguyễn Văn A!
            </h1>
            <p className="text-white/80">
              You have 45 pending requests and 8 contracts expiring soon.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white text-primary font-bold rounded-lg shadow">
              View Reports
            </button>
            <button className="px-5 py-2.5 bg-white/20 text-white font-bold rounded-lg">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-20">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <circle
              cx="200"
              cy="200"
              r="150"
              fill="none"
              stroke="currentColor"
              strokeWidth="40"
            />
            <circle cx="200" cy="200" r="100" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Employees", value: "1,240", icon: "person", percent: "+2.5%" },
          { title: "Open Jobs", value: "12", icon: "work", percent: "-1.2%" },
          { title: "Pending Requests", value: "45", icon: "pending_actions", percent: "+5.0%" },
          { title: "Expiring Contracts", value: "8", icon: "history_edu", percent: "0%" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <span className="material-symbols-outlined">
                  {item.icon}
                </span>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">
                {item.percent}
              </span>
            </div>

            <p className="text-slate-500 text-sm">{item.title}</p>
            <h3 className="text-3xl font-extrabold mt-1">{item.value}</h3>
          </div>
        ))}
      </section>

      {/* ===== MAIN GRID ===== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pending Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
  <div className="p-6 border-b flex items-center justify-between">
    <h2 className="text-xl font-bold">Pending Actions</h2>
    <button className="text-primary font-bold text-sm">View All</button>
  </div>

  <div className="divide-y">
    {[
      {
        title: "Leave Request - John Doe",
        desc: "Requested 2 days (Annual Leave)",
        time: "2h ago",
        icon: "person",
        bg: "bg-emerald-100 text-emerald-600",
      },
      {
        title: "CV Review - Jane Smith",
        desc: "Applied for Senior UI Designer",
        time: "5h ago",
        icon: "description",
        bg: "bg-slate-100 text-slate-500",
      },
      {
        title: "Payroll Approval - October 2023",
        desc: "Final verification required",
        time: "Yesterday",
        icon: "receipt_long",
        bg: "bg-indigo-100 text-indigo-600",
      },
    ].map((item, i) => (
      <div
        key={i}
        className="p-6 flex items-center justify-between hover:bg-slate-50"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg}`}
          >
            <span className="material-symbols-outlined text-sm">
              {item.icon}
            </span>
          </div>

          <div>
            <p className="font-bold">{item.title}</p>
            <p className="text-sm text-slate-500">
              {item.desc} • {item.time}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary/10 text-primary">
            Review
          </button>
          <button className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-500">
            Skip
          </button>
        </div>
      </div>
    ))}
  </div>
</div>


          {/* Quick Access */}
          <div className="space-y-4">
  <h2 className="text-xl font-bold">Quick Access</h2>

  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { label: "New Employee", icon: "person_add" },
      { label: "Post Job", icon: "post_add" },
      { label: "Run Payroll", icon: "payments" },
      { label: "Attendance", icon: "calendar_today" },
    ].map((item, i) => (
      <button
        key={i}
        className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-primary/50 transition text-center"
      >
        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition">
          <span className="material-symbols-outlined">
            {item.icon}
          </span>
        </div>
        <span className="text-sm font-bold">{item.label}</span>
      </button>
    ))}
  </div>
</div>

        </div>

        {/* RIGHT */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
  <h2 className="text-xl font-bold mb-6">Recent Activity</h2>

  <div className="relative pl-6 space-y-8">
    <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-100"></div>

    {[
      {
        title: "Onboarding Completed",
        desc: "5 new hires finalized their profiles",
        time: "15 minutes ago",
        color: "bg-green-500",
      },
      {
        title: "New Candidate Applied",
        desc: "Applied for UI Designer role",
        time: "2 hours ago",
        color: "bg-blue-500",
      },
      {
        title: "Leave Approved",
        desc: "Manager approved Mark's request",
        time: "Yesterday",
        color: "bg-amber-500",
      },
      {
        title: "System Maintenance",
        desc: "Payroll module updated successfully",
        time: "Yesterday",
        color: "bg-slate-400",
      },
      {
        title: "Contract Alert",
        desc: "David's contract expires in 7 days",
        time: "Oct 21, 2023",
        color: "bg-red-500",
      },
    ].map((item, i) => (
      <div key={i} className="relative">
        <div
          className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full ${item.color}`}
        ></div>

        <p className="font-bold text-sm">{item.title}</p>
        <p className="text-xs text-slate-500">{item.desc}</p>
        <span className="text-[10px] uppercase font-bold text-slate-400">
          {item.time}
        </span>
      </div>
    ))}
  </div>

  <button className="mt-6 w-full py-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-500 hover:text-primary">
    See full log
  </button>
</div>

      </section>
    </div>
  );
}
