import { useState, useEffect } from "react";

import AttendanceAdjustModal from "./AttendanceAdjustModal";



const PAGE_SIZE = 5;



function formatDateLabel(isoDate) {

  const d = new Date(isoDate + "T00:00:00");

  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

}



/* ================= MAIN SCREEN ================= */



const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function AttendanceRecordScreen() {

  const token = localStorage.getItem("token");

  /* ── View mode toggle: "daily" (existing) | "period" (new) ── */
  const [viewMode, setViewMode] = useState("daily");

  /* ── Daily mode state (existing) ── */
  const [adjustingRecord, setAdjustingRecord] = useState(null);
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [phase, setPhase] = useState(null);

  /* ── Period mode state (new) ── */
  const [cycles, setCycles] = useState([]);
  const [cyclesLoading, setCyclesLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [periodData, setPeriodData] = useState(null);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodPage, setPeriodPage] = useState(0);
  const [periodSearch, setPeriodSearch] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;



  // Fetch records when page, date, or auto-refresh triggers

  useEffect(() => {

    if (!token) return;

    const fetchRecords = async () => {

      const res = await fetch(

        `${API_BASE_URL}/api/hradmin/attendance/records?page=${page}&date=${date}`,

        { headers: { Authorization: `Bearer ${token}` } }

      );

      const data = await res.json();

      if (data.status === "success") {

        setRecords(data.data.content);

        setTotalElements(data.data.totalElements);

      }

    };

    fetchRecords();

  }, [page, date, refreshKey]);



  // Fetch stats when date or auto-refresh triggers

  useEffect(() => {

    if (!token) return;

    const fetchStats = async () => {

      const res = await fetch(

        `${API_BASE_URL}/api/hradmin/attendance/stats?date=${date}`,

        { headers: { Authorization: `Bearer ${token}` } }

      );

      const data = await res.json();

      if (data.status === "success") {

        setStats(data.data);

        setPhase(isToday ? (data.data.attendancePhase ?? null) : "finalized");

      }

    };

    fetchStats();

  }, [date, refreshKey]);



  /* ── Period mode: load cycles on first switch ── */
  useEffect(() => {
    if (viewMode !== "period" || cycles.length > 0) return;
    setCyclesLoading(true);
    fetch(`${API_BASE_URL}/api/hradmin/attendance/cycles`, { headers: authHeaders() })
      .then(r => r.json())
      .then(json => {
        const list = json.status === "success" ? json.data : [];
        setCycles(list);
        /* Auto-select current period */
        const current = list.find(c => c.isCurrent) || list[0];
        setSelectedCycle(current || null);
      })
      .catch(console.error)
      .finally(() => setCyclesLoading(false));
  }, [viewMode]);

  /* ── Period mode: fetch period-records when cycle changes ── */
  useEffect(() => {
    if (viewMode !== "period" || !selectedCycle) return;
    setPeriodLoading(true);
    setPeriodPage(0);
    fetch(
      `${API_BASE_URL}/api/hradmin/attendance/period-records?startDate=${selectedCycle.startDate}&endDate=${selectedCycle.endDate}&page=0`,
      { headers: authHeaders() }
    )
      .then(r => r.json())
      .then(json => setPeriodData(json.status === "success" ? json.data : null))
      .catch(console.error)
      .finally(() => setPeriodLoading(false));
  }, [viewMode, selectedCycle]);

  /* ── Period mode: paginate ── */
  const handlePeriodPageChange = (newPage) => {
    if (!selectedCycle) return;
    setPeriodLoading(true);
    fetch(
      `${API_BASE_URL}/api/hradmin/attendance/period-records?startDate=${selectedCycle.startDate}&endDate=${selectedCycle.endDate}&page=${newPage}`,
      { headers: authHeaders() }
    )
      .then(r => r.json())
      .then(json => {
        if (json.status === "success") { setPeriodData(json.data); setPeriodPage(newPage); }
      })
      .catch(console.error)
      .finally(() => setPeriodLoading(false));
  };

  // Auto-refresh every 60s during collecting phase

  useEffect(() => {

    if (!isToday || phase !== "collecting") return;

    const interval = setInterval(() => setRefreshKey((k) => k + 1), 60_000);

    return () => clearInterval(interval);

  }, [phase, isToday]);



  // Fetch departments once

  useEffect(() => {

    if (!token) return;

    const fetchDepts = async () => {

      const res = await fetch(`${API_BASE_URL}/api/hradmin/departments`, {

        headers: { Authorization: `Bearer ${token}` },

      });

      const data = await res.json();

      if (data.status === "success") setDepartments(data.data.content || []);

    };

    fetchDepts();

  }, []);



  const handleDateChange = (newDate) => {

    setDate(newDate);

    setPage(0);

    setPhase(null);

  };



  // Client-side search + department filter

  const filteredRecords = records.filter((r) => {

    const name = r.employeeInfo?.employeeName?.toLowerCase() || "";

    const id = String(r.employeeInfo?.employeeId || "");

    const dept = r.employeeInfo?.departmentName || "";

    const matchSearch = search === "" || name.includes(search.toLowerCase()) || id.includes(search);

    const matchDept = selectedDept === "all" || dept === selectedDept;

    return matchSearch && matchDept;

  });





  const totalPages = Math.ceil(totalElements / PAGE_SIZE);

  const resolvedPct =

    stats && stats.totalRecords > 0

      ? ((stats.resolvedCount / stats.totalRecords) * 100).toFixed(1)

      : "0.0";



  /* ── Filter period employees client-side ── */
  const filteredPeriodEmployees = (periodData?.employees || []).filter(e => {
    const name = e.employeeName?.toLowerCase() || "";
    const id   = String(e.employeeId || "");
    const q    = periodSearch.toLowerCase();
    return q === "" || name.includes(q) || id.includes(q);
  });

  return (
    <div className="mx-auto space-y-6">

      {/* ── View Mode Toggle ── */}
      <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />

      {viewMode === "daily" ? (
        /* ════════ DAILY MODE (existing) ════════ */
        <>
          <TopBar date={date} onDateChange={handleDateChange} />

          {isToday && phase === "before_shift" ? (
            <BeforeShiftState />
          ) : (
            <>
              {isToday && phase === "collecting" && <CollectingBanner />}
              <StatsGrid stats={stats} />
              <FilterBar
                search={search}
                onSearch={setSearch}
                departments={departments}
                selectedDept={selectedDept}
                onDeptChange={setSelectedDept}
              />
              <AttendanceTable onEdit={setAdjustingRecord} records={filteredRecords} />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              <BottomStatus
                resolvedPct={resolvedPct}
                resolvedCount={stats?.resolvedCount ?? 0}
                totalRecords={stats?.totalRecords ?? 0}
              />
            </>
          )}

          {adjustingRecord && (
            <AttendanceAdjustModal
              data={adjustingRecord}
              onClose={() => setAdjustingRecord(null)}
              onSaved={() => { setAdjustingRecord(null); setRefreshKey(k => k + 1); }}
            />
          )}
        </>
      ) : (
        /* ════════ PERIOD MODE (new) ════════ */
        <PeriodView
          cycles={cycles}
          cyclesLoading={cyclesLoading}
          selectedCycle={selectedCycle}
          setSelectedCycle={setSelectedCycle}
          periodData={periodData}
          periodLoading={periodLoading}
          periodPage={periodPage}
          onPageChange={handlePeriodPageChange}
          search={periodSearch}
          setSearch={setPeriodSearch}
          employees={filteredPeriodEmployees}
        />
      )}
    </div>
  );

}



