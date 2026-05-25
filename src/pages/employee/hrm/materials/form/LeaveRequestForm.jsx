import { useState, useEffect } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function LeaveRequestForm({ formData, onChange, employeeId }) {
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [remainingDays, setRemainingDays] = useState(null);
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

  const selectedPolicy = policies.find(t => t.policyType === formData.leaveType);

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
            value: p.policyType,
            label: p.policyName
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

  // Load balance khi chọn leave type
  useEffect(() => {
    const loadBalance = async () => {
      if (!formData.leaveType || !selectedPolicy) {
        setRemainingDays(null);
        setSplitPreview(null);
        return;
      }

      setLoadingBalance(true);
      try {
        const empId = getEmployeeId();
        if (!empId) return;

        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        };

        const res = await fetch(
          `${API_BASE_URL}/api/employee/leave-balance?employeeId=${empId}&policyId=${selectedPolicy.policyId}`,
          { headers }
        );
        const data = await res.json();

        if (data.status === 'success') {
          setRemainingDays(data.remainingDays);
        } else if (data.status === 'not_found') {
          setRemainingDays(0);
        } else {
          setRemainingDays(0);
        }
      } catch (err) {
        console.error('Error loading balance:', err);
        setRemainingDays(0);
      } finally {
        setLoadingBalance(false);
      }
    };

    loadBalance();
  }, [formData.leaveType, selectedPolicy, employeeId]);

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
    if (remainingDays !== null && formData.duration > remainingDays) {
      const unpaidDays = formData.duration - remainingDays;
      setSplitPreview({
        paidDays: remainingDays,
        unpaidDays: unpaidDays,
      });
    } else {
      setSplitPreview(null);
    }
  }, [formData.duration, remainingDays]);

  // Khi chọn leave type, cập nhật policyId trong formData
  const handleLeaveTypeChange = (e) => {
    const newValue = e.target.value;
    const policy = policies.find(t => t.value === newValue);
    onChange({ ...formData, leaveType: newValue, policyId: policy?.policyId });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Leave Type</label>
        <select
          value={formData.leaveType}
          onChange={handleLeaveTypeChange}
          disabled={loadingPolicies}
          className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        >
          <option value="">{loadingPolicies ? 'Loading...' : 'Select leave type'}</option>
          {policies.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Leave Balance</label>
        <div className="h-10 px-3 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {loadingBalance ? 'Loading...' : remainingDays !== null ? `${remainingDays} Days Available` : "Select a leave type"}
        </div>
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

      {/* Auto-split Warning */}
      {splitPreview && (
        <div className="md:col-span-2 mt-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">warning</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">Balance không đủ</p>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Bạn chỉ còn <strong>{splitPreview.paidDays} ngày</strong> {selectedPolicy?.label}.{' '}
                <strong>{splitPreview.unpaidDays} ngày</strong> còn lại sẽ tự động chuyển sang <strong>Unpaid Leave</strong> và bị trừ lương.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
