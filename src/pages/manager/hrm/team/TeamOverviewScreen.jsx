import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { fetchWorkloadDistribution, fetchTeamLeaveBalance, fetchLineManagerDashboard } from "../../../../utils/managerApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

export default function TeamOverviewScreen() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7);
  const [weeklyTrend, setWeeklyTrend] = useState(null);
  const [trendLoading, setTrendLoading] = useState(false);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("all");

  // V2 Dashboard data
  const [v2Data, setV2Data] = useState(null);
  const [v2Loading, setV2Loading] = useState(true);
  const [v2Error, setV2Error] = useState(null);

  useEffect(() => {
    fetchTeamOverview();
  }, []);

  useEffect(() => {
    fetchWeeklyTrend();
  }, [trendDays]);

  useEffect(() => {
    setV2Loading(true);
    setV2Error(null);
    fetchLineManagerDashboard()
      .then(setV2Data)
      .catch((e) => setV2Error(e.message))
      .finally(() => setV2Loading(false));
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
      setWeeklyTrend(result.weeklyTrend);
      console.log("team overview: " + JSON.stringify(result));
    } catch (error) {
      console.error("Failed to fetch team overview:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyTrend = async () => {
    try {
      if (!localStorage.getItem('token')) {
        return;
      }
      setTrendLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/manager/weekly-trend?days=${trendDays}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      setWeeklyTrend(result);
    } catch (error) {
      console.error("Failed to fetch weekly trend:", error);
    } finally {
      setTrendLoading(false);
    }
  };

  if (loading) {
    return <TeamOverviewSkeleton />;
  }

  if (!data) {
    return <div className="p-8 text-center text-red-500">Failed to load data</div>;
  }

  const { actionRequired, teamSnapshot, whosOut, insights } = data;

  const filteredWhosOut = leaveTypeFilter === "all"
    ? whosOut
    : whosOut.filter(person => person.leaveType.toLowerCase().includes(leaveTypeFilter.toLowerCase()));

  return (
    <div className="space-y-8 mx-auto w-full">

      {/* ================= V2 DASHBOARD SECTIONS ================= */}
      <TeamOverviewKpiCard data={v2Data?.teamOverview} loading={v2Loading} error={v2Error} />
      <AttendanceAnalyticsSection data={v2Data?.attendanceAnalytics} loading={v2Loading} />
      <PendingApprovalsSection data={v2Data?.pendingApprovals} loading={v2Loading} navigate={navigate} />
      <AlertsInsightsSection data={v2Data?.alertsInsights} loading={v2Loading} navigate={navigate} />

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
            navigate={navigate}
            navigateTo="leave-requests"
          />

          <ActionCard
            icon="more_time"
            color="orange"
            value={actionRequired.pendingOTCount}
            title="Pending OT Requests"
            desc="Requires manager review"
            action="Approve"
            navigate={navigate}
            navigateTo="ot-requests"
          />

          <ActionCard
            icon="running_with_errors"
            color="primary"
            value={actionRequired.attendanceIssueCount}
            title="Attendance Issue Today"
            desc={actionRequired.attendanceIssueCount > 0 ? "Check log: Unplanned absence" : "No issues"}
            action={actionRequired.attendanceIssueCount > 0 ? "View Log" : null}
            navigate={navigate}
            navigateTo="team-attendance"
          />
        </div>
      </section>

      {/* ================= TEAM SNAPSHOT ================= */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SnapshotCard icon="group" label="Team Size" value={teamSnapshot.teamSize} />
          <SnapshotCard icon="flight_takeoff" label="On Leave" value={teamSnapshot.onLeave} />
          <SnapshotCard icon="event_busy" label="Absent" value={teamSnapshot.absent} />
          <SnapshotCard icon="home_work" label="Remote" value={teamSnapshot.remote} />
        </div>
      </section>

      {/* ================= WORKLOAD DISTRIBUTION ================= */}
      <WorkloadCard navigate={navigate} />

      {/* ================= LEAVE BALANCE SUMMARY ================= */}
      <LeaveBalanceCard navigate={navigate} />

      {/* ================= TRENDS + WHO'S OUT ================= */}
      <div className={`grid gap-8 ${trendDays === 30 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>

        {/* Weekly Attendance Trends */}
        <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Weekly Attendance Trends
            </h2>
            <select
              className="text-xs border-none bg-slate-50 dark:bg-slate-800 rounded py-1 px-2 font-bold focus:ring-0"
              value={trendDays}
              onChange={(e) => setTrendDays(parseInt(e.target.value))}
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>

          {trendLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : weeklyTrend && weeklyTrend.dailyData ? (
            <>
              <div className="flex flex-col gap-2">
                {/* Bars container */}
                <div className="flex items-end justify-between h-48 gap-2 px-2 relative">
                  {/* Average line */}
                  {weeklyTrend.avgRate > 0 && (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-dashed border-amber-500 z-10"
                      style={{
                        bottom: `${weeklyTrend.avgRate}%`
                      }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">
                        Avg: {weeklyTrend.avgRate}%
                      </span>
                    </div>
                  )}

                  {weeklyTrend.dailyData.map((day, i) => {
                    const rate = day.rate || day.attendanceRate || day.attendance || 0;
                    const containerHeight = 192; // h-48 = 192px
                    const barHeight = (rate / 100) * containerHeight;
                    const bgColor = day.weekend
                      ? "bg-slate-200 dark:bg-slate-700"
                      : day.today
                        ? "bg-primary"
                        : "bg-primary/30";

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center group relative" style={{ height: containerHeight }}>
                        {/* Tooltip on hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg">
                          <div className="font-bold">{day.dayLabel}</div>
                          <div>Attendance: {day.rate}%</div>
                        </div>

                        {/* Spacer to push bar to bottom */}
                        <div className="flex-1" />

                        {/* Bar */}
                        <div
                          className={`w-3/4 rounded-t-sm transition-all duration-500 ease-out hover:opacity-80 ${bgColor} ${barHeight === 0 ? 'min-h-[4px]' : ''}`}
                          style={{ height: `${barHeight}px` }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Day labels row */}
                <div className="flex justify-between gap-2 px-2">
                  {weeklyTrend.dailyData.map((day, i) => (
                    <span key={i} className={`flex-1 text-center text-[10px] font-bold ${day.today ? 'text-primary' : 'text-slate-400'}`}>
                      {day.dayLabel}
                    </span>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded" />
                  <span>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary/30 rounded" />
                  <span>Regular Day</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                  <span>Weekend</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-1 border-t-2 border-dashed border-amber-500" />
                  <span>Average</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#e7edf3] dark:border-slate-800 flex justify-end items-center">
                <div className="text-right">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className={`text-sm font-bold flex items-center gap-1 justify-end ${weeklyTrend.status === "Healthy" ? "text-emerald-500" :
                    weeklyTrend.status === "At Risk" ? "text-red-500" :
                      "text-orange-500"
                    }`}>
                    <span className="material-symbols-outlined text-sm">
                      {weeklyTrend.status === "Healthy" ? "check_circle" : weeklyTrend.status === "At Risk" ? "warning" : "info"}
                    </span>
                    {weeklyTrend.status}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-500 text-xs">
              No trend data available
            </div>
          )}
        </section>

        {/* Who's Out */}
        <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Who's Out (Next 3 Days)
            </h2>
            <div className="flex items-center gap-3">
              <select
                className="text-xs border-none bg-slate-50 dark:bg-slate-800 rounded py-1 px-2 font-bold focus:ring-0"
                value={leaveTypeFilter}
                onChange={(e) => setLeaveTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="sick">Sick</option>
                <option value="annual">Annual</option>
                <option value="vacation">Vacation</option>
              </select>
              <button className="text-xs font-bold text-primary hover:underline">
                View Calendar
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {filteredWhosOut.map((person, i) => (
              <WhoOutItem
                key={i}
                name={person.name}
                info={`${formatRelativeDate(person.daysUntilLeave)} • ${person.leaveType}`}
                badge={formatDurationBadge(person.durationDays, person.endDate)}
                badgeColor={getBadgeColor(person.leaveType)}
                avatar={person.avatarUrl}
                employeeId={person.employeeId}
                navigate={navigate}
              />
            ))}
            {filteredWhosOut.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">
                {whosOut.length === 0 ? "No one on leave in the next 3 days" : "No matching leave types"}
              </p>
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

function formatRelativeDate(daysUntilLeave) {
  if (daysUntilLeave === null || daysUntilLeave === undefined) return "Unknown";
  if (daysUntilLeave === 0) return "Today";
  if (daysUntilLeave === 1) return "Tomorrow";
  if (daysUntilLeave === 2) return "In 2 days";
  return `In ${daysUntilLeave} days`;
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

function ActionCard({ icon, color, badge, value, title, desc, action, navigate, navigateTo }) {
  const colorMap = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    primary: "bg-primary",
  };

  const handleClick = () => {
    if (navigate && navigateTo) {
      navigate(`/manager/${navigateTo}`);
    }
  };

  return (
    <div
      className="bg-white dark:bg-slate-900 border rounded-xl p-5 flex flex-col justify-between hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
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
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
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

function WhoOutItem({ name, info, badge, badgeColor, avatar, employeeId, navigate }) {
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

  const handleClick = () => {
    if (navigate && employeeId) {
      navigate(`/manager/profile/${employeeId}`);
    }
  };

  return (
    <div
      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      onClick={handleClick}
    >
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

/* ================= WORKLOAD DISTRIBUTION CARD ================= */

const LEVEL_CONFIG = {
  HEALTHY:         { bar: "bg-green-400",  text: "text-green-700 dark:text-green-400",   pill: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",   ring: "ring-green-200 dark:ring-green-800",   bg: "bg-green-50 dark:bg-green-900/10" },
  MODERATE:        { bar: "bg-amber-400",  text: "text-amber-700 dark:text-amber-400",   pill: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",   ring: "ring-amber-200 dark:ring-amber-800",   bg: "bg-amber-50 dark:bg-amber-900/10" },
  OVERLOADED:      { bar: "bg-red-500",    text: "text-red-700 dark:text-red-400",       pill: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",           ring: "ring-red-200 dark:ring-red-800",       bg: "bg-red-50 dark:bg-red-900/10" },
  NEEDS_ATTENTION: { bar: "bg-purple-400", text: "text-purple-700 dark:text-purple-400", pill: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400", ring: "ring-purple-200 dark:ring-purple-800", bg: "bg-purple-50 dark:bg-purple-900/10" },
};

const HEALTH_STATUS_CONFIG = {
  HEALTHY:          { label: "Team Healthy",     dot: "bg-green-500",  badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  AT_RISK:          { label: "At Risk",           dot: "bg-amber-500",  badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  CRITICAL:         { label: "Critical",          dot: "bg-red-500",    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  ATTENTION_NEEDED: { label: "Needs Attention",   dot: "bg-purple-500", badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  NO_TEAM:          { label: "No Team Data",      dot: "bg-slate-400",  badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
};

function getPeriodDates(days) {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - days);
  return {
    periodStart: start.toISOString().split("T")[0],
    periodEnd: today.toISOString().split("T")[0],
  };
}

function WorkloadCard({ navigate }) {
  const [days, setDays] = useState(30);
  const [wlData, setWlData] = useState(null);
  const [wlLoading, setWlLoading] = useState(true);
  const [wlError, setWlError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback((d) => {
    setWlLoading(true);
    setWlError(null);
    setSelectedId(null);
    const { periodStart, periodEnd } = getPeriodDates(d);
    fetchWorkloadDistribution(periodStart, periodEnd)
      .then(setWlData)
      .catch((e) => setWlError(e.message))
      .finally(() => setWlLoading(false));
  }, []);

  useEffect(() => { load(days); }, [days, load]);

  const healthCfg = HEALTH_STATUS_CONFIG[wlData?.teamHealthStatus] ?? HEALTH_STATUS_CONFIG.HEALTHY;
  const sorted = [...(wlData?.employeeWorkloads ?? [])].sort((a, b) => b.workloadScore - a.workloadScore);
  const selectedMember = sorted.find((m) => m.employeeId === selectedId);

  return (
    <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Workload Distribution</h2>
          {wlData && (
            <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${healthCfg.badge}`}>
              <span className={`size-1.5 rounded-full ${healthCfg.dot}`} />
              {healthCfg.label}
            </span>
          )}
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="text-xs border-none bg-slate-50 dark:bg-slate-800 rounded py-1 px-2 font-bold focus:ring-0"
        >
          <option value={7}>Last 7 Days</option>
          <option value={14}>Last 14 Days</option>
          <option value={30}>Last 30 Days</option>
        </select>
      </div>

      {/* ── Loading ── */}
      {wlLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}

      {/* ── Error ── */}
      {wlError && !wlLoading && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <span className="material-symbols-outlined text-base">error</span>
          {wlError}
          <button onClick={() => load(days)} className="ml-auto underline font-bold">Retry</button>
        </div>
      )}

      {/* ── Content ── */}
      {!wlLoading && !wlError && wlData && (
        <>
          {/* Summary pills + avg */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {wlData.healthyCount > 0    && <WlPill count={wlData.healthyCount}         label="Healthy"          level="HEALTHY" />}
            {wlData.moderateCount > 0   && <WlPill count={wlData.moderateCount}        label="Moderate"         level="MODERATE" />}
            {wlData.overloadedCount > 0 && <WlPill count={wlData.overloadedCount}      label="Overloaded"       level="OVERLOADED" />}
            {wlData.needsAttentionCount > 0 && <WlPill count={wlData.needsAttentionCount} label="Needs Attention" level="NEEDS_ATTENTION" />}
            <div className="ml-auto text-right">
              <span className="text-[10px] text-slate-400 block">Team avg score</span>
              <span className="text-lg font-black text-slate-700 dark:text-slate-300">{wlData.teamAverageWorkload}<span className="text-xs font-normal text-slate-400">/100</span></span>
            </div>
          </div>

          {/* Bar chart */}
          {sorted.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No team members found.</p>
          ) : (
            <div className="space-y-1.5">
              {sorted.map((m) => (
                <WorkloadBar
                  key={m.employeeId}
                  member={m}
                  isSelected={selectedId === m.employeeId}
                  onClick={() => setSelectedId(selectedId === m.employeeId ? null : m.employeeId)}
                />
              ))}
            </div>
          )}

          {/* Score guide */}
          <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-400">
            <span>Score guide:</span>
            {Object.entries({ "0–40 Healthy": "HEALTHY", "41–70 Moderate": "MODERATE", "71+ Overloaded": "OVERLOADED" }).map(([label, lvl]) => (
              <span key={lvl} className="flex items-center gap-1">
                <span className={`size-2.5 rounded-sm ${LEVEL_CONFIG[lvl].bar}`} />{label}
              </span>
            ))}
          </div>

          {/* Drill-down panel */}
          {selectedId && selectedMember && (
            <DrillDownPanel
              member={selectedMember}
              navigate={navigate}
              onClose={() => setSelectedId(null)}
            />
          )}

          {/* Footer link */}
          <div className="mt-4 pt-4 border-t border-[#e7edf3] dark:border-slate-800 flex justify-end">
            <button
              onClick={() => navigate("/manager/workload-distribution")}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              Full Workload Visualizer
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function WlPill({ count, label, level }) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.HEALTHY;
  return (
    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${cfg.pill}`}>
      <span className="text-sm font-black leading-none">{count}</span>{label}
    </span>
  );
}

function WorkloadBar({ member, isSelected, onClick }) {
  const cfg = LEVEL_CONFIG[member.workloadLevel] ?? LEVEL_CONFIG.HEALTHY;
  const score = Math.min(Math.max(member.workloadScore ?? 0, 0), 100);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg px-3 py-2.5 transition-all duration-150
        ${isSelected
          ? `${cfg.bg} ring-1 ring-inset ${cfg.ring}`
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        {/* Avatar */}
        {member.avatarUrl ? (
          <div className="size-6 rounded-full bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${member.avatarUrl})` }} />
        ) : (
          <div className="size-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary font-bold text-[10px]">
            {member.fullName?.charAt(0)}
          </div>
        )}
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">{member.fullName}</span>
        <span className={`text-[10px] font-bold hidden sm:block ${cfg.text}`}>{member.workloadLevel}</span>
        <span className="text-xs font-black text-slate-600 dark:text-slate-400 w-7 text-right tabular-nums">{score.toFixed(0)}</span>
        <span className="material-symbols-outlined text-slate-300 text-sm">{isSelected ? "expand_less" : "expand_more"}</span>
      </div>
      {/* Bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${cfg.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </button>
  );
}

function DrillDownPanel({ member, navigate, onClose }) {
  const cfg = LEVEL_CONFIG[member.workloadLevel] ?? LEVEL_CONFIG.HEALTHY;
  const metrics = [
    { icon: "more_time",        label: "OT Hours",          value: `${member.otHours}h`,               sub: "Approved overtime" },
    { icon: "pending_actions",  label: "Pending Requests",  value: member.pendingRequests,             sub: "Awaiting approval" },
    { icon: "event_available",  label: "Leave Utilized",    value: `${member.leaveUtilizationRate}%`,  sub: "Of annual quota" },
    { icon: "schedule",         label: "Work Duration",     value: `${member.workDurationHours}h`,     sub: "Logged in period" },
    { icon: "person_off",       label: "Late Arrivals",     value: member.lateFrequency,               sub: "Days late" },
  ];

  return (
    <div className={`mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4 ${cfg.bg}`}>
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {member.avatarUrl ? (
            <div className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: `url(${member.avatarUrl})` }} />
          ) : (
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {member.fullName?.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{member.fullName}</p>
            <p className={`text-[10px] font-bold ${cfg.text}`}>
              {member.workloadLevel} · Workload Score: <span className="font-black">{member.workloadScore}</span>/100
            </p>
          </div>
        </div>
        <button onClick={onClose} className="size-7 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>Workload Score</span>
          <span className="font-bold">{member.workloadScore}/100</span>
        </div>
        <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${Math.min(member.workloadScore, 100)}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 mt-1">
          <span>0 Healthy</span><span>40 Moderate</span><span>70 Overloaded</span><span>100</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white/70 dark:bg-slate-900/60 rounded-lg p-2.5">
            <div className="flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-slate-400 text-sm">{m.icon}</span>
              <span className="text-[10px] text-slate-500">{m.label}</span>
            </div>
            <p className="text-lg font-black text-slate-800 dark:text-slate-200 leading-none">{m.value}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      {member.recommendation && (
        <div className="flex items-start gap-2 p-3 bg-white/60 dark:bg-slate-900/50 rounded-lg mb-3">
          <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">tips_and_updates</span>
          <p className="text-xs text-slate-600 dark:text-slate-400">{member.recommendation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/manager/profile/${member.employeeId}`)}
          className="flex-1 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">person</span>
          View Profile
        </button>
        <button
          onClick={() => navigate(`/manager/team-calendar`)}
          className="flex-1 py-2 text-xs font-bold text-primary bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          View Calendar
        </button>
      </div>
    </div>
  );
}

/* ================= LEAVE BALANCE SUMMARY CARD ================= */

const LB_STATUS_CONFIG = {
  HEALTHY:    { bar: "bg-green-400",  text: "text-green-700 dark:text-green-400",    pill: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",    ring: "ring-green-200 dark:ring-green-800",    bg: "bg-green-50 dark:bg-green-900/10",    icon: "check_circle" },
  WARNING:    { bar: "bg-amber-400",  text: "text-amber-700 dark:text-amber-400",    pill: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",    ring: "ring-amber-200 dark:ring-amber-800",    bg: "bg-amber-50 dark:bg-amber-900/10",    icon: "warning" },
  DEPLETED:   { bar: "bg-red-500",    text: "text-red-700 dark:text-red-400",        pill: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",            ring: "ring-red-200 dark:ring-red-800",        bg: "bg-red-50 dark:bg-red-900/10",        icon: "block" },
  NO_BALANCE: { bar: "bg-slate-300",  text: "text-slate-500 dark:text-slate-400",    pill: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",       ring: "ring-slate-200 dark:ring-slate-700",    bg: "bg-slate-50 dark:bg-slate-800/30",    icon: "help_outline" },
};

function LeaveBalanceCard({ navigate }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [lbData, setLbData] = useState(null);
  const [lbLoading, setLbLoading] = useState(true);
  const [lbError, setLbError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback((y) => {
    setLbLoading(true);
    setLbError(null);
    setSelectedId(null);
    fetchTeamLeaveBalance(y)
      .then(setLbData)
      .catch((e) => setLbError(e.message))
      .finally(() => setLbLoading(false));
  }, []);

  useEffect(() => { load(year); }, [year, load]);

  const sorted = [...(lbData?.members ?? [])].sort((a, b) => a.remainingPct - b.remainingPct);
  const selectedMember = sorted.find((m) => m.employeeId === selectedId);
  const utilPct = lbData?.teamUtilizationPct ?? 0;

  return (
    <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">event_available</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Team Leave Balance</h2>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="text-xs border-none bg-slate-50 dark:bg-slate-800 rounded py-1 px-2 font-bold focus:ring-0"
        >
          <option value={currentYear - 1}>{currentYear - 1}</option>
          <option value={currentYear}>{currentYear}</option>
        </select>
      </div>

      {lbLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin size-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      {lbError && !lbLoading && (
        <div className="flex items-center gap-2 text-red-600 text-xs p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <span className="material-symbols-outlined text-base">error</span>
          {lbError}
          <button onClick={() => load(year)} className="ml-auto underline font-bold">Retry</button>
        </div>
      )}

      {!lbLoading && !lbError && lbData && (
        <>
          {/* Summary pills */}
          <div className="flex flex-wrap gap-2 items-center mb-4">
            {lbData.healthyCount > 0    && <LbPill count={lbData.healthyCount}    label="Healthy"     status="HEALTHY" />}
            {lbData.warningCount > 0    && <LbPill count={lbData.warningCount}    label="Low Balance"  status="WARNING" />}
            {lbData.depletedCount > 0   && <LbPill count={lbData.depletedCount}   label="Depleted"    status="DEPLETED" />}
            {lbData.noBalanceCount > 0  && <LbPill count={lbData.noBalanceCount}  label="No Record"   status="NO_BALANCE" />}
            <div className="ml-auto text-right">
              <span className="text-[10px] text-slate-400 block">Team remaining</span>
              <span className="text-lg font-black text-slate-700 dark:text-slate-300">
                {lbData.teamTotalRemaining}<span className="text-xs font-normal text-slate-400"> days</span>
              </span>
            </div>
          </div>

          {/* Team utilization bar */}
          <div className="mb-5 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
              <span>Team Utilization ({year})</span>
              <span className="font-bold">{lbData.teamTotalUsed}d used / {lbData.teamTotalEntitled}d entitled</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${utilPct >= 80 ? "bg-red-500" : utilPct >= 50 ? "bg-amber-400" : "bg-green-400"}`}
                style={{ width: `${Math.min(utilPct, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-400 mt-1">
              <span>0%</span>
              <span className="font-bold">{utilPct}% used</span>
              <span>100%</span>
            </div>
          </div>

          {/* Member list — sorted worst first (lowest remainingPct) */}
          {sorted.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No team members found.</p>
          ) : (
            <div className="space-y-1.5">
              {sorted.map((m) => (
                <MemberLeaveBar
                  key={m.employeeId}
                  member={m}
                  isSelected={selectedId === m.employeeId}
                  onClick={() => setSelectedId(selectedId === m.employeeId ? null : m.employeeId)}
                />
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-[10px] text-slate-400">
            <span>Status:</span>
            {[["HEALTHY", "≥30% remaining"], ["WARNING", "<30% remaining"], ["DEPLETED", "0 days left"], ["NO_BALANCE", "Not configured"]].map(([s, label]) => (
              <span key={s} className="flex items-center gap-1">
                <span className={`size-2.5 rounded-sm ${LB_STATUS_CONFIG[s].bar}`} />{label}
              </span>
            ))}
          </div>

          {/* Drill-down */}
          {selectedId && selectedMember && (
            <LeaveBreakdownPanel
              member={selectedMember}
              navigate={navigate}
              onClose={() => setSelectedId(null)}
            />
          )}
        </>
      )}
    </section>
  );
}

function LbPill({ count, label, status }) {
  const cfg = LB_STATUS_CONFIG[status] ?? LB_STATUS_CONFIG.HEALTHY;
  return (
    <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${cfg.pill}`}>
      <span className="text-sm font-black leading-none">{count}</span>{label}
    </span>
  );
}

function MemberLeaveBar({ member, isSelected, onClick }) {
  const cfg = LB_STATUS_CONFIG[member.healthStatus] ?? LB_STATUS_CONFIG.HEALTHY;
  const remainingPct = Math.min(Math.max(member.remainingPct ?? 0, 0), 100);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg px-3 py-2.5 transition-all duration-150
        ${isSelected
          ? `${cfg.bg} ring-1 ring-inset ${cfg.ring}`
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
    >
      <div className="flex items-center gap-2.5 mb-1.5">
        {member.avatarUrl ? (
          <div className="size-6 rounded-full bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${member.avatarUrl})` }} />
        ) : (
          <div className="size-6 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary font-bold text-[10px]">
            {member.fullName?.charAt(0)}
          </div>
        )}
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">{member.fullName}</span>
        <span className={`text-[10px] font-bold hidden sm:flex items-center gap-0.5 ${cfg.text}`}>
          <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
          {member.healthStatus === "NO_BALANCE" ? "No Record" : member.healthStatus}
        </span>
        <span className="text-xs font-black text-slate-600 dark:text-slate-400 tabular-nums">
          {member.healthStatus === "NO_BALANCE" ? "—" : `${member.totalRemaining}d`}
        </span>
        <span className="material-symbols-outlined text-slate-300 text-sm">{isSelected ? "expand_less" : "expand_more"}</span>
      </div>
      {/* Remaining % bar */}
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${cfg.bar}`}
          style={{ width: `${remainingPct}%` }}
        />
      </div>
    </button>
  );
}

function leaveTypeColor(leaveType) {
  const t = (leaveType || "").toLowerCase();
  if (t.includes("annual") || t.includes("vacation")) return { bar: "bg-blue-400", text: "text-blue-600 dark:text-blue-400", badge: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" };
  if (t.includes("sick"))                              return { bar: "bg-rose-400",  text: "text-rose-600 dark:text-rose-400",  badge: "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400" };
  if (t.includes("maternity") || t.includes("parental")) return { bar: "bg-pink-400", text: "text-pink-600 dark:text-pink-400", badge: "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400" };
  if (t.includes("unpaid"))                            return { bar: "bg-slate-400", text: "text-slate-600 dark:text-slate-400", badge: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" };
  if (t.includes("marriage") || t.includes("wedding")) return { bar: "bg-purple-400", text: "text-purple-600 dark:text-purple-400", badge: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" };
  return { bar: "bg-teal-400", text: "text-teal-600 dark:text-teal-400", badge: "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400" };
}

function LeaveBreakdownPanel({ member, navigate, onClose }) {
  const cfg = LB_STATUS_CONFIG[member.healthStatus] ?? LB_STATUS_CONFIG.HEALTHY;
  const breakdowns = member.breakdowns ?? [];

  return (
    <div className={`mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4 ${cfg.bg}`}>
      {/* ── Panel header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {member.avatarUrl ? (
            <div className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm" style={{ backgroundImage: `url(${member.avatarUrl})` }} />
          ) : (
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {member.fullName?.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{member.fullName}</p>
            <p className={`text-[10px] font-bold flex items-center gap-1 ${cfg.text}`}>
              <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
              {member.healthStatus === "NO_BALANCE"
                ? "No leave balance configured this year"
                : `${member.remainingPct}% overall remaining · ${member.totalRemaining}d left`}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="size-7 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500">
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      {/* ── Per-leave-type breakdown ── */}
      {breakdowns.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">No leave balance configured for this year.</p>
      ) : (
        <div className="space-y-2 mb-4">
          {/* Column header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 px-2 text-[9px] font-bold uppercase text-slate-400 tracking-wider">
            <span>Leave Type</span>
            <span className="text-right w-10">Entitled</span>
            <span className="text-right w-10">Used</span>
            <span className="text-right w-10">Pending</span>
            <span className="text-right w-12">Remaining</span>
          </div>

          {breakdowns.map((b, i) => {
            const lc = leaveTypeColor(b.leaveType);
            const pct = Math.min(Math.max(b.remainingPct ?? 0, 0), 100);
            return (
              <div key={i} className="bg-white/70 dark:bg-slate-900/60 rounded-lg p-3">
                {/* Row top: name + numbers */}
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-3 items-center mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`size-2 rounded-full flex-shrink-0 ${lc.bar}`} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{b.policyName}</span>
                    {b.leaveType && (
                      <span className={`hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${lc.badge}`}>
                        {b.leaveType}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 text-right w-10 tabular-nums">{b.entitled}d</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 text-right w-10 tabular-nums">{b.used}d</span>
                  <span className="text-xs text-amber-600 dark:text-amber-400 text-right w-10 tabular-nums">{b.pending > 0 ? `${b.pending}d` : "—"}</span>
                  <span className={`text-xs font-black text-right w-12 tabular-nums ${b.remaining <= 0 ? "text-red-600 dark:text-red-400" : "text-slate-800 dark:text-slate-200"}`}>
                    {b.remaining}d
                  </span>
                </div>
                {/* Mini progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${lc.bar}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>0</span>
                  <span>{b.remainingPct}% remaining</span>
                  <span>{b.entitled}d</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Hints ── */}
      {member.healthStatus === "WARNING" && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-3 text-xs text-amber-700 dark:text-amber-400">
          <span className="material-symbols-outlined text-base flex-shrink-0">tips_and_updates</span>
          Consider encouraging this employee to plan their remaining leave before year-end.
        </div>
      )}
      {member.healthStatus === "DEPLETED" && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-3 text-xs text-red-700 dark:text-red-400">
          <span className="material-symbols-outlined text-base flex-shrink-0">warning</span>
          Leave balance is fully depleted. Any new leave requests will require special approval.
        </div>
      )}

      <button
        onClick={() => navigate(`/manager/profile/${member.employeeId}`)}
        className="w-full py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
      >
        <span className="material-symbols-outlined text-sm">person</span>
        View Full Profile
      </button>
    </div>
  );
}

/* ================= V2 DASHBOARD COMPONENTS ================= */

function TeamOverviewKpiCard({ data, loading, error }) {
  if (loading) {
    return (
      <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">groups</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Team Overview</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">groups</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Team Overview</h2>
        </div>
        <p className="text-xs text-red-600">{error}</p>
      </section>
    );
  }
  if (!data) return null;

  const kpis = [
    { icon: "group", label: "Total Employees", value: data.totalEmployees, color: "text-blue-600" },
    { icon: "check_circle", label: "Present Today", value: data.presentToday, color: "text-green-600" },
    { icon: "flight_takeoff", label: "On Leave", value: data.onLeave, color: "text-amber-600" },
    { icon: "schedule", label: "Late Arrivals", value: data.lateArrivals, color: "text-red-600" },
    { icon: "person_add", label: "New Hires", value: data.newHiresThisMonth, color: "text-purple-600" },
    { icon: "percent", label: "Attendance Rate", value: `${data.attendanceRatePct}%`, color: "text-teal-600" },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-xl">groups</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Team Overview</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="material-symbols-outlined text-slate-400 text-lg">{kpi.icon}</span>
              <span className="text-[10px] text-slate-500">{kpi.label}</span>
            </div>
            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AttendanceAnalyticsSection({ data, loading }) {
  if (loading) {
    return (
      <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">analytics</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Attendance Analytics</h2>
        </div>
        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      </section>
    );
  }
  if (!data) return null;

  const { statusDistribution, lateRanking } = data;
  const total = statusDistribution.present + statusDistribution.leave + statusDistribution.late + statusDistribution.absent + statusDistribution.remote;

  return (
    <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-xl">analytics</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Attendance Analytics</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-3">Today's Status</h3>
          <div className="space-y-2">
            {[
              { label: "Present", value: statusDistribution.present, color: "bg-green-400" },
              { label: "Remote", value: statusDistribution.remote, color: "bg-blue-400" },
              { label: "Late", value: statusDistribution.late, color: "bg-amber-400" },
              { label: "On Leave", value: statusDistribution.leave, color: "bg-purple-400" },
              { label: "Absent", value: statusDistribution.absent, color: "bg-red-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`size-3 rounded-full ${item.color}`} />
                <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{item.label}</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
                <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: total > 0 ? `${(item.value / total) * 100}%` : "0%" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Late Arrival Ranking */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 mb-3">Late Arrival Ranking (30 days)</h3>
          {lateRanking.length === 0 ? (
            <p className="text-xs text-slate-400">No late arrivals in the last 30 days.</p>
          ) : (
            <div className="space-y-2">
              {lateRanking.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-xs font-bold text-slate-400 w-4">#{i + 1}</span>
                  {item.avatarUrl ? (
                    <div className="size-6 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${item.avatarUrl})` }} />
                  ) : (
                    <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                      {item.fullName?.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">{item.fullName}</span>
                  <span className="text-xs font-bold text-amber-600">{item.lateCount}x</span>
                  <span className="text-[10px] text-slate-400">{item.totalLateMinutes}m</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PendingApprovalsSection({ data, loading, navigate }) {
  if (loading) {
    return (
      <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">pending_actions</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Pending Approvals</h2>
        </div>
        <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      </section>
    );
  }
  if (!data) return null;

  const items = [
    { icon: "flight_takeoff", label: "Leave Requests", count: data.pendingLeave, color: "bg-purple-100 text-purple-700", link: "/manager/requests?status=pending&type=leave" },
    { icon: "more_time", label: "OT Requests", count: data.pendingOT, color: "bg-amber-100 text-amber-700", link: "/manager/requests?status=pending&type=ot" },
    { icon: "edit_note", label: "Adjustment Requests", count: data.pendingAdjustment, color: "bg-blue-100 text-blue-700", link: "/manager/requests?status=pending&type=adjustment" },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">pending_actions</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Pending Approvals</h2>
          {data.totalPending > 0 && (
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{data.totalPending} pending</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => navigate(item.link)}
            className={`p-4 rounded-lg ${item.color} hover:opacity-80 transition-opacity text-left`}
          >
            <span className="material-symbols-outlined text-lg mb-1">{item.icon}</span>
            <p className="text-2xl font-black">{item.count}</p>
            <p className="text-xs font-semibold">{item.label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function AlertsInsightsSection({ data, loading, navigate }) {
  if (loading) {
    return (
      <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Alerts & Insights</h2>
        </div>
        <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
      </section>
    );
  }
  if (!data) return null;

  const { probationExpiryAlerts, contractExpiryAlerts } = data;
  const hasAlerts = probationExpiryAlerts.length > 0 || contractExpiryAlerts.length > 0;

  return (
    <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Alerts & Insights</h2>
        {hasAlerts && (
          <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
            {probationExpiryAlerts.length + contractExpiryAlerts.length} alerts
          </span>
        )}
      </div>
      {!hasAlerts ? (
        <p className="text-xs text-slate-400">No upcoming alerts for your team.</p>
      ) : (
        <div className="space-y-3">
          {probationExpiryAlerts.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-amber-600 mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">school</span>
                Probation Expiry (30 days)
              </h3>
              <div className="space-y-2">
                {probationExpiryAlerts.map((alert, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    {alert.avatarUrl ? (
                      <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${alert.avatarUrl})` }} />
                    ) : (
                      <div className="size-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xs">
                        {alert.fullName?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{alert.fullName}</p>
                      <p className="text-[10px] text-slate-500">Expires: {alert.alertDate}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600">{alert.daysRemaining}d left</span>
                    <button
                      onClick={() => navigate(`/manager/profile/${alert.employeeId}`)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {contractExpiryAlerts.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">description</span>
                Contract Expiry (60 days)
              </h3>
              <div className="space-y-2">
                {contractExpiryAlerts.map((alert, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {alert.avatarUrl ? (
                      <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${alert.avatarUrl})` }} />
                    ) : (
                      <div className="size-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                        {alert.fullName?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{alert.fullName}</p>
                      <p className="text-[10px] text-slate-500">Expires: {alert.alertDate}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600">{alert.daysRemaining}d left</span>
                    <button
                      onClick={() => navigate(`/manager/profile/${alert.employeeId}`)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/* ================= SKELETON LOADING ================= */

function TeamOverviewSkeleton() {
  return (
    <div className="space-y-8 mx-auto w-full">
      {/* Action Required Skeleton */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-5 w-16 bg-red-200 dark:bg-red-900/30 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="size-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </section>

      {/* Team Snapshot Skeleton */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="size-10 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                <div className="h-5 w-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trends + Who's Out Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="flex items-end justify-between h-32 gap-3 px-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-t-sm animate-pulse" style={{ height: `${Math.random() * 80 + 20}%` }} />
                <div className="h-3 w-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-[#e7edf3] dark:border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className="size-8 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                  <div>
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
                    <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* AI Insights Skeleton */}
      <section className="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="size-5 bg-primary/30 rounded animate-pulse" />
          <div className="h-4 w-48 bg-primary/30 rounded animate-pulse" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-white/60 dark:bg-slate-900/40 rounded-lg border border-primary/10 mb-4">
            <div className="size-5 bg-primary/30 rounded animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-1" />
              <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        ))}
      </section>
    </div>
  );
}