/* ================= PHASE STATES ================= */



function BeforeShiftState() {

  return (

    <div className="bg-white rounded-xl shadow-sm border p-16 flex flex-col items-center justify-center text-center gap-4">

      <span className="material-symbols-outlined text-6xl text-slate-300">schedule</span>

      <div>

        <p className="text-lg font-bold text-slate-700">Chưa có dữ liệu chấm công ngày hôm nay</p>

        <p className="text-sm text-slate-400 mt-1">

          Ca làm việc bắt đầu lúc <span className="font-semibold">08:30</span>. Dữ liệu sẽ xuất hiện sau khi ca làm việc bắt đầu.

        </p>

      </div>

    </div>

  );

}



function CollectingBanner() {

  return (

    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">

      <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>

      <div>

        <p className="text-sm font-bold text-amber-800">Đang trong giờ điểm danh (08:30 – 09:00)</p>

        <p className="text-sm text-amber-700 mt-0.5">

          Danh sách hiện tại chỉ bao gồm nhân viên đã check-in. Nhân viên vắng mặt sẽ được hệ thống tự động cập nhật lúc{" "}

          <span className="font-bold">09:00</span>. Màn hình tự làm mới mỗi 60 giây.

        </p>

      </div>

    </div>

  );

}



/* ================= TOP BAR ================= */



