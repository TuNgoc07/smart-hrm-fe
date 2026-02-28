import { useNavigate } from "react-router-dom";

export default function TeamOverviewScreen() {
    const navigate = useNavigate();
    return (
      <div className="space-y-8 mx-auto w-full">
  
        {/* ================= ACTION REQUIRED ================= */}
        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            Action Required
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
              Urgent
            </span>
          </h2>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              icon="event_busy"
              color="red"
              badge="Due Today"
              value="3"
              title="Pending Leave Requests"
              desc="2 expiring soon"
              action="Review Now"
            />
  
            <ActionCard
              icon="more_time"
              color="orange"
              value="2"
              title="Pending OT Requests"
              desc="Requires manager review"
              action="Approve"
            />
  
            <ActionCard
              icon="running_with_errors"
              color="primary"
              value="1"
              title="Attendance Issue Today"
              desc="Check log: Unplanned absence"
              action="View Log"
            />
          </div>
        </section>
  
        {/* ================= TEAM SNAPSHOT ================= */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SnapshotCard icon="group" label="Team Size" value="12" />
            <SnapshotCard icon="flight_takeoff" label="On Leave" value="2" />
            <SnapshotCard icon="schedule" label="Late" value="1" />
            <SnapshotCard icon="home_work" label="Remote" value="3" />
          </div>
        </section>
  
        {/* ================= TRENDS + WHO'S OUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  
          {/* Weekly Attendance Trends */}
          <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Weekly Attendance Trends
              </h2>
              <select className="text-xs border-none bg-slate-50 dark:bg-slate-800 rounded py-1 px-2 font-bold focus:ring-0">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
  
            <div className="flex items-end justify-between h-32 gap-3 px-2">
              {[
                { day: "Mon", h: "60%" },
                { day: "Tue", h: "80%" },
                { day: "Wed", h: "95%", active: true },
                { day: "Thu", h: "70%" },
                { day: "Fri", h: "85%" },
                { day: "Sat", h: "20%", off: true },
                { day: "Sun", h: "20%", off: true },
              ].map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-sm ${
                      d.off
                        ? "bg-slate-100 dark:bg-slate-800"
                        : d.active
                        ? "bg-primary"
                        : "bg-primary/20"
                    }`}
                    style={{ height: d.h }}
                  />
                  <span className="text-[10px] font-bold text-slate-400">
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
  
            <div className="mt-6 pt-6 border-t border-[#e7edf3] dark:border-slate-800 flex justify-between">
              <div>
                <p className="text-xs text-slate-500">Avg. Rate</p>
                <p className="text-xl font-black">94.2%</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Status</p>
                <p className="text-sm font-bold text-green-500 flex items-center gap-1 justify-end">
                  <span className="material-symbols-outlined text-sm">
                    trending_up
                  </span>
                  Healthy
                </p>
              </div>
            </div>
          </section>
  
          {/* Who's Out */}
          <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Who's Out (Next 3 Days)
              </h2>
              <button className="text-xs font-bold text-primary hover:underline">
                View Calendar
              </button>
            </div>
  
            <div className="space-y-4">
              <WhoOutItem
                name="Sarah Johnson"
                info="Today • Sick Leave"
                badge="Until Thu"
                badgeColor="red"
                avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuAm-gzG0f95cAL-xyOuM5gArUW9VZwK5XyaX1AM4WCiy43OeFG7LG9ETHdA4o0XpW4125pU2Mto1RJULoix-uQh2Czp5X0ISyQhq0lnmQgEn3O6tR10DhFJKp-KTzKZuJtt6O--bIh8vic8f865KFOXCKiQBA3Ip4pNk7-4llIk8IlsEcCRf6GiGD32QGOPkgRx07eR3HJS9MzNn77oIaI3_s90_JvBg702yGLWIidf5rqAcIf2VtvqM67x_4yGMCugmkqF8mB47cg"
              />
  
              <WhoOutItem
                name="Mike Chen"
                info="Tomorrow • Annual Leave"
                badge="1 Day"
                badgeColor="orange"
                avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuC0Mn1snkXPG3aFGf3zUudD2CiFAUtGw1IXLWkWL8ASuDKAIRwQIJG7u5V8BFFo7Ovv0zdCjyCtNZhfecXy14itOyyMJqXymuoFKGBzza9mPb8UM3NtYilRE-e97o7cGxVJqjJKcpcj2xUHWEWGmNSgYckA2P2BTXABycrk8vFsIvLfc8E9BqLWEsGgREoESkuxSPMqUoeDg_i_7kgSQd1Gc5NqnS_g1jHMgqYmpefBzxqCytrTpWAx1sl8izW9D3DJJBTRCkD3zTc"
              />
  
              <WhoOutItem
                name="Emily Davis"
                info="Oct 24 • Personal"
                badge="2 Days"
                badgeColor="gray"
                avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuDglZtzWEG1AQ6bya4SnHix8sw-RqiwjVli7Mg9Oz_MJdjjUzOpk_4HusDWB49OTUUIJLfT2im6-IVEy3pOGC5LfaSsxyMEHFZe3xq0JCtXi56y7ZPNHqdanthK4oiHOUXaB0uqkH4Daaycjk6-DexrxbK1WKk-Mv4TnJLPCfwh6wmvRNauMQ-_CRvyWdp46tfJ8Yl39JfPUsaDe-BX_uWR3QuStbiTu95zr9-UzVOatcD7puuIdmSp7csOURLE5QrUfEH_JGrxDQA"
              />
            </div>
          </section>
        </div>
  
        {/* ================= AI INSIGHTS ================= */}
        <section className="bg-primary/5 border border-primary/20 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary">
              psychology
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
              AI Team Insights
            </h2>
          </div>
  
          <AIInsight
            icon="warning"
            iconColor="text-orange-500"
            title="Team OT increased by 35%"
            desc="Overtime hours are trending higher than last month. Review workload distribution for the Sprint 4 project."
            action="View Breakdown"
          />
  
          <AIInsight
            icon="person_alert"
            iconColor="text-red-500"
            title="1 Employee with High Attrition Risk"
            desc="Sentiment analysis and activity patterns suggest an engagement dip. Consider a 1:1 check-in."
            action="See Candidate"
          />
  
          <AIInsight
            icon="analytics"
            iconColor="text-orange-500"
            title="Attendance Pattern Anomaly"
            desc="Increased late clock-ins detected on Mondays over the last 3 weeks."
            action="View Data"
          />
        </section>
  
        {/* ================= FOOTER ================= */}
        <footer className="pt-8 pb-12">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <FooterBtn icon="event_available" label="View Team Attendance" linkto={navigate} act="team-attendance" />
            <FooterBtn icon="contacts" label="View Team Members" linkto={navigate} act="team-members"/>
            <FooterBtn icon="history" label="View Approval History" linkto={navigate} act="approval-history"/>
          </div>
  
          <p className="text-center text-[10px] text-slate-400 mt-8 uppercase tracking-widest">
            Powered by Smart Enterprise Operations v4.2.0
          </p>
        </footer>
      </div>
    );
  }
  
  /* ================= COMPONENTS ================= */
  
  function ActionCard({ icon, color, badge, value, title, desc, action }) {
    const colorMap = {
      red: "bg-red-500",
      orange: "bg-orange-500",
      primary: "bg-primary",
    };
  
    return (
      <div className="bg-white dark:bg-slate-900 border rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div
            className={`size-12 rounded-lg flex items-center justify-center ${
              color === "red"
                ? "bg-red-50 text-red-500"
                : color === "orange"
                ? "bg-orange-50 text-orange-500"
                : "bg-primary/10 text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[32px]">
              {icon}
            </span>
          </div>
          {badge && (
            <span className="bg-red-50 text-red-600 text-[10px] px-2 py-1 rounded font-bold uppercase">
              {badge}
            </span>
          )}
        </div>
  
        <div>
          <p className="text-3xl font-black">{value}</p>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </div>
  
        <button
          className={`mt-4 w-full py-2 text-white rounded-lg text-xs font-bold hover:opacity-90 ${colorMap[color]}`}
        >
          {action}
        </button>
      </div>
    );
  }
  
  function SnapshotCard({ icon, label, value }) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
        <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    );
  }
  
  function WhoOutItem({ name, info, badge, badgeColor, avatar }) {
    const badgeStyle =
      badgeColor === "red"
        ? "bg-red-100 text-red-600"
        : badgeColor === "orange"
        ? "bg-orange-100 text-orange-600"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800";
  
    return (
      <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
        <div className="flex items-center gap-3">
          <div
            className="size-8 rounded-full bg-slate-200 bg-cover"
            style={{ backgroundImage: `url(${avatar})` }}
          />
          <div>
            <p className="text-xs font-bold">{name}</p>
            <p className="text-[10px] text-slate-500">{info}</p>
          </div>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeStyle}`}
        >
          {badge}
        </span>
      </div>
    );
  }
  
  function AIInsight({ icon, iconColor, title, desc, action }) {
    return (
      <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-slate-900/40 rounded-lg border border-primary/10 mb-4">
        <span className={`material-symbols-outlined mt-0.5 ${iconColor}`}>
          {icon}
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-slate-500 mt-1">{desc}</p>
        </div>
        <button className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-md">
          {action}
        </button>
      </div>
    );
  }
  
  function FooterBtn({ icon, label, linkto , act}) {
    return (
      <button
      onClick = {() => linkto(`/manager/${act}`)} 
      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
        <span className="material-symbols-outlined text-sm">{icon}</span>
        {label}
      </button>
    );
  }
  