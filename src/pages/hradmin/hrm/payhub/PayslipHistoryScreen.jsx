import { useState, useEffect } from "react";

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function PayslipHistoryScreen() {
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Load danh sách cycles đã locked
  useEffect(() => {
    fetch(`${API}/api/hradmin/payroll-cycles`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => {
        const list = d.data || [];
        // Chỉ hiện cycles đã locked
        const locked = list.filter(c => c.locked === true);
        setCycles(locked);
        if (locked.length > 0) setSelectedCycleId(locked[0].cycleId);
      })
      .catch(() => setCycles([]));
  }, []);

  // Load payslips khi chọn cycle
  useEffect(() => {
    if (!selectedCycleId) { setPayslips([]); return; }
    setLoading(true);
    fetch(`${API}/api/hradmin/payslips?cycleId=${selectedCycleId}`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => {
        if (d.status === "success" && d.data?.length > 0) {
          setPayslips(d.data);
        } else {
          setPayslips([]);
        }
      })
      .catch(() => setPayslips([]))
      .finally(() => setLoading(false));
  }, [selectedCycleId]);

  const handleViewDetail = async (payslip) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`${API}/api/hradmin/payslips/${payslip.payslipId}`, { headers: authHeader() });
      const d = await res.json();
      setSelectedPayslip(d.status === "success" ? d.data : payslip);
    } catch {
      setSelectedPayslip(payslip);
    } finally {
      setDetailLoading(false);
    }
  };

  const selectedCycle = cycles.find(c => c.cycleId === selectedCycleId);
  const filtered = payslips.filter(p =>
    !search || p.employeeName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalNet = payslips.reduce((sum, p) => sum + (p.netSalary || 0), 0);

  return (
    <div className="space-y-8 pb-40">
      {/* HEADER */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
          <span>Payroll</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="font-bold text-slate-800">Payslip History</span>
        </div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Payslip History</h1>
            <p className="text-slate-500 text-sm">
              Xem lịch sử payslips đã lock
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Cycle selector */}
            <select
              className="bg-white border rounded-lg px-3 py-2 text-sm font-bold"
              value={selectedCycleId || ""}
              onChange={e => setSelectedCycleId(Number(e.target.value))}
            >
              {cycles.length === 0 && <option value="">Chưa có cycle locked</option>}
              {cycles.map(c => (
                <option key={c.cycleId} value={c.cycleId}>{c.cycleName}</option>
              ))}
            </select>
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              LOCKED
            </span>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Total Payslips" value={payslips.length} />
        <SummaryCard label="Total Net Pay" value={fmtM(totalNet)} highlight />
        <SummaryCard label="Locked By" value={selectedCycle?.lockedBy || "—"} />
      </div>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl border p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-lg text-sm"
            placeholder="Tìm theo tên nhân viên..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="flex justify-center py-16 text-slate-400">Đang tải payslips...</div>
      ) : (
        <PayslipTable data={filtered} onViewDetail={handleViewDetail} detailLoading={detailLoading} />
      )}

      {/* DETAIL MODAL */}
      {selectedPayslip && (
        <PayslipDetailModal
          data={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
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

function PayslipTable({ data, onViewDetail, detailLoading }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
          <tr>
            <Th>Employee</Th>
            <Th right>Base Salary</Th>
            <Th right>OT Pay</Th>
            <Th right>Allowances</Th>
            <Th right>Deductions</Th>
            <Th right>Gross</Th>
            <Th right highlight>Net</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((p, index) => (
            <PayslipRow
              key={index}
              payslip={p}
              onViewDetail={onViewDetail}
              detailLoading={detailLoading}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PayslipRow({ payslip, onViewDetail, detailLoading }) {
  const allowanceTotal = (payslip.mealAllowance || 0) + (payslip.transportAllowance || 0) + (payslip.otherAllowances || 0) + (payslip.bonus || 0) + (payslip.commission || 0);
  const deductionTotal = (payslip.bhxhEmployee || 0) + (payslip.bhytEmployee || 0) + (payslip.bhtnEmployee || 0) + (payslip.pit || 0) + (payslip.penalty || 0) + (payslip.lwop || 0);

  return (
    <tr className="hover:bg-slate-50">
      <Td>
        <div className="flex items-center gap-3">
          <div>
            <p className="font-bold">{payslip.employeeName}</p>
            <p className="text-xs text-slate-500">{payslip.department || "—"}</p>
          </div>
        </div>
      </Td>
      <Td right>{(payslip.baseSalary ?? 0).toLocaleString()}</Td>
      <Td right>{(payslip.otNormalPay + payslip.otWeekendPay + payslip.otHolidayPay || 0).toLocaleString()}</Td>
      <Td right>{allowanceTotal.toLocaleString()}</Td>
      <Td right>{deductionTotal.toLocaleString()}</Td>
      <Td right>{(payslip.grossIncome ?? 0).toLocaleString()}</Td>
      <Td right highlight>{(payslip.netSalary ?? 0).toLocaleString()}</Td>
      <Td right>
        <button
          onClick={() => onViewDetail(payslip)}
          disabled={detailLoading}
          className="text-primary text-xs font-bold hover:underline disabled:opacity-50"
        >
          {detailLoading ? "Loading…" : "View Detail"}
        </button>
      </Td>
    </tr>
  );
}

function PayslipDetailModal({ data, onClose }) {
  const allowanceTotal = (data.mealAllowance || 0) + (data.transportAllowance || 0) + (data.otherAllowances || 0) + (data.bonus || 0) + (data.commission || 0);
  const deductionTotal = (data.bhxhEmployee || 0) + (data.bhytEmployee || 0) + (data.bhtnEmployee || 0) + (data.pit || 0) + (data.penalty || 0) + (data.lwop || 0);
  const employerTotal = (data.bhxhEmployer || 0) + (data.bhytEmployer || 0) + (data.bhtnEmployer || 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="px-8 py-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-extrabold">
              Payslip Detail –
              <span className="text-primary ml-1">{data.employeeName}</span>
            </h3>
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">lock</span>
              LOCKED
            </span>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center">✕</button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-2 gap-8">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl border p-5">
                <p className="text-xs font-bold uppercase text-slate-500 mb-3">Period Information</p>
                <Row label="Cycle Name">{data.cycleName}</Row>
                <Row label="Period">{data.periodStart} → {data.periodEnd}</Row>
                <Row label="Locked At">{data.lockedAt ? new Date(data.lockedAt).toLocaleString("vi-VN") : "—"}</Row>
                <Row label="Locked By">{data.lockedBy}</Row>
              </div>

              <div className="bg-slate-50 rounded-xl border p-5">
                <p className="text-xs font-bold uppercase text-slate-500 mb-3">Earnings</p>
                <Row label="Base Salary">{data.baseSalary?.toLocaleString()} VND</Row>
                <Row label="Prorated Salary">{data.proratedSalary?.toLocaleString()} VND</Row>
                <Row label="OT Normal">{data.otNormalPay?.toLocaleString()} VND ({data.otNormalHours}h)</Row>
                <Row label="OT Weekend">{data.otWeekendPay?.toLocaleString()} VND ({data.otWeekendHours}h)</Row>
                <Row label="OT Holiday">{data.otHolidayPay?.toLocaleString()} VND ({data.otHolidayHours}h)</Row>
                <Divider />
                <Row label="Total Allowances" highlight>{allowanceTotal.toLocaleString()} VND</Row>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl border p-5">
                <p className="text-xs font-bold uppercase text-slate-500 mb-3">Deductions</p>
                <Row label="BHXH (8%)">{data.bhxhEmployee?.toLocaleString()} VND</Row>
                <Row label="BHYT (1.5%)">{data.bhytEmployee?.toLocaleString()} VND</Row>
                <Row label="BHTN (1%)">{data.bhtnEmployee?.toLocaleString()} VND</Row>
                <Row label="PIT">{data.pit?.toLocaleString()} VND</Row>
                <Row label="Penalty">{data.penalty?.toLocaleString()} VND</Row>
                <Row label="LWOP">{data.lwop?.toLocaleString()} VND</Row>
                <Divider />
                <Row label="Total Deductions" danger>{deductionTotal.toLocaleString()} VND</Row>
              </div>

              <div className="bg-slate-50 rounded-xl border p-5">
                <p className="text-xs font-bold uppercase text-slate-500 mb-3">Summary</p>
                <Row label="Gross Income">{data.grossIncome?.toLocaleString()} VND</Row>
                <Row label="Net Salary" highlight>{data.netSalary?.toLocaleString()} VND</Row>
                <Divider />
                <Row label="Employer Contributions">{employerTotal.toLocaleString()} VND</Row>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-4 border-t flex justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-6 py-2 border rounded-xl font-bold">Close</button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children, highlight, danger }) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${highlight ? "text-primary" : ""} ${danger ? "text-red-600" : ""}`}>
        {children}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="my-3 border-t border-slate-200" />;
}

function Th({ children, right, center, highlight }) {
  return (
    <th className={`px-4 py-3 ${right ? "text-right" : ""} ${center ? "text-center" : ""} ${highlight ? "text-primary" : ""}`}>
      {children}
    </th>
  );
}

function Td({ children, right, center, highlight }) {
  return (
    <td className={`px-4 py-3 ${right ? "text-right" : ""} ${center ? "text-center" : ""} ${highlight ? "text-primary font-bold" : ""}`}>
      {children}
    </td>
  );
}
