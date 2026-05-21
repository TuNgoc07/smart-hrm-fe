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

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Leave Balance Configuration</h2>
        <button
          onClick={handleAddBalance}
          className="px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Configure Leave Balance
        </button>
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
    </div>
  );
}
