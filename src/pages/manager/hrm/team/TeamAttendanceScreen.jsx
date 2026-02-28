import { NavLink, useNavigate } from "react-router-dom";

export default function TeamAttendanceScreen() {
  const navigate = useNavigate();
  return (
    <div className="space-y-8  mx-auto w-full">

      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight">Team Attendance</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Product Design Team • 24 Members
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </button>

            <div className="px-4 flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[18px] text-primary">
                calendar_today
              </span>
              <span className="text-sm font-bold">
                Oct 24, 2023 (Today)
              </span>
            </div>

            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
              <span className="material-symbols-outlined text-[20px]">
                chevron_right
              </span>
            </button>
          </div>

          <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-primary/90 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              download
            </span>
            Export CSV
          </button>

          <button
            onClick={() => navigate("/manager/team-calendar")} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-primary/90 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              calendar_today
            </span>
            Team calendar
          </button>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard label="Team Size" value="24" sub="Total" percent="100%" />
        <KPICard label="Present" value="18" sub="75%" highlight="primary" percent="75%" />
        <KPICard label="Late" value="2" sub="Arrivals" highlight="orange" percent="8%" />
        <KPICard label="Overtime" value="3" sub="Members" highlight="blue" percent="12%" />
        <KPICard label="Missing" value="1" sub="No Check-out" highlight="red" percent="4%" />
      </div>

      {/* ================= FILTER CHIPS ================= */}
      <div className="flex gap-2 p-1 overflow-x-auto pb-2">
        <FilterChip active label="All Members" />
        <FilterChip label="Late" count="2" color="orange" />
        <FilterChip label="On Leave" count="4" />
        <FilterChip label="OT" count="3" color="blue" />
        <FilterChip label="Missing" count="1" color="red" />
        <FilterChip label="Remote" count="6" color="green" />
      </div>

      {/* ================= ATTENDANCE TABLE ================= */}
      <AttendanceTable />

      {/* ================= PENDING REQUESTS ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              pending_actions
            </span>
            Pending Approvals
          </h3>
          <NavLink to="/manager/requests" className="text-primary text-sm font-bold hover:underline">
            View All Requests
          </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RequestCard
            name="Elena Rodriguez"
            type="Overtime Request"
            time="2 hours ago"
            reason="Project Deadline - Finalizing the Design System handoff for the Q4 Enterprise Release."
            avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuB2eh_535o8_OfLJVeybR2M5hMeDS1F4pi30-XT1mXyhVdso6hsIe_ZDBdbhruD_ugH14pvqMjiMDZ2pk1oplkVeTyba3mdvx5A1Cyog_IGLbQ9nq_hIfN0Q8Dbm-lwuGat51Dav1tz-djy8DsNdi-aFvBO_j3keB4GHl2qPP-lpTuzhN83wgtVrPVKihUoSa4y8iesRaGFTB_pbFOXsvohplw6qcDOQodhaENejHk8U8GSn3esV_oVyUWEwRX_OgoQcBcnoTcGLXY"
            color="primary"
          />

          <RequestCard
            name="Kevin Smith"
            type="Late Arrival Correction"
            time="5 hours ago"
            reason="Subway delay on Line 4 (reported city-wide). Proof of delay attached."
            avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuDLI7TGhvPnPcjSM2E6UEBazauw-jdBxkC1ZxWOyi-hn_iGJRGocEnxZy8p4pTx2X1p87qiybxV4YfN8mvXzmP3u0fU_ynyzR8wt2toWFvO1vbxMU180DHPXCVOLJNwHzjijj6gyZEFgFfiV8dS8T4Oq8n7zcuCL_OGGW3zhNy5LXupUW1Y2oG3CS7pOSA_ri-hYTLyGWpIFn0NNo7_u076m7bopj3NqRD1lXEk54_zwZRgwb-RzItgvKGD-eBgNkY-xUXs9MuKM3Y"
            color="orange"
          />
        </div>
      </section>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function KPICard({ label, value, sub, highlight, percent }) {
  const colorMap = {
    primary: "text-primary bg-primary",
    orange: "text-orange-500 bg-orange-500",
    blue: "text-blue-500 bg-blue-500",
    red: "text-red-500 bg-red-500",
  };

  return (
    <div className={`bg-white dark:bg-slate-800 p-5 rounded-xl border shadow-sm flex flex-col gap-2 transition-all ${highlight ? "border-primary" : "border-slate-200 dark:border-slate-700"}`}>
      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-black ${highlight && colorMap[highlight]?.split(" ")[0]}`}>
          {value}
        </span>
        <span className="text-xs text-slate-400">{sub}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2">
        <div
          className={`h-1.5 rounded-full ${highlight ? colorMap[highlight].split(" ")[1] : "bg-primary"}`}
          style={{ width: percent }}
        />
      </div>
    </div>
  );
}

function FilterChip({ label, count, color, active }) {
  const badgeColor = {
    orange: "bg-orange-100 text-orange-600",
    blue: "bg-blue-100 text-blue-600",
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <button
      className={`flex shrink-0 items-center gap-x-2 rounded-lg px-5 py-2 text-sm font-bold transition-all ${active
        ? "bg-primary text-white"
        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
        }`}
    >
      {label}
      {count && (
        <span className={`px-1.5 rounded text-[10px] font-bold ${badgeColor[color]}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function AttendanceTable() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b bg-slate-50/50 dark:bg-slate-800/50">
              {["Employee", "Check-in", "Check-out", "Status", "OT Hours", "Exception", "Request", "Actions"].map(
                (h) => (
                  <th key={h} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            <AttendanceRow
              name="Marcus Chen"
              role="Senior UX Designer"
              avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuB07l-5vzQfXJf6DoHUyvsFf2MRXFoi-gEcvfJbzsY7IQAkRp2YGv33Ghn8SrYFn7A0blkdcb4yiSifaQ4hhaH_zJEYti29DS5X9FPBC9rg5WCkMZXRjo5OLo8dMJPINYKfe94tmFXJvsjIKMxGBM9eM3inlZi7v4j6uafAaLHF1e7DiI5Y9mT_kULSRKWGAg2dHdWfDcE9RDQzO00BWCiPZu_7acB4dYDp1wGQhMsrHvYBGKejEI4bVat4zehOW59IaeSineGVHxc"
              checkin="08:52 AM"
              checkout="Expected 06:00 PM"
              status="On-site"
              statusColor="green"
            />
            <AttendanceRow
              name="Marcus Chen"
              role="Senior UX Designer"
              avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuB07l-5vzQfXJf6DoHUyvsFf2MRXFoi-gEcvfJbzsY7IQAkRp2YGv33Ghn8SrYFn7A0blkdcb4yiSifaQ4hhaH_zJEYti29DS5X9FPBC9rg5WCkMZXRjo5OLo8dMJPINYKfe94tmFXJvsjIKMxGBM9eM3inlZi7v4j6uafAaLHF1e7DiI5Y9mT_kULSRKWGAg2dHdWfDcE9RDQzO00BWCiPZu_7acB4dYDp1wGQhMsrHvYBGKejEI4bVat4zehOW59IaeSineGVHxc"
              checkin="09:52 AM"
              checkout="No records"
              status="Late"
              statusColor="orange"
            />
            <AttendanceRow
              name="Marcus Chen"
              role="Senior UX Designer"
              avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuB07l-5vzQfXJf6DoHUyvsFf2MRXFoi-gEcvfJbzsY7IQAkRp2YGv33Ghn8SrYFn7A0blkdcb4yiSifaQ4hhaH_zJEYti29DS5X9FPBC9rg5WCkMZXRjo5OLo8dMJPINYKfe94tmFXJvsjIKMxGBM9eM3inlZi7v4j6uafAaLHF1e7DiI5Y9mT_kULSRKWGAg2dHdWfDcE9RDQzO00BWCiPZu_7acB4dYDp1wGQhMsrHvYBGKejEI4bVat4zehOW59IaeSineGVHxc"
              checkin="08:52 AM"
              checkout="Expected 06:00 PM"
              status="Incompleted"
              statusColor="red"
            />
            <AttendanceRow
              name="Marcus Chen"
              role="Senior UX Designer"
              avatar="https://lh3.googleusercontent.com/aida-public/AB6AXuB07l-5vzQfXJf6DoHUyvsFf2MRXFoi-gEcvfJbzsY7IQAkRp2YGv33Ghn8SrYFn7A0blkdcb4yiSifaQ4hhaH_zJEYti29DS5X9FPBC9rg5WCkMZXRjo5OLo8dMJPINYKfe94tmFXJvsjIKMxGBM9eM3inlZi7v4j6uafAaLHF1e7DiI5Y9mT_kULSRKWGAg2dHdWfDcE9RDQzO00BWCiPZu_7acB4dYDp1wGQhMsrHvYBGKejEI4bVat4zehOW59IaeSineGVHxc"
              checkin="08:52 AM"
              checkout="Expected 06:00 PM"
              status="Remote"
              statusColor="blue"
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceRow({ name, role, avatar, checkin, checkout, status, statusColor }) {
  let icon = "";
  let color = "";

  if (status == 'Incompleted') {
    icon = "warning";
    color = "text-red-500 text-[20px]";
  }
  if (status == 'Late') {
    icon = "error_outline";
    color = "text-orange-500 text-[20px]";
  }
  if (status == 'On-site' || status == 'Remote') {
    icon = "-";
    color = "text-gray-500 text-[20px]";
  }

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${avatar})` }} />
          <div className="flex flex-col">
            <span className="text-sm font-bold">{name}</span>
            <span className="text-[10px] text-slate-500">{role}</span>
          </div>
        </div>
      </td>
      <td className="p-4 text-sm font-medium">{checkin}</td>
      <td className="p-4 text-sm font-medium text-slate-400 italic">{checkout}</td>
      <td className="p-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-${statusColor}-100 text-${statusColor}-500`}>
          <span className={`size-1.5 rounded-full bg-${statusColor}-500`} />
          {status}
        </span>
      </td>
      <td className="p-4 text-sm">-</td>
      <td className="p-4">
        <span className={`material-symbols-outlined ${color}`}>{icon}</span>
      </td>
      <td className="p-4">-</td>
      <td className="p-4 text-right">
        <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </td>
    </tr>
  );
}

function RequestCard({ name, type, time, reason, avatar, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${avatar})` }} />
          <div>
            <p className="text-sm font-bold">{name}</p>
            <p className={`text-xs font-bold text-${color}-600`}>{type}</p>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">{time}</span>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-bold">Reason:</span> {reason}
        </p>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">
          Approve
        </button>
        <button className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
          Reject
        </button>
      </div>
    </div>
  );
}