function TopBar({ date, onDateChange }) {

  const today = new Date().toISOString().split("T")[0];

  const isToday = date === today;



  const dateOptions = Array.from({ length: 30 }, (_, i) => {

    const d = new Date();

    d.setDate(d.getDate() - i);

    return d.toISOString().split("T")[0];

  });



  return (

    <div className="flex items-center justify-between">

      <div className="flex items-center gap-4">

        <div className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg shadow-sm">

          <span className="material-symbols-outlined text-slate-500">calendar_month</span>

          <select

            value={date}

            onChange={(e) => onDateChange(e.target.value)}

            className="bg-transparent border-none text-lg font-bold focus:ring-0 pr-6"

          >

            {dateOptions.map((d) => (

              <option key={d} value={d}>

                {formatDateLabel(d)}

              </option>

            ))}

          </select>

        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border uppercase tracking-wider">

          <span className="size-2 bg-amber-500 rounded-full mr-2 animate-pulse" />

          {isToday ? "Live" : "Historical"}

        </span>

      </div>

      <div className="flex items-center gap-2 text-slate-500 text-sm">

        <span className="material-symbols-outlined !text-lg">info</span>

        {isToday ? "Live data" : `Data for ${formatDateLabel(date)}`}

      </div>

    </div>

  );

}



/* ================= STATS ================= */



function StatsGrid({ stats }) {

  return (

    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

      <StatCard label="Total Employees" value={stats?.totalEmployees ?? "—"} icon="groups" />

      <StatCard label="Absent Today" value={stats?.absentCount ?? "—"} icon="error_outline" danger />

      <StatCard label="Late / Early" value={stats?.lateCount ?? "—"} icon="schedule" warning />

      <StatCard label="OT Pending" value={stats?.otPendingCount ?? "—"} icon="more_time" orange />

      <StatCard label="Exceptions" value={stats?.exceptionsCount ?? "—"} icon="warning" purple />

    </div>

  );

}



function StatCard({ label, value, icon, danger, warning, orange, purple }) {

  const color = danger ? "text-red-600" : warning ? "text-amber-600" : orange ? "text-orange-600" : purple ? "text-purple-600" : "text-slate-900";

  const iconColor = danger ? "text-red-500" : warning ? "text-amber-500" : orange ? "text-orange-500" : purple ? "text-purple-500" : "text-primary";

  return (

    <div className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition cursor-pointer">

      <div className="flex justify-between items-start mb-2">

        <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">{label}</span>

        <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>

      </div>

      <div className={`text-2xl font-black ${color}`}>{value}</div>

    </div>

  );

}



/* ================= FILTER BAR ================= */



function FilterBar({ search, onSearch, departments, selectedDept, onDeptChange }) {

  return (

    <div className="bg-white rounded-xl p-4 shadow-sm border">

      <div className="flex flex-col lg:flex-row justify-between gap-4">

        <div className="flex flex-wrap items-center gap-4 flex-1">

          <SearchInput value={search} onChange={onSearch} />

          <select

            value={selectedDept}

            onChange={(e) => onDeptChange(e.target.value)}

            className="h-10 px-3 border rounded-lg text-sm bg-white"

          >

            <option value="all">All Departments</option>

            {departments.map((d) => (

              <option key={d.deptId} value={d.deptName}>

                {d.deptName}

              </option>

            ))}

          </select>

          <StatusFilters />

        </div>

        <div className="flex items-center gap-3">

          <ActionBtn icon="download" label="Export" />

          <ActionBtn icon="rule_settings" label="Bulk Adjust" primary />

        </div>

      </div>

    </div>

  );

}



function SearchInput({ value, onChange }) {

  return (

    <div className="relative w-full max-w-xs">

      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>

      <input

        value={value}

        onChange={(e) => onChange(e.target.value)}

        placeholder="Search name or ID..."

        className="w-full pl-10 pr-4 h-10 border rounded-lg text-sm"

      />

    </div>

  );

}



function StatusFilters() {

  return (

    <div className="flex items-center gap-2">

      <Tag label="Normal" />

      <Tag label="Missing" danger />

      <Tag label="Late" warning />

      <Tag label="OT" primary />

    </div>

  );

}



function Tag({ label, danger, warning, primary }) {

  const style = danger ? "bg-red-50 text-red-600 border-red-200" : warning ? "bg-amber-50 text-amber-600 border-amber-200" : primary ? "bg-blue-50 text-primary border-blue-200" : "bg-slate-100 text-slate-600 border-slate-200";

  return <button className={`px-3 h-8 rounded-full text-xs font-bold border ${style}`}>{label}</button>;

}



