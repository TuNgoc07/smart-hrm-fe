import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function TeamOverviewScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamOverview();
  }, []);

  const fetchTeamOverview = async () => {

    try {
      if (!localStorage.getItem('token')) {
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/manager/team-overview`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      setData(result);
      console.log("team overview: " + JSON.stringify(result));
    } catch (error) {
      console.error("Failed to fetch team overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load data</div>;
  }

  const { actionRequired, teamSnapshot, weeklyTrend, whosOut, insights } = data;

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
            badge={actionRequired.urgentLeaveCount > 0 ? "Due Today" : null}
            value={actionRequired.pendingLeaveCount}
            title="Pending Leave Requests"
            desc={actionRequired.urgentLeaveCount > 0 ? `${actionRequired.urgentLeaveCount} expiring soon` : "Requires review"}
            action="Review Now"
          />

          <ActionCard
            icon="more_time"
            color="orange"
            value={actionRequired.pendingOTCount}
            title="Pending OT Requests"
            desc="Requires manager review"
            action="Approve"
          />

          <ActionCard
            icon="running_with_errors"
            color="primary"
            value={actionRequired.attendanceIssueCount}
            title="Attendance Issue Today"
            desc={actionRequired.attendanceIssueCount > 0 ? "Check log: Unplanned absence" : "No issues"}
            action={actionRequired.attendanceIssueCount > 0 ? "View Log" : null}
          />
        </div>
      </section>

      {/* ================= TEAM SNAPSHOT ================= */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SnapshotCard icon="group" label="Team Size" value={teamSnapshot.teamSize} />
          <SnapshotCard icon="flight_takeoff" label="On Leave" value={teamSnapshot.onLeave} />
          <SnapshotCard icon="schedule" label="Late" value={teamSnapshot.late} />
          <SnapshotCard icon="home_work" label="Remote" value={teamSnapshot.remote} />
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
            {weeklyTrend.dailyData.map((day, i) => {
              const maxRate = Math.max(...weeklyTrend.dailyData.map(d => d.rate), 1);
              const scaledHeight = maxRate > 0 ? (day.rate / maxRate) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-sm ${day.weekend
                      ? "bg-slate-100 dark:bg-slate-800"
                      : day.today
                        ? "bg-primary"
                        : "bg-primary/20"
                      }`}
                    style={{ height: `${scaledHeight}%`, minHeight: day.rate > 0 ? '4px' : '2px' }}
                  />
                  <span className="text-[10px] font-bold text-slate-400">
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-[#e7edf3] dark:border-slate-800 flex justify-between">
            <div>
              <p className="text-xs text-slate-500">Avg. Rate</p>
              <p className="text-xl font-black">{weeklyTrend.avgRate}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Status</p>
              <p className={`text-sm font-bold flex items-center gap-1 justify-end ${weeklyTrend.status === "Healthy" ? "text-green-500" :
                weeklyTrend.status === "At Risk" ? "text-red-500" :
                  "text-orange-500"
                }`}>
                <span className="material-symbols-outlined text-sm">
                  {weeklyTrend.status === "Healthy" ? "trending_up" : "trending_flat"}
                </span>
                {weeklyTrend.status}
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
            {whosOut.map((person, i) => (
              <WhoOutItem
                key={i}
                name={person.name}
                info={`${formatRelativeDate(person.startDate)} • ${person.leaveType}`}
                badge={formatDurationBadge(person.durationDays, person.endDate)}
                badgeColor={getBadgeColor(person.leaveType)}
                avatar={person.avatarUrl}
                employeeId={person.employeeId}
              />
            ))}
            {whosOut.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">No one on leave in the next 3 days</p>
            )}
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
             Team Insights by System
          </h2>
        </div>

        {insights.map((insight, i) => (
          <AIInsight
            key={i}
            icon={insight.icon}
            iconColor={insight.iconColor}
            title={insight.title}
            desc={insight.description}
            action={insight.action}
          />
        ))}
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="pt-8 pb-12">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <FooterBtn icon="event_available" label="View Team Attendance" linkto={navigate} act="team-attendance" />
          <FooterBtn icon="contacts" label="View Team Members" linkto={navigate} act="team-members" />
          <FooterBtn icon="history" label="View Approval History" linkto={navigate} act="approval-history" />
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-8 uppercase tracking-widest">
          Powered by Smart Enterprise Operations v4.2.0
        </p>
      </footer>
    </div>
  );
}

/* ================= HELPER FUNCTIONS ================= */

function formatRelativeDate(dateStr) {
  if (!dateStr) return "Unknown date";
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDurationBadge(durationDays, endDate) {
  if (!durationDays && !endDate) return "Unknown";
  if (durationDays === 1) return "1 Day";
  if (durationDays) return `${durationDays} Days`;

  const end = new Date(endDate);
  const today = new Date();
  const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return diffDays === 1 ? "Until Tomorrow" : `Until ${end.toLocaleDateString("en-US", { weekday: "short" })}`;
}

function getBadgeColor(leaveType) {
  const type = (leaveType || "").toLowerCase();
  if (type.includes("sick")) return "red";
  if (type.includes("annual") || type.includes("vacation")) return "orange";
  return "gray";
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
          className={`size-12 rounded-lg flex items-center justify-center ${color === "red"
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

      {action && (
        <button
          className={`mt-4 w-full py-2 text-white rounded-lg text-xs font-bold hover:opacity-90 ${colorMap[color]}`}
        >
          {action}
        </button>
      )}
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

function WhoOutItem({ name, info, badge, badgeColor, avatar, employeeId }) {
  const badgeStyle =
    badgeColor === "red"
      ? "bg-red-100 text-red-600"
      : badgeColor === "orange"
        ? "bg-orange-100 text-orange-600"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800";

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        {avatar ? (
          <div
            className="size-8 rounded-full bg-slate-200 bg-cover"
            style={{ backgroundImage: `url(${avatar})` }}
          />
        ) : (
          <div className="size-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
            {getInitials(name)}
          </div>
        )}
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

function FooterBtn({ icon, label, linkto, act }) {
  return (
    <button
      onClick={() => linkto(`/manager/${act}`)}
      className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors">
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </button>
  );
}
