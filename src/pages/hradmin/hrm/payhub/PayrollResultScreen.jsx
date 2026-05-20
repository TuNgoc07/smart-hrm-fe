import { useState, useEffect } from "react";
import PayrollDetailModal from "./PayrollDetailModal";

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/* ================= MOCK DATA (fallback khi chưa có API data) ================= */

const payrollData = [
  {
    id: "SE-10245",
    name: "Nguyen Van A",
    code: "SE-10245",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",

    baseSalary: 25000000,
    daysWorked: 22,
    totalDays: 22,
    otPay: 2450000,

    allowances: [{ label: "Allowance", amount: 1500000 }],
    deductions: [{ label: "Deduction", amount: 500000 }],
    otDetails: [
      { type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
      { type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
      { type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
    ],
    gross: 28950000,
    net: 24600000,
    status: "NORMAL",
    audit: {
      formula: "NetPay = (Base * (DaysWorked/TotalDays)) + OT_Pay + Allowances - Deductions - Insurance",
      attendanceFile: "Attendance_Oct_2025_SE1039.log"
    }
  },
  {
    id: "SE-10246",
    name: "Tran Thi B",
    code: "SE-10246",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",

    baseSalary: 32000000,
    daysWorked: 21,
    totalDays: 22,
    otPay: 5200000,

    allowances: [
      { label: "Meal Allowance", amount: 800000 },
      { label: "Transport Allowance", amount: 1000000 },
      { label: "Phone Allowance", amount: 200000 },
    ],
    deductions: [
      { label: "Unpaid Leave (1 day)", amount: 1454545 },
      { label: "Social Insurance (8%)", amount: 2560000 },
    ],
    otDetails: [
      { type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
      { type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
      { type: "Weekdays", hours: "8.5h", multipier: "150%", amount: 1850000 },
    ],

    gross: 39200000,
    net: 33320000,
    status: "ADJUSTED",
    audit: {
      formula: "NetPay = (Base * (DaysWorked/TotalDays)) + OT_Pay + Allowances - Deductions - Insurance",
      attendanceFile: "Attendance_Oct_2025_SE1039.log"
    }
  },
];

/* ================= MAIN ================= */

export default function PayrollResultScreen() {
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // ── Cycle selector ──────────────────────────────────────────────
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);

  // ── Real payroll results từ API ─────────────────────────────────
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [usingMock, setUsingMock] = useState(false);
  
  // ── Lock status ─────────────────────────────────────────────────
  const [isLocked, setIsLocked] = useState(false);
  const [lockedAt, setLockedAt] = useState(null);
  const [lockedBy, setLockedBy] = useState(null);
  const [locking, setLocking] = useState(false);
  const [toast, setToast] = useState(null);

  // Load danh sách cycles khi mount
  useEffect(() => {
    fetch(`${API}/api/hradmin/payroll-cycles`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => {
        const list = d.data || [];
        // Chỉ hiện cycles đã completed
        const completed = list.filter(c => c.status === "completed");
        setCycles(completed);
        if (completed.length > 0) setSelectedCycleId(completed[0].cycleId);
      })
      .catch(() => setCycles([]));
  }, []);

  // Load results khi chọn cycle
  useEffect(() => {
    if (!selectedCycleId) { setResults([]); return; }
    setLoading(true);
    fetch(`${API}/api/hradmin/payroll-results?cycleId=${selectedCycleId}`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => {
        console.log('rs: ' + JSON.stringify(d));

        if (d.status === "success" && d.data?.length > 0) {
          setResults(d.data);
          setUsingMock(false);
          // Handle lock status from response
          setIsLocked(d.locked || false);
          setLockedAt(d.lockedAt || null);
          setLockedBy(d.lockedBy || null);
        } else {
          // Chưa có kết quả thực → fallback mock
          setResults(payrollData);
          setUsingMock(true);
          setIsLocked(false);
        }
      })
      .catch(() => { setResults(payrollData); setUsingMock(true); setIsLocked(false); })
      .finally(() => setLoading(false));
  }, [selectedCycleId]);

  // Khi click View Detail → fetch breakdown chi tiết
  const handleViewDetail = async (row) => {
    if (usingMock || !row.resultId) { setSelectedEmployee(row); return; }
    try {
      const res = await fetch(`${API}/api/hradmin/payroll-results/${row.resultId}/breakdown`, { headers: authHeader() });
      const d = await res.json();
      const detail = d.data || row;
      // Đảm bảo modal nhận đúng shape: allowances, deductions, otDetails
      setSelectedEmployee({
        ...detail,
        allowances: detail.allowancesList || row.allowances || [],
        deductions: detail.deductionsList || row.deductions || [],
        otDetails: detail.otDetails || [],
        daysWorked: detail.workedDays || detail.daysWorked || 0,
        totalDays: detail.totalDays || 26,
        audit: detail.audit || {
          formula: "Net = ProratedBase + OT - BHXH - BHYT - BHTN - PIT - Penalty - LWOP",
          attendanceFile: `Attendance_${row.cycleId}_EMP${row.employeeId}.log`
        }
      });
    } catch {
      setSelectedEmployee(row);
    }
  };

  // Lock payroll period handler
  const handleLockPayrollPeriod = async () => {
    if (!selectedCycleId || isLocked) return;
    
    if (!confirm("Bạn có chắc chắn muốn lock payroll period này không? Sau khi lock, không thể sửa đổi payroll results nữa.")) {
      return;
    }

    setLocking(true);
    try {
      const res = await fetch(`${API}/api/hradmin/payroll-cycles/${selectedCycleId}/lock`, {
        method: "POST",
        headers: authHeader()
      });
      const d = await res.json();
      
      if (res.ok && d.status === "success") {
        setToast({ type: "success", msg: "✅ Payroll period đã được lock thành công!" });
        setIsLocked(true);
        setLockedAt(new Date().toISOString());
        setLockedBy(localStorage.getItem("userEmail") || "hradmin");
        // Reload results to refresh lock status
        const resultsRes = await fetch(`${API}/api/hradmin/payroll-results?cycleId=${selectedCycleId}`, { headers: authHeader() });
        const resultsData = await resultsRes.json();
        if (resultsData.status === "success" && resultsData.data?.length > 0) {
          setResults(resultsData.data);
          setIsLocked(resultsData.locked || false);
          setLockedAt(resultsData.lockedAt || null);
          setLockedBy(resultsData.lockedBy || null);
        }
      } else {
        setToast({ type: "error", msg: d.message || "Không thể lock payroll period." });
      }
    } catch (e) {
      setToast({ type: "error", msg: "Lỗi kết nối: " + e.message });
    } finally {
      setLocking(false);
    }
  };

  // Tổng hợp summary từ results
  const summary = results.reduce((acc, r) => {
    const dedVal = Array.isArray(r.deductions)
      ? r.deductions.reduce((s, d) => s + d.amount, 0)
      : (r.deductions || 0);
    const grossVal = r.gross || r.grossSalary || 0;
    const otVal = r.otPay || r.overtimePay || 0;
    const netVal = r.net || r.netSalary || 0;
    return {
      totalEmployees: acc.totalEmployees + 1,
      totalGross: acc.totalGross + grossVal,
      totalOT: acc.totalOT + otVal,
      totalDeductions: acc.totalDeductions + dedVal,
      totalNet: acc.totalNet + netVal,
    };
  }, { totalEmployees: 0, totalGross: 0, totalOT: 0, totalDeductions: 0, totalNet: 0 });

  const selectedCycle = cycles.find(c => c.cycleId === selectedCycleId);
  const filtered = results.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative space-y-8 pb-40">

      {/* ===== HEADER ===== */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Payroll</span> / <span className="font-bold text-slate-800">Result</span>
        </div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Payroll Result</h1>
            <p className="text-slate-500 text-sm">
              {selectedCycle ? `${selectedCycle.cycleName} (${selectedCycle.startDate} → ${selectedCycle.endDate})` : "Chọn cycle bên phải"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {usingMock && (
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold">
                Demo data — chưa có kết quả thực
              </span>
            )}
            {/* Lock status indicator */}
            {isLocked && (
              <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                LOCKED
              </span>
            )}
            {/* Cycle selector */}
            <select
              className="bg-white border rounded-lg px-3 py-2 text-sm font-bold"
              value={selectedCycleId || ""}
              onChange={e => setSelectedCycleId(Number(e.target.value))}
            >
              {cycles.length === 0 && <option value="">Chưa có cycle completed</option>}
              {cycles.map(c => (
                <option key={c.cycleId} value={c.cycleId}>{c.cycleName}</option>
              ))}
            </select>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              CALCULATED
            </span>
          </div>
        </div>
      </div>

      {/* ===== SUMMARY ===== */}
      <div className="grid grid-cols-5 gap-4">
        <SummaryCard label="Total Employees" value={summary.totalEmployees} />
        <SummaryCard label="Total Gross" value={fmtM(summary.totalGross)} />
        <SummaryCard label="OT Cost" value={fmtM(summary.totalOT)} />
        <SummaryCard label="Deductions" value={fmtM(summary.totalDeductions)} />
        <SummaryCard label="Net Pay" value={fmtM(summary.totalNet)} highlight />
      </div>

      {/* ===== FILTER BAR ===== */}
      <div className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm"
            placeholder="Tìm theo tên hoặc mã nhân viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold">
          <span className="material-symbols-outlined text-lg">download</span>
          Export
        </button>
      </div>

      {/* ===== TABLE ===== */}
      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">Đang tải kết quả lương...</div>
      ) : (
        <PayrollTable data={filtered} onViewDetail={handleViewDetail} />
      )}

      {/* ===== FOOTER ACTION ===== */}
      <FooterAction 
        totalNet={summary.totalNet} 
        totalEmployees={summary.totalEmployees}
        isLocked={isLocked}
        lockedBy={lockedBy}
        lockedAt={lockedAt}
        onLock={handleLockPayrollPeriod}
        locking={locking}
      />

      {/* MODAL */}
      {selectedEmployee && (
        <PayrollDetailModal
          data={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          isLocked={isLocked}
        />
      )}

      {/* TOAST */}
      {toast && (
        <Toast 
          type={toast.type} 
          msg={toast.msg} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}

function fmtM(val) {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + "B";
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(0) + "M";
  return val.toLocaleString("vi-VN");
}

function SummaryCard({ label, value, highlight }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-xs uppercase text-slate-500 mb-2">{label}</p>
      <p className={`text-2xl font-extrabold ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

/* ================= HEADER ================= */

function Header() {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
        <span>Payroll</span> / <span className="font-bold text-slate-800">Result</span>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold">Payroll Result</h1>
          <p className="text-slate-500 text-sm">Statement for October 2024</p>
        </div>

        <span className="px-3 py-1 rounded-full bg-blue-50 text-primary text-xs font-bold flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          CALCULATED
        </span>
      </div>
    </div>
  );
}

/* ================= SUMMARY ================= */

function SummaryCards() {
  return (
    <div className="grid grid-cols-5 gap-4">
      <Summary label="Total Employees" value="120" />
      <Summary label="Total Payroll Cost" value="1.5B" trend="+2%" positive />
      <Summary label="OT Cost" value="45M" trend="-5%" />
      <Summary label="Deductions" value="12M" />
      <Summary label="Net Pay" value="1.2B" trend="+1.5%" positive />
    </div>
  );
}

function Summary({ label, value, trend, positive }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <p className="text-xs uppercase text-slate-500 mb-2">{label}</p>
      <div className="flex items-end justify-between">
        <p className={`text-2xl font-extrabold ${positive ? "text-primary" : ""}`}>
          {value}
        </p>
        {trend && (
          <span className={`text-xs font-bold ${positive ? "text-green-600" : "text-red-600"}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

/* ================= FILTER ================= */

function FilterBar() {
  return (
    <div className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-primary"
            placeholder="Search employee name or code..."
          />
        </div>

        <select className="bg-slate-100 rounded-lg px-4 py-2 text-sm">
          <option>Department: All</option>
        </select>

        <select className="bg-slate-100 rounded-lg px-4 py-2 text-sm">
          <option>Salary Range: All</option>
        </select>
      </div>

      <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-bold">
        <span className="material-symbols-outlined text-lg">download</span>
        Export
      </button>
    </div>
  );
}

/* ================= TABLE ================= */

function PayrollTable({ data, onViewDetail }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
          <tr>
            <Th>Employee</Th>
            <Th right>Base</Th>
            <Th center>Days</Th>
            <Th right>OT</Th>
            <Th right>Allow</Th>
            <Th right>Ded</Th>
            <Th right>Gross</Th>
            <Th right highlight>Net</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>

        <tbody className="divide-y">
          {data.map((emp, index) => (
            <PayrollRow
              key={index}
              employee={emp}
              onViewDetail={onViewDetail}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}



function PayrollRow({ employee, onViewDetail }) {
  const allowanceTotal = Array.isArray(employee.allowances)
    ? employee.allowances.reduce((s, a) => s + a.amount, 0)
    : (employee.allowances || 0);
  const deductionTotal = Array.isArray(employee.deductions)
    ? employee.deductions.reduce((s, d) => s + d.amount, 0)
    : (employee.deductions || 0);

  return (
    <tr className="hover:bg-slate-50">
      <Td>
        <div className="flex items-center gap-3">
          <img
            src={employee.avatar || null}
            alt={employee.avatar}
            className="w-9 h-9 rounded-full"
          />
          <div>
            <p className="font-bold">{employee.name}</p>
            <p className="text-xs text-slate-500">{employee.code}</p>
          </div>
        </div>
      </Td>

      <Td right>{(employee.baseSalary ?? 0).toLocaleString()}</Td>
      <Td center>{employee.daysWorked ?? "—"}</Td>
      <Td right>{(employee.otPay ?? 0).toLocaleString()}</Td>
      <Td right>{allowanceTotal.toLocaleString()}</Td>
      <Td right>{deductionTotal.toLocaleString()}</Td>
      <Td right>{(employee.gross ?? 0).toLocaleString()}</Td>
      <Td right highlight>{(employee.net ?? 0).toLocaleString()}</Td>

      <Td>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded ${employee.status === "ADJUSTED"
              ? "bg-primary/20 text-primary"
              : "bg-slate-100 text-slate-600"
            }`}
        >
          {employee.status}
        </span>
      </Td>

      <Td right>
        <button
          onClick={() => onViewDetail(employee)}
          className="text-primary text-xs font-bold hover:underline"
        >
          View Detail
        </button>
      </Td>
    </tr>
  );
}




/* ================= FOOTER ================= */

function FooterAction({ totalNet = 0, totalEmployees = 0, isLocked = false, lockedBy, lockedAt, onLock, locking = false }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-8 py-4 flex justify-between items-center z-20">
      <div>
        <p className="text-[10px] uppercase text-slate-500 font-bold">
          Total Net Pay Summary
        </p>
        <p className="font-bold">
          <span className="text-primary text-xl">{fmtM(totalNet)} VND</span>
          {" · "}{totalEmployees} employees ready
        </p>
        {isLocked && (
          <p className="text-xs text-red-600 mt-1">
            Locked by {lockedBy} · {lockedAt ? new Date(lockedAt).toLocaleString("vi-VN") : ""}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-3 rounded-xl border font-bold" disabled={isLocked}>
          Re-calculate
        </button>
        {isLocked ? (
          <button className="px-8 py-3 rounded-xl bg-slate-400 text-white font-extrabold flex items-center gap-2 shadow-lg cursor-not-allowed" disabled>
            <span className="material-symbols-outlined">lock</span>
            Payroll Period Locked
          </button>
        ) : (
          <button 
            onClick={onLock}
            disabled={locking}
            className="px-8 py-3 rounded-xl bg-primary text-white font-extrabold flex items-center gap-2 shadow-lg hover:opacity-90 disabled:opacity-50"
          >
            {locking ? (
              <>
                <span className="material-symbols-outlined animate-spin">autorenew</span>
                Locking...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">lock_open</span>
                Lock Payroll Period
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function Th({ children, right, center, highlight }) {
  return (
    <th
      className={`px-4 py-3 ${right ? "text-right" : ""
        } ${center ? "text-center" : ""} ${highlight ? "text-primary" : ""
        }`}
    >
      {children}
    </th>
  );
}


function Td({ children, right, center, highlight }) {
  return (
    <td
      className={`px-4 py-3 ${right ? "text-right" : ""
        } ${center ? "text-center" : ""} ${highlight ? "text-primary font-bold" : ""
        }`}
    >
      {children}
    </td>
  );
}

/* ================= TOAST ================= */

function Toast({ type, msg, onClose }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-xl shadow-xl p-4 flex items-start gap-3 border ${
      type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
    }`}>
      <span className="material-symbols-outlined text-[20px] flex-shrink-0">
        {type === "success" ? "check_circle" : "error"}
      </span>
      <p className="text-sm flex-1 whitespace-pre-line">{msg}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