function ActionBtn({ icon, label, primary }) {

  return (

    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${primary ? "bg-primary text-white hover:bg-blue-600" : "bg-white border hover:bg-slate-50"}`}>

      <span className="material-symbols-outlined">{icon}</span>

      {label}

    </button>

  );

}



/* ================= TABLE ================= */



function AttendanceTable({ onEdit, records }) {

  if (records.length === 0) {

    return (

      <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-slate-400">

        <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>

        No attendance records found.

      </div>

    );

  }



  return (

    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">

      <table className="w-full text-left">

        <thead className="bg-slate-50 border-b text-xs font-bold uppercase text-slate-500">

          <tr>

            <Th>Employee</Th>

            <Th>Date</Th>

            <Th>Check-in</Th>

            <Th>Check-out</Th>

            <Th>Work Hours</Th>

            <Th>OT Hours</Th>

            <Th center>Status</Th>

            <Th center>Exception</Th>

            <Th right>Actions</Th>

          </tr>

        </thead>

        <tbody className="divide-y">

          {records.map((record, index) => (

            <AttendanceRow

              key={record.recordInfo?.recordId || index}

              data={record}

              onEdit={onEdit}

              danger={!record.recordInfo?.checkout || !record.recordInfo?.checkin}

            />

          ))}

        </tbody>

      </table>

    </div>

  );

}



function AttendanceRow({ danger, onEdit, data }) {

  const recordInfo = data.recordInfo;

  const employeeInfo = data.employeeInfo;



  return (

    <tr className={`${danger ? "bg-red-50/50" : ""} hover:bg-slate-50`}>

      <Td>

        <div className="flex items-center gap-3">

          <img

            src={employeeInfo.avatar || "https://randomuser.me/api/portraits/men/45.jpg"}

            alt={employeeInfo.employeeName}

            className="w-9 h-9 rounded-full border object-cover"

          />

          <div>

            <p className="text-sm font-bold">{employeeInfo.employeeName}</p>

            <p className="text-xs text-slate-500">#EMP{employeeInfo.employeeId}</p>

          </div>

        </div>

      </Td>

      <Td>{recordInfo.attendanceDate}</Td>

      <Td>{recordInfo.checkin || "-"}</Td>

      <Td className={!recordInfo.checkout ? "text-red-600 font-bold" : ""}>

        {recordInfo.checkout || "-"}

      </Td>

      <Td>{recordInfo.workHours || "-"}</Td>

      <Td>{recordInfo.otMinutes ? `${recordInfo.otMinutes}m` : "-"}</Td>

      <Td center>

        <StatusBadge label={recordInfo.status} />

      </Td>

      <Td center>{recordInfo.isException === 0 || !recordInfo.isException ? "-" : "⚠️"}</Td>

      <Td right>

        <IconBtn icon="visibility" />

        <IconBtn icon="edit" danger={danger} onClick={() => onEdit(data)} />

      </Td>

    </tr>

  );

}



/* ================= PAGINATION ================= */



function Pagination({ page, totalPages, onPageChange }) {

  if (totalPages <= 1) return null;

  return (

    <div className="flex items-center justify-center gap-3">

      <button

        onClick={() => onPageChange(page - 1)}

        disabled={page === 0}

        className="px-4 py-2 rounded-lg border text-sm font-semibold disabled:opacity-40 hover:bg-slate-50"

      >

        ← Previous

      </button>

      <span className="text-sm text-slate-600 font-medium">

        Page {page + 1} of {totalPages}

      </span>

      <button

        onClick={() => onPageChange(page + 1)}

        disabled={page >= totalPages - 1}

        className="px-4 py-2 rounded-lg border text-sm font-semibold disabled:opacity-40 hover:bg-slate-50"

      >

        Next →

      </button>

    </div>

  );

}



/* ================= UI HELPERS ================= */



function StatusBadge({ label }) {

  const styleMap = {

    present:          "bg-green-100 text-green-700",

    "on-time":        "bg-green-100 text-green-700",

    on_time:          "bg-green-100 text-green-700",

    late:             "bg-yellow-100 text-yellow-600",

    absent:           "bg-red-100 text-red-700",

    missing_checkout: "bg-orange-100 text-orange-700",

    leave:            "bg-blue-100 text-blue-700",

    short_hours:      "bg-purple-100 text-purple-700",

  };



  const labelMap = {

    present:          "On-Time",

    "on-time":        "On-Time",

    on_time:          "On-Time",

    late:             "Late",

    absent:           "Absent",

    missing_checkout: "Missing CO",

    leave:            "On Leave",

    short_hours:      "Short Hours",

  };



  const key = label?.toLowerCase();

  return (

    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${styleMap[key] || "bg-slate-100 text-slate-600"}`}>

      {labelMap[key] || label || "-"}

    </span>

  );

}



