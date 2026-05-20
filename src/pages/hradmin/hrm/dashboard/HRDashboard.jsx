import { useEffect, useState } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function buildLineChartPath(dataPoints) {
  if (!dataPoints.length) {
    return "";
  }

  const maxValue = Math.max(...dataPoints, 1);
  const stepX = dataPoints.length > 1 ? 100 / (dataPoints.length - 1) : 100;

  return dataPoints
    .map((value, index) => {
      const x = Number((index * stepX).toFixed(2));
      const y = Number((90 - (value / maxValue) * 60).toFixed(2));
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function buildLineChartPoints(dataPoints) {
  if (!dataPoints.length) {
    return [];
  }

  const maxValue = Math.max(...dataPoints, 1);
  const stepX = dataPoints.length > 1 ? 100 / (dataPoints.length - 1) : 100;

  return dataPoints.map((value, index) => ({
    x: Number((index * stepX).toFixed(2)),
    y: Number((90 - (value / maxValue) * 60).toFixed(2)),
  }));
}

function KpiCard({ title, value, icon, iconClassName, badge, badgeClassName, badgeIcon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`size-10 rounded-xl flex items-center justify-center ${iconClassName}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className={`text-xs font-bold flex items-center gap-1 ${badgeClassName}`}>
          {badgeIcon ? (
            <span className="material-symbols-outlined text-sm">
              {badgeIcon}
            </span>
          ) : null}
          {badge}
        </span>
      </div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-extrabold mt-1">{value}</h3>
    </div>
  );
}

function KpiSection({ dashboard }) {
  const kpiItems = [
    {
      title: "Total Employees",
      value: dashboard?.totalEmployees ?? 0,
      icon: "groups",
      iconClassName: "bg-blue-50 text-blue-600",
      badge: "12%",
      badgeClassName: "text-green-600",
      badgeIcon: "trending_up",
    },
    {
      title: "New / Resigned / Inactive",
      value: (
        <>
          {dashboard?.newEmployee ?? 0} <span className="text-lg text-slate-300">/</span>{" "}
          <span className="text-red-500 text-2xl">{dashboard?.resignedEmployees ?? 0}</span> <span className="text-lg text-slate-300">/</span>{" "}
          <span className="text-amber-600 text-2xl">{dashboard?.inactiveEmployees ?? 0}</span>
        </>
      ),
      icon: "person_add_disabled",
      iconClassName: "bg-indigo-50 text-indigo-600",
      badge: "This Month",
      badgeClassName: "text-slate-500",
    },
    {
      title: "Late / Vắng (Absent)",
      value: (
        <>
          {dashboard?.lateEmployees ?? 0} <span className="text-lg text-slate-300">/</span>{" "}
          <span className="text-amber-600 text-2xl">{dashboard?.absentEmployees ?? 0}</span>
        </>
      ),
      icon: "alarm_on",
      iconClassName: "bg-amber-50 text-amber-600",
      badge: "+4%",
      badgeClassName: "text-red-500",
      badgeIcon: "warning",
    },
    {
      title: "OT Hours",
      value: `${dashboard?.otHours ?? 0}h`,
      icon: "more_time",
      iconClassName: "bg-emerald-50 text-emerald-600",
      badge: "Cumulative",
      badgeClassName: "text-slate-500",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiItems.map((item) => (
        <KpiCard key={item.title} {...item} />
      ))}
    </section>
  );
}

function StaffFluctuationSection({ linechart }) {
  const chartData = linechart?.linesData?.[0];
  const months = chartData?.timelines || [];
  const dataPoints = chartData?.datas || [];
  const path = buildLineChartPath(dataPoints);
  const points = buildLineChartPoints(dataPoints);

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">
          {linechart?.title || "Staff Fluctuation Over Time"}
        </h2>
        <select className="text-xs border rounded-lg py-1 px-3 bg-slate-50">
          <option>Last 6 Months</option>
          <option>Last Year</option>
        </select>
      </div>

      <div className="h-64 relative chart-grid">
        <svg
          className="absolute inset-0 w-full h-full px-4 pt-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {path ? (
            <path
              d={path}
              fill="none"
              stroke="#137fec"
              strokeWidth="2"
            />
          ) : null}
          {points.map((point, index) => (
            <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="2" fill="#137fec" />
          ))}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-6">
          {months.map((month) => (
            <span
              key={month}
              className="text-[10px] text-slate-400 font-bold uppercase"
            >
              {month}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function OtDepartmentBar({ name, value, width }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs font-bold mb-1">
        <span>{name}</span>
        <span>{value}</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full">
        <div className="bg-primary h-full rounded-full" style={{ width }} />
      </div>
    </div>
  );
}

function OtDepartmentSection({ categoryChart }) {
  const categories = categoryChart?.categoriesData || [];
  const maxValue = Math.max(...categories.map((item) => item.value || 0), 1);

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">{categoryChart?.title || "OT by Department (Hours)"}</h2>
        <button className="text-xs text-primary font-bold">
          View Details
        </button>
      </div>

      {categories.map((item) => (
        <OtDepartmentBar
          key={item.label}
          name={item.label}
          value={`${item.value}h`}
          width={`${((item.value || 0) / maxValue) * 100}%`}
        />
      ))}
    </div>
  );
}

function FlightRiskCard() {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border mb-4">
      <div className="flex justify-between mb-3">
        <h3 className="text-xs font-bold uppercase">
          Employee Flight Risk
        </h3>
        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">
          High Alert
        </span>
      </div>

      <p className="text-xs text-slate-600">
        AI detected a significant drop in engagement over the last 3
        weeks.
      </p>

      <button className="mt-4 w-full py-2 border rounded-lg text-xs font-bold">
        Schedule Retention Meeting
      </button>
    </div>
  );
}

function AttendanceInsightCard() {
  return (
    <div className="p-4 bg-amber-50 rounded-xl border mb-4">
      <p className="text-xs font-bold mb-2 text-amber-700">
        Attendance Anomaly
      </p>
      <p className="text-xs text-amber-800 mb-3">
        Sales team recorded unusual OT patterns this Tuesday.
      </p>
      <div className="flex gap-2">
        <button className="flex-1 py-1.5 bg-amber-600 text-white rounded-lg text-[10px] font-bold">
          Verify Logs
        </button>
        <button className="flex-1 py-1.5 bg-white border rounded-lg text-[10px] font-bold">
          Dismiss
        </button>
      </div>
    </div>
  );
}

function HiringPredictionCard() {
  return (
    <div className="p-4 bg-blue-50 rounded-xl border">
      <p className="text-xs font-bold mb-2 text-blue-700">
        Hiring Prediction
      </p>
      <p className="text-xs text-blue-800">
        You’ll need <strong>3 more Backend Devs</strong> by Q1.
      </p>
    </div>
  );
}

function AiInsightsSection() {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="size-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined">auto_awesome</span>
        </div>
        <h2 className="text-xl font-bold">AI Insights</h2>
      </div>

      <FlightRiskCard />
      <AttendanceInsightCard />
      <HiringPredictionCard />
    </div>
  );
}

export default function HRDashboard() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const request = async () => {
      if (!token) {
        console.log("Không tìm thấy token");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/hradmin/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("dashboard response", data);
      setDashboard(data);
    };

    request();
  }, []);

  return (
    <div className="space-y-8">
      <KpiSection dashboard={dashboard} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <StaffFluctuationSection linechart={dashboard?.linechart} />
          <OtDepartmentSection categoryChart={dashboard?.categoryChart} />
        </div>

        <div className="space-y-6">
          <AiInsightsSection />
        </div>
      </section>
    </div>
  );
}