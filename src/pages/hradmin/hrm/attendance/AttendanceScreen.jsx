import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const today = new Date();
const formattedDate = today.toLocaleDateString("en-US", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function getStatusVariantClasses(statusVariant) {
  if (statusVariant === "success") {
    return "bg-emerald-100 text-emerald-600";
  }

  if (statusVariant === "warning") {
    return "bg-amber-100 text-amber-600";
  }

  if (statusVariant === "danger") {
    return "bg-rose-100 text-rose-600";
  }

  return "bg-slate-100 text-slate-600";
}

function buildOtTrendPath(otTrend = []) {
  if (!otTrend.length) {
    return "";
  }

  const width = 400;
  const height = 150;
  const maxHours = Math.max(...otTrend.map((item) => item.hours), 1);
  const stepX = otTrend.length > 1 ? width / (otTrend.length - 1) : width;

  return otTrend
    .map((item, index) => {
      const x = index * stepX;
      const y = height - (item.hours / maxHours) * 110 - 20;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

function PageHeader({ onNavigate, attendanceStats }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Attendance Dashboard</h2>
        <p className="text-slate-500">Overview for {attendanceStats?.overviewDate || formattedDate}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-white rounded-lg p-1 border">
          <button className="px-4 py-1.5 bg-primary text-white text-sm font-bold rounded-md">Today</button>
          <button className="px-4 py-1.5 text-slate-600 text-sm font-medium rounded-md">Weekly</button>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold">
          <span className="material-symbols-outlined">corporate_fare</span>
          All Departments
          <span className="material-symbols-outlined">expand_more</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold">
          <span className="material-symbols-outlined">download</span>
          Export
        </button>

        <button
          onClick={() => onNavigate("/hr/attendance/exceptions")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 rounded-lg text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          <span className="material-symbols-outlined">report_problem</span>
          Attendance Exceptions
        </button>

        <button
          onClick={() => onNavigate("/hr/attendance/records")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-blue-600 transition-colors"
        >
          <span className="material-symbols-outlined">grid_on</span>
          Attendance Records
        </button>
      </div>
    </div>
  );
}

function KpiCard({ label, icon, badge, colorClasses, value }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex justify-between mb-4">
        <div className={`size-10 rounded-lg flex items-center justify-center ${colorClasses.icon}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClasses.badge}`}>
          {badge}
        </span>
      </div>
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

function KpiSection({ attendanceStats }) {
  const summary = attendanceStats?.summary;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
      <KpiCard label="TOTAL EMPLOYEES" icon="groups" badge="Today" colorClasses={{ icon: "bg-blue-100 text-blue-600", badge: "bg-blue-50 text-blue-600" }} value={summary?.totalEmployees ?? 0} />
      <KpiCard label="CHECKED-IN" icon="how_to_reg" badge={`${summary?.checkedInRate ?? 0}% Rate`} colorClasses={{ icon: "bg-emerald-100 text-emerald-600", badge: "bg-emerald-50 text-emerald-600" }} value={summary?.checkedInEmployees ?? 0} />
      <KpiCard label="LATE" icon="history" badge="Need Review" colorClasses={{ icon: "bg-amber-100 text-amber-600", badge: "bg-amber-50 text-amber-600" }} value={summary?.lateEmployees ?? 0} />
      <KpiCard label="ABSENT" icon="person_off" badge={`${summary?.totalEmployees ? ((summary.absentEmployees / summary.totalEmployees) * 100).toFixed(1) : 0}%`} colorClasses={{ icon: "bg-rose-100 text-rose-600", badge: "bg-rose-50 text-rose-600" }} value={summary?.absentEmployees ?? 0} />
      <KpiCard label="OT HOURS" icon="hourglass_top" badge="Today" colorClasses={{ icon: "bg-indigo-100 text-indigo-600", badge: "bg-indigo-50 text-indigo-600" }} value={summary?.otHours ?? 0} />
    </div>
  );
}

function DepartmentAttendanceChart({ attendanceStats }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-bold mb-6">Attendance Status by Department</h3>

      <div className="flex items-end justify-around h-64 gap-4">
        {attendanceStats?.departmentAttendance?.map((department) => (
          <div key={department.departmentName} className="flex flex-col items-center gap-2">
            <div className="w-12 h-48 flex flex-col-reverse bg-slate-100 rounded overflow-hidden">
              <div className="bg-rose-500" style={{ height: `${department.totalCount ? (department.absentCount / department.totalCount) * 100 : 0}%` }} />
              <div className="bg-amber-400" style={{ height: `${department.totalCount ? (department.lateCount / department.totalCount) * 100 : 0}%` }} />
              <div className="bg-emerald-500" style={{ height: `${department.totalCount ? (department.presentCount / department.totalCount) * 100 : 0}%` }} />
            </div>
            <span className="text-xs text-slate-500">{department.departmentName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OtHoursTrendChart({ attendanceStats }) {
  const otTrend = attendanceStats?.otTrend || [];
  const otTrendPath = buildOtTrendPath(otTrend);
  const maxHours = Math.max(...otTrend.map((item) => item.hours), 0);

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <h3 className="text-lg font-bold mb-6">OT Hours Trend</h3>

      <svg viewBox="0 0 400 150" className="w-full h-64">
        <line x1="0" y1="130" x2="400" y2="130" stroke="#e2e8f0" strokeWidth="1" />
        {otTrend.map((item, index) => {
          const x = otTrend.length > 1 ? (index * 400) / (otTrend.length - 1) : 200;
          const y = maxHours > 0 ? 130 - (item.hours / maxHours) * 100 : 130;

          return <circle key={item.label} cx={x} cy={y} r="4" fill="#6366f1" />;
        })}
        {otTrendPath ? <path d={otTrendPath} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /> : null}
      </svg>

      <div className="flex justify-between mt-2 text-xs text-slate-400">
        {otTrend.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}

function ChartsSection({ attendanceStats }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <DepartmentAttendanceChart attendanceStats={attendanceStats} />
      <OtHoursTrendChart attendanceStats={attendanceStats} />
    </div>
  );
}

function AttendanceTable({ attendanceStats }) {
  const phase = attendanceStats?.attendancePhase;
  const snapshot = attendanceStats?.todayAttendanceSnapshot ?? [];

  return (
    <div className="xl:col-span-9 bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="p-6 border-b flex justify-between">
        <h3 className="text-lg font-bold">Today Attendance Snapshot</h3>
        <button className="text-primary font-bold text-sm">View All</button>
      </div>

      {phase === "before_shift" ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300">schedule</span>
          <p className="font-bold text-slate-600">Ca làm việc chưa bắt đầu</p>
          <p className="text-sm text-slate-400">Dữ liệu chấm công sẽ có từ <span className="font-semibold">08:30</span>.</p>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              {["Employee", "Department", "Shift Start", "Status", "Actions"].map((header) => (
                <th key={header} className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {snapshot.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                  Chưa có dữ liệu chấm công.
                </td>
              </tr>
            ) : (
              snapshot.map((row) => (
                <tr key={row.employeeId} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={row.avatarUrl} alt={row.employeeName} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-bold">{row.employeeName}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">{row.departmentName}</td>
                  <td className="px-6 py-4">{row.shiftStart}</td>

                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusVariantClasses(row.statusVariant)}`}>
                      {row.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button className="px-3 py-1 bg-slate-100 rounded text-xs font-bold">View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AlertCard({ alert }) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border">
      <span className="text-[10px] font-bold text-primary">{alert.type}</span>
      <p className="font-bold mt-2">{alert.title}</p>
      <p className="text-xs text-slate-500 mt-1">{alert.message}</p>
      <button className="w-full mt-4 py-2 border rounded-lg text-xs font-bold hover:bg-primary hover:text-white">
        {alert.actionLabel}
      </button>
    </div>
  );
}

function CollectingBanner() {
  return (
    <div className="xl:col-span-12 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
      <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
      <div>
        <p className="text-sm font-bold text-amber-800">Đang trong giờ điểm danh (08:30 – 09:00)</p>
        <p className="text-sm text-amber-700 mt-0.5">
          Snapshot hiện tại chỉ bao gồm nhân viên đã check-in. Nhân viên vắng mặt sẽ được hệ thống tự động cập nhật lúc{" "}
          <span className="font-bold">09:00</span>.
        </p>
      </div>
    </div>
  );
}

function AlertsSidebar({ attendanceStats }) {
  return (
    <div className="space-y-4 xl:col-span-3">
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-6 border-b flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">auto_awesome</span>
          <h3 className="text-lg font-bold">AI Alerts & Exceptions</h3>
        </div>

        <div className="p-4 space-y-4">
          {attendanceStats?.alerts?.map((alert) => (
            <AlertCard key={alert.title} alert={alert} />
          ))}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl text-center">
        <div className="size-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <span className="material-symbols-outlined text-3xl">task_alt</span>
        </div>
        <h4 className="font-bold">Ready for Payroll?</h4>
        <p className="text-xs text-slate-500 mt-2">All exceptions for the morning shift have been logged.</p>
        <button className="mt-4 px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg">Generate Report</button>
      </div>
    </div>
  );
}

function SnapshotSection({ attendanceStats }) {
  const phase = attendanceStats?.attendancePhase;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      {phase === "collecting" && <CollectingBanner />}
      <AttendanceTable attendanceStats={attendanceStats} />
      <AlertsSidebar attendanceStats={attendanceStats} />
    </div>
  );
}

export default function AttendanceScreen() {
  const navigate = useNavigate();
  const [attendanceStats, setAttendanceStats] = useState(null);

  function getTodayDate() {
    const now = new Date();

    const today =
      now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');

    console.log(today);
    return today;
  }

  useEffect(() => {
    const token = localStorage.getItem("token");

    const request = async () => {
      if (!token) {
        return;
      }

      const request = await fetch(`${API_BASE_URL}/api/hradmin/attendance-dashboard?date=${getTodayDate()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await request.json();
      console.log("attendance stats", JSON.stringify(data));
      setAttendanceStats(data);
    };
    request();
  }, []);

  return (
    <div className="space-y-8 bg-background-light min-h-screen">
      <PageHeader onNavigate={navigate} attendanceStats={attendanceStats} />
      <KpiSection attendanceStats={attendanceStats} />
      <ChartsSection attendanceStats={attendanceStats} />
      <SnapshotSection attendanceStats={attendanceStats} />
    </div>
  );
}