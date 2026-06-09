import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import LeaveBalanceConfigModal from "../LeaveBalanceConfigModal";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function LeaveTab() {
  const { emp_id } = useParams();
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  /** State cho carry-over modal: preview xem trước trước khi thực hiện */
  const [showCarryOverModal, setShowCarryOverModal] = useState(false);
  const [carryOverFromYear, setCarryOverFromYear] = useState(new Date().getFullYear() - 1);
  const [carryOverToYear, setCarryOverToYear] = useState(new Date().getFullYear());
  const [carryOverPreview, setCarryOverPreview] = useState(null); // null = chưa load
  const [carryOverLoading, setCarryOverLoading] = useState(false);
  const [carryOverExecuting, setCarryOverExecuting] = useState(false);
  const [carryOverResult, setCarryOverResult] = useState(null); // kết quả sau khi execute

  const fetchLeaveBalances = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const currentYear = new Date().getFullYear();
      const res = await fetch(`${API_BASE_URL}/api/hradmin/leave-balances/employee/${emp_id}?year=${currentYear}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLeaveBalances(data.status === "success" ? (data.data || []) : []);
    } catch (err) {
      console.error("Error fetching leave balances:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveBalances();
  }, [emp_id]);

  const handleAddBalance = () => {
    setSelectedBalance(null);
    setShowBalanceModal(true);
  };

  const handleEditBalance = (balance) => {
    setSelectedBalance(balance);
    setShowBalanceModal(true);
  };

  const handleBalanceSuccess = () => {
    setShowBalanceModal(false);
    setSelectedBalance(null);
    fetchLeaveBalances();
  };

  /** Reset toàn bộ carry-over modal state về trạng thái ban đầu */
  const resetCarryOverModal = () => {
    setCarryOverPreview(null);
    setCarryOverResult(null);
    setCarryOverExecuting(false);
    setCarryOverLoading(false);
  };

  /**
   * Gọi API GET preview: lấy danh sách dự kiến carry-over trước khi thực hiện.
   * Hiển thị willCreate/willSkip và từng employee+policy để HR Admin review.
   */
  const fetchCarryOverPreview = async () => {
    setCarryOverLoading(true);
    setCarryOverPreview(null);
    setCarryOverResult(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/hradmin/leave-balances/carry-over/preview?fromYear=${carryOverFromYear}&toYear=${carryOverToYear}&employeeId=${emp_id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const data = await res.json();
      // Lưu kết quả preview để hiển thị bảng tóm tắt
      if (data.status === "success") {
        setCarryOverPreview(data.data);
      }
    } catch (err) {
      console.error("Error fetching carry-over preview:", err);
    } finally {
      setCarryOverLoading(false);
    }
  };

  /**
   * Gọi API POST execute: thực sự tạo balance năm mới với carriedOverDays tự động.
   * Chỉ được gọi sau khi HR Admin đã xem preview và bấm Confirm.
   * Idempotent: bỏ qua các bản ghi đã tồn tại.
   */
  const executeCarryOver = async () => {
    setCarryOverExecuting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/hradmin/leave-balances/carry-over/execute?fromYear=${carryOverFromYear}&toYear=${carryOverToYear}&employeeId=${emp_id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      const data = await res.json();
      if (data.status === "success") {
        // Lưu kết quả để hiển thị summary (created/skipped)
        setCarryOverResult(data.data);
        fetchLeaveBalances(); // reload bảng balance sau khi tạo xong
      }
    } catch (err) {
      console.error("Error executing carry-over:", err);
    } finally {
      setCarryOverExecuting(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Leave Balance Configuration</h2>
        <div className="flex gap-2">
          {/* Nút trigger bulk carry-over: dùng cuối năm để chuyển số dư sang năm mới */}
          <button
            onClick={() => { resetCarryOverModal(); setShowCarryOverModal(true); }}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">autorenew</span>
            Year-End Carry Over
          </button>
          <button
            onClick={handleAddBalance}
            className="px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Configure Leave Balance
          </button>
        </div>
      </div>

      {/* Leave Balances Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Policy</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Year</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase text-slate-500">Entitled</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase text-slate-500">Carried Over</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase text-slate-500">Adjusted</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase text-slate-500">Used</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase text-slate-500">Pending</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase text-slate-500">Remaining</th>
                <th className="px-6 py-3 text-center text-xs font-bold uppercase text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : leaveBalances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    No leave balance configured for this employee. Click "Configure Leave Balance" to add.
                  </td>
                </tr>
              ) : (
                leaveBalances.map((balance) => (
                  <tr key={balance.balanceId} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm">{balance.policyName}</div>
                      <div className="text-xs text-slate-500">{balance.policyCode}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{balance.year}</td>
                    <td className="px-6 py-4 text-right text-sm">{balance.entitledDays}</td>
                    <td className="px-6 py-4 text-right text-sm">{balance.carriedOverDays}</td>
                    <td className="px-6 py-4 text-right text-sm">{balance.adjustedDays}</td>
                    <td className="px-6 py-4 text-right text-sm">{balance.usedDays}</td>
                    <td className="px-6 py-4 text-right text-sm">{balance.pendingDays}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-primary">{balance.remainingDays}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEditBalance(balance)}
                        className="text-slate-500 hover:text-primary p-1"
                        title="Edit leave balance"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Balance Config Modal */}
      {showBalanceModal && (
        <LeaveBalanceConfigModal
          isOpen={showBalanceModal}
          onClose={() => {
            setShowBalanceModal(false);
            setSelectedBalance(null);
          }}
          balanceData={selectedBalance}
          employeeId={emp_id}
          onSuccess={handleBalanceSuccess}
        />
      )}

      {/* ── Carry-Over Modal ─────────────────────────────────────────────────
          3 phase: (1) chọn năm → (2) xem preview → (3) hiển thị kết quả
          Toàn bộ thao tác batch nằm trong modal này để HR không rời màn hình.
      ──────────────────────────────────────────────────────────────────────── */}
      {showCarryOverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">

            {/* Header modal */}
            <div className="px-6 py-4 border-b bg-teal-50 flex justify-between items-center sticky top-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-teal-600">autorenew</span>
                <h3 className="font-bold text-lg text-teal-800">Year-End Leave Balance Carry Over</h3>
              </div>
              <button
                onClick={() => { setShowCarryOverModal(false); resetCarryOverModal(); }}
                className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Phase 1: chọn fromYear → toYear + nút Preview */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {/* Năm nguồn: lấy remainingDays để carry over */}
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">From Year (nguồn)</label>
                  <input
                    type="number"
                    value={carryOverFromYear}
                    onChange={(e) => { setCarryOverFromYear(parseInt(e.target.value)); setCarryOverPreview(null); }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    min="2020" max="2100"
                  />
                </div>
                <div>
                  {/* Năm đích: sẽ tạo balance mới với carriedOverDays */}
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">To Year (đích)</label>
                  <input
                    type="number"
                    value={carryOverToYear}
                    onChange={(e) => { setCarryOverToYear(parseInt(e.target.value)); setCarryOverPreview(null); }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    min="2020" max="2100"
                  />
                </div>
              </div>

              {/* Nút Preview: gọi API xem trước — không tạo bản ghi thật */}
              {!carryOverResult && (
                <button
                  onClick={fetchCarryOverPreview}
                  disabled={carryOverLoading || carryOverFromYear >= carryOverToYear}
                  className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50"
                >
                  {carryOverLoading
                    ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Loading Preview...</>
                    : <><span className="material-symbols-outlined text-[18px]">preview</span> Preview Carry-Over</>
                  }
                </button>
              )}

              {/* Phase 2: hiển thị preview table */}
              {carryOverPreview && !carryOverResult && (
                <div className="space-y-4">
                  {/* Summary stats: tổng số bản ghi sẽ tạo / bỏ qua */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-lg border">
                      <div className="text-2xl font-bold">{carryOverPreview.totalSource}</div>
                      <div className="text-xs text-slate-500 mt-1">Total Source Records</div>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                      {/* willCreate: số bản ghi mới sẽ được tạo */}
                      <div className="text-2xl font-bold text-teal-700">{carryOverPreview.willCreate}</div>
                      <div className="text-xs text-teal-600 mt-1">Will Create</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      {/* willSkip: bản ghi đã tồn tại năm đích → bỏ qua */}
                      <div className="text-2xl font-bold text-amber-700">{carryOverPreview.willSkip}</div>
                      <div className="text-xs text-amber-600 mt-1">Will Skip (already exist)</div>
                    </div>
                  </div>

                  {/* Bảng chi tiết từng employee+policy */}
                  <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-bold text-slate-500">Emp ID</th>
                          <th className="px-3 py-2 text-left font-bold text-slate-500">Policy</th>
                          <th className="px-3 py-2 text-right font-bold text-slate-500">Remaining</th>
                          <th className="px-3 py-2 text-right font-bold text-slate-500">Carry Over</th>
                          <th className="px-3 py-2 text-center font-bold text-slate-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {carryOverPreview.items?.map((item, idx) => (
                          <tr key={idx} className={`border-b ${item.alreadyExists ? "bg-amber-50/50" : ""}`}>
                            <td className="px-3 py-2">{item.employeeId}</td>
                            <td className="px-3 py-2">{item.policyName}</td>
                            <td className="px-3 py-2 text-right">{item.remainingDays}</td>
                            <td className="px-3 py-2 text-right font-bold text-teal-700">
                              {item.carryOverDays}
                              {/* Đánh dấu nếu bị giới hạn bởi maxCarryOverDays của policy */}
                              {item.cappedBy === "policy_cap" && (
                                <span className="ml-1 text-amber-500 font-normal">(capped)</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {item.alreadyExists
                                ? <span className="text-amber-600 font-bold">Skip</span>
                                : <span className="text-teal-600 font-bold">Create</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Nút Confirm Execute: chỉ hiện sau khi đã xem preview */}
                  <button
                    onClick={executeCarryOver}
                    disabled={carryOverExecuting || carryOverPreview.willCreate === 0}
                    className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-teal-700 disabled:opacity-50"
                  >
                    {carryOverExecuting
                      ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Executing...</>
                      : <><span className="material-symbols-outlined text-[18px]">check_circle</span> Confirm & Execute Carry Over ({carryOverPreview.willCreate} records)</>
                    }
                  </button>
                </div>
              )}

              {/* Phase 3: kết quả sau khi execute thành công */}
              {carryOverResult && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
                    <div>
                      <div className="font-bold text-green-800">Carry Over Completed!</div>
                      {/* Hiển thị tóm tắt: bao nhiêu bản ghi được tạo và bỏ qua */}
                      <div className="text-sm text-green-700 mt-1">
                        Created <strong>{carryOverResult.created}</strong> balance records for {carryOverToYear}
                        {carryOverResult.skipped > 0 && ` • Skipped ${carryOverResult.skipped} (already existed)`}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowCarryOverModal(false); resetCarryOverModal(); }}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg font-bold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