function Th({ children, center, right }) {

  return <th className={`px-6 py-4 ${center ? "text-center" : right ? "text-right" : ""}`}>{children}</th>;

}



function Td({ children, className = "", center, right }) {

  return <td className={`px-6 py-4 text-sm ${center ? "text-center" : right ? "text-right" : ""} ${className}`}>{children}</td>;

}



function IconBtn({ icon, danger, onClick }) {

  return (

    <button onClick={onClick} className={`mx-1 ${danger ? "text-red-500" : "text-slate-400 hover:text-primary"}`}>

      <span className="material-symbols-outlined">{icon}</span>

    </button>

  );

}



/* ================= VIEW MODE TOGGLE ================= */

/**
 * Toggle button: Daily view ↔ Period view
 * - Daily: xem từng ngày, hiển thị ai check-in/out hôm nay
 * - Period: xem theo kỳ lương, thống kê tổng hợp mỗi employee
 */
function ViewModeToggle({ viewMode, setViewMode }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Attendance Records</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {viewMode === "daily"
            ? "Live / historical daily check-in view"
            : "Period summary — aggregated per employee"}
        </p>
      </div>
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
        <button
          onClick={() => setViewMode("daily")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            viewMode === "daily"
              ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">today</span>
          Daily
        </button>
        <button
          onClick={() => setViewMode("period")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            viewMode === "period"
              ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">date_range</span>
          Period
        </button>
      </div>
    </div>
  );
}

/* ================= PERIOD VIEW ================= */

/**
 * PeriodView — hiển thị chấm công tổng hợp theo kỳ lương.
 * Mỗi row = 1 employee với: presentDays, lateDays, absentDays, leaveDays, OT.
 * Dùng cho HR Admin trước khi close attendance / run payroll.
 */
function PeriodView({
  cycles, cyclesLoading, selectedCycle, setSelectedCycle,
  periodData, periodLoading, periodPage, onPageChange,
  search, setSearch, employees,
}) {
  const stats   = periodData?.stats || {};
  const fmtDate = d => d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="space-y-6">
      {/* ── Period Selector Bar ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">date_range</span>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Payroll Period</p>
            {selectedCycle && (
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {fmtDate(selectedCycle.startDate)} – {fmtDate(selectedCycle.endDate)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="pl-9 pr-4 h-10 w-48 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* Cycle dropdown */}
          {cyclesLoading ? (
            <div className="h-10 w-52 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          ) : (
            <select
              value={selectedCycle ? `${selectedCycle.startDate}|${selectedCycle.endDate}` : ""}
              onChange={e => {
                const [start, end] = e.target.value.split("|");
                const found = cycles.find(c => c.startDate === start && c.endDate === end);
                if (found) setSelectedCycle(found);
              }}
              className="h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800 font-medium"
            >
              {cycles.map(c => (
                <option key={`${c.startDate}|${c.endDate}`} value={`${c.startDate}|${c.endDate}`}>
                  {c.label}{c.isCurrent ? " (Current)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ── Period Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <PeriodStatCard icon="groups"      label="Employees"     value={stats.totalEmployees ?? "—"} />
        <PeriodStatCard icon="task_alt"    label="Avg. Present"  value={stats.avgPresentRate != null ? `${stats.avgPresentRate}%` : "—"} green />
        <PeriodStatCard icon="schedule"    label="Late Days"     value={stats.totalLateDays ?? "—"} warning />
        <PeriodStatCard icon="event_busy"  label="Absent Days"   value={stats.totalAbsentDays ?? "—"} danger />
        <PeriodStatCard icon="beach_access" label="Leave Days"   value={stats.totalLeaveDays ?? "—"} blue />
        <PeriodStatCard icon="more_time"   label="OT Hours"      value={stats.totalOtHours != null ? `${stats.totalOtHours}h` : "—"} purple />
      </div>

      {/* ── Per-Employee Summary Table ── */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b text-xs font-bold uppercase text-slate-500">
            <tr>
              <Th>Employee</Th>
              <Th center>Present</Th>
              <Th center>Late</Th>
              <Th center>Absent</Th>
              <Th center>Leave</Th>
              <Th center>OT</Th>
              <Th center>Attendance %</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {periodLoading ? (
              /* Loading skeleton rows */
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                  No attendance data for this period.
                </td>
              </tr>
            ) : (
              employees.map(emp => (
                <PeriodEmployeeRow key={emp.employeeId} emp={emp} />
              ))
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {periodData && periodData.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500">
              {periodData.totalElements} employees · Page {periodPage + 1} of {periodData.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(periodPage - 1)}
                disabled={periodPage === 0}
                className="px-3 py-1.5 rounded-lg border text-sm font-semibold disabled:opacity-40 hover:bg-slate-100"
              >← Prev</button>
              <button
                onClick={() => onPageChange(periodPage + 1)}
                disabled={periodPage >= periodData.totalPages - 1}
                className="px-3 py-1.5 rounded-lg border text-sm font-semibold disabled:opacity-40 hover:bg-slate-100"
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PeriodStatCard({ icon, label, value, green, warning, danger, blue, purple }) {
  const color = green   ? "text-green-600 bg-green-50"
    : warning ? "text-amber-600 bg-amber-50"
    : danger  ? "text-red-600 bg-red-50"
    : blue    ? "text-blue-600 bg-blue-50"
    : purple  ? "text-purple-600 bg-purple-50"
    : "text-primary bg-primary/10";
  const textColor = green ? "text-green-700" : warning ? "text-amber-700" : danger ? "text-red-700"
    : blue ? "text-blue-700" : purple ? "text-purple-700" : "text-slate-900";
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">{label}</span>
        <span className={`material-symbols-outlined text-[18px] p-1.5 rounded-lg ${color}`}>{icon}</span>
      </div>
      <p className={`text-2xl font-black ${textColor} dark:text-white`}>{value}</p>
    </div>
  );
}

function PeriodEmployeeRow({ emp }) {
  /* Present rate badge color */
  const rateBg = emp.presentRate >= 90 ? "bg-green-100 text-green-700"
    : emp.presentRate >= 75 ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-700";

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
      {/* Employee info */}
      <Td>
        <div className="flex items-center gap-3">
          <img
            src={emp.avatar || "https://randomuser.me/api/portraits/men/45.jpg"}
            alt={emp.employeeName}
            className="w-9 h-9 rounded-full border object-cover"
          />
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{emp.employeeName}</p>
            <p className="text-xs text-slate-400">{emp.department || `#EMP${emp.employeeId}`}</p>
          </div>
        </div>
      </Td>
      <Td center><span className="font-bold text-green-700">{emp.presentDays}</span></Td>
      <Td center>
        {emp.lateDays > 0
          ? <span className="text-amber-600 font-bold">{emp.lateDays}</span>
          : <span className="text-slate-400">—</span>}
      </Td>
      <Td center>
        {emp.absentDays > 0
          ? <span className="text-red-600 font-bold">{emp.absentDays}</span>
          : <span className="text-slate-400">—</span>}
      </Td>
      <Td center>
        {emp.leaveDays > 0
          ? <span className="text-blue-600 font-bold">{emp.leaveDays}</span>
          : <span className="text-slate-400">—</span>}
      </Td>
      <Td center>
        <span className="text-purple-600 font-medium">
          {emp.totalOtMinutes > 0 ? `${Math.round(emp.totalOtMinutes / 60 * 10) / 10}h` : "—"}
        </span>
      </Td>
      <Td center>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rateBg}`}>
          {emp.presentRate}%
        </span>
      </Td>
    </tr>
  );
}

/* ================= BOTTOM STATUS ================= */



function BottomStatus({ resolvedPct, resolvedCount, totalRecords }) {

  const isComplete = parseFloat(resolvedPct) >= 100;

  return (

    <div className="flex items-center justify-between bg-white border rounded-xl p-4">

      <div>

        <p className="text-xs text-slate-500 font-bold uppercase">Ready for Closing</p>

        <p className="text-sm">

          {resolvedPct}% Records Resolved ({resolvedCount}/{totalRecords})

        </p>

      </div>

      <button

        disabled={!isComplete}

        className={`flex items-center gap-2 px-8 py-3 rounded-lg font-bold ${

          isComplete ? "bg-primary text-white hover:bg-blue-600 cursor-pointer" : "bg-slate-200 text-slate-400 cursor-not-allowed"

        }`}

      >

        <span className="material-symbols-outlined">lock</span>

        Close Attendance

      </button>

    </div>

  );

}