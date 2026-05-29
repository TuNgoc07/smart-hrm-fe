import { useState, useEffect } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function LeaveRequestForm({ formData, onChange, employeeId }) {
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [balanceInfo, setBalanceInfo] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [splitPreview, setSplitPreview] = useState(null);

  const DURATION_UNITS = [
    { value: 'full_day', label: 'Full Day' },
    { value: 'half_am', label: 'Half Day (Morning)' },
    { value: 'half_pm', label: 'Half Day (Afternoon)' }
  ];

  // Get employeeId from JWT if not provided
  const getEmployeeId = () => {
    if (employeeId) return employeeId;
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.employeeId || payload.sub || null;
    } catch {
      return null;
    }
  };

  const selectedPolicy = policies.find(t => t.policyId === formData.policyId);

  // Load policies on mount
  useEffect(() => {
    const loadPolicies = async () => {
      setLoadingPolicies(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/leave-policies`, { headers: authHeaders() });
        const json = await res.json();
        if (json.status === 'success') {
          const mapped = json.data.map(p => ({
            policyId: p.policyId,
            value: p.leaveType,
            label: p.policyName,
            deductBalance: p.deductBalance
          }));
          setPolicies(mapped);
        }
      } catch (err) {
        console.error('Error loading policies:', err);
      } finally {
        setLoadingPolicies(false);
      }
    };
    loadPolicies();
  }, []);

  // Load balance khi chọn leave type (chỉ cho policy có deductBalance = 1)
  useEffect(() => {
    const loadBalance = async () => {
      if (!formData.policyId || !selectedPolicy) {
        setBalanceInfo(null);
        setSplitPreview(null);
        return;
      }

      // Không check balance cho loại không trừ balance (Maternity, Unpaid Leave)
      if (selectedPolicy.deductBalance !== 1) {
        setBalanceInfo(null);
        setSplitPreview(null);
        return;
      }

      setLoadingBalance(true);
      try {
        const currentYear = new Date().getFullYear();
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        };

        const res = await fetch(
          `${API_BASE_URL}/api/employee/my-leave-balances?year=${currentYear}`,
          { headers }
        );
        const data = await res.json();

        if (data.status === 'success' && data.data && data.data.data) {
          // Find the balance entry matching the selected policyId
          const balanceEntry = data.data.data.find(b => b.policyId === selectedPolicy.policyId);
          if (balanceEntry) {
            setBalanceInfo(balanceEntry);
          } else {
            setBalanceInfo(null);
          }
        } else {
          setBalanceInfo(null);
        }
      } catch (err) {
        console.error('Error loading balance:', err);
        setBalanceInfo(null);
      } finally {
        setLoadingBalance(false);
      }
    };

    loadBalance();
  }, [formData.policyId, selectedPolicy]);

  // Calculate duration from startDate and endDate
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = end - start;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end dates

      // Adjust for half-day units
      let finalDuration = diffDays > 0 ? diffDays : 0;
      if (formData.durationUnit === 'half_am' || formData.durationUnit === 'half_pm') {
        finalDuration = 0.5;
      }

      onChange({ ...formData, duration: finalDuration });
    }
  }, [formData.startDate, formData.endDate, formData.durationUnit]);

  // Check auto-split khi duration thay đổi
  useEffect(() => {
    if (balanceInfo && formData.duration > balanceInfo.remainingDays) {
      const unpaidDays = formData.duration - balanceInfo.remainingDays;
      setSplitPreview({
        paidDays: balanceInfo.remainingDays,
        unpaidDays: unpaidDays,
        requestedDays: formData.duration,
      });
    } else {
      setSplitPreview(null);
    }
  }, [formData.duration, balanceInfo]);

  // Khi chọn leave type, cập nhật policyId và leaveType trong formData
  const handleLeaveTypeChange = (e) => {
    const selectedPolicyId = parseInt(e.target.value);
    const policy = policies.find(t => t.policyId === selectedPolicyId);
    onChange({ ...formData, leaveType: policy?.value || '', policyId: selectedPolicyId || null });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Leave Type</label>
        <select
          value={formData.policyId || ''}
          onChange={handleLeaveTypeChange}
          disabled={loadingPolicies}
          className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        >
          <option value="">{loadingPolicies ? 'Loading...' : 'Select leave type'}</option>
          {policies.map(type => (
            <option key={type.policyId} value={type.policyId}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Leave Balance</label>
        {!selectedPolicy ? (
          <div className="h-10 px-3 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Select a leave type
          </div>
        ) : selectedPolicy.deductBalance !== 1 ? (
          <div className="h-10 px-3 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            N/A — No balance required
          </div>
        ) : loadingBalance ? (
          <div className="h-10 px-3 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Loading...
          </div>
        ) : balanceInfo ? (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">account_balance_wallet</span>
              <h4 className="font-semibold text-blue-800 dark:text-blue-300">Số ngày nghỉ còn lại</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">Tổng quyền lợi</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{balanceInfo.entitledDays || 0} ngày</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">Đã sử dụng</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{balanceInfo.usedDays || 0} ngày</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">Đang chờ duyệt</p>
                <p className="font-bold text-amber-600 dark:text-amber-400">{balanceInfo.pendingDays || 0} ngày</p>
              </div>
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-xs mb-1">Còn lại</p>
                <p className="font-bold text-green-600 dark:text-green-400 text-lg">{balanceInfo.remainingDays || 0} ngày</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-10 px-3 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            N/A
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Start Date</label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) => onChange({ ...formData, startDate: e.target.value })}
          className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">End Date</label>
        <input
          type="date"
          value={formData.endDate}
          onChange={(e) => onChange({ ...formData, endDate: e.target.value })}
          className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Duration (Days)</label>
        <div className="h-10 px-3 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {formData.duration > 0 ? `${formData.duration} day(s)` : "Select start and end dates"}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Duration Unit</label>
        <select
          value={formData.durationUnit || 'full_day'}
          onChange={(e) => onChange({ ...formData, durationUnit: e.target.value })}
          className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        >
          {DURATION_UNITS.map(unit => (
            <option key={unit.value} value={unit.value}>{unit.label}</option>
          ))}
        </select>
      </div>

      {/* Auto-split Warning: chỉ hiển khi policy có deductBalance = 1 */}
      {splitPreview && selectedPolicy?.deductBalance === 1 && (
        <div className="md:col-span-2 mt-2 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full flex-shrink-0">
              <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-2xl">error</span>
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">warning</span>
                Cảnh báo: Vượt quá số ngày nghỉ còn lại
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mb-2 border border-red-200 dark:border-red-800">
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  Bạn đang xin nghỉ <strong className="text-red-600 dark:text-red-400">{splitPreview.requestedDays} ngày</strong> nhưng chỉ còn <strong className="text-amber-600 dark:text-amber-400">{splitPreview.paidDays} ngày</strong> có lương.
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Có lương (Paid)</p>
                      <p className="font-bold text-green-600 dark:text-green-400">{splitPreview.paidDays} ngày</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600 text-lg">cancel</span>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Không lương (Unpaid)</p>
                      <p className="font-bold text-red-600 dark:text-red-400">{splitPreview.unpaidDays} ngày</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                ⚠️ Phần unpaid sẽ bị trừ trực tiếp vào lương tháng này
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
