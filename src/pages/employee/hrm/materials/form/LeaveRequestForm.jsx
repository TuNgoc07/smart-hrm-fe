import {useState} from 'react';
const MOCK_DATA = {
  leaveTypes: [
    { value: "ANNUAL", label: "Annual Leave", balance: 12 },
    { value: "MEDICAL", label: "Medical Leave", balance: 5 },
    { value: "PERSONAL", label: "Personal Leave", balance: 3 },
    { value: "COMPENSATORY", label: "Compensatory Off", balance: 2 }
  ]
};

export default function LeaveRequestForm({ formData, onChange }) {
  const selectedLeaveType = MOCK_DATA.leaveTypes.find(t => t.value === formData.leaveType);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Leave Type</label>
        <select
          value={formData.leaveType}
          onChange={(e) => onChange({ ...formData, leaveType: e.target.value })}
          className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        >
          <option value="">Select leave type</option>
          {MOCK_DATA.leaveTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Leave Balance</label>
        <div className="h-10 px-3 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          {selectedLeaveType ? `${selectedLeaveType.balance} Days Available` : "Select a leave type"}
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
    </div>
  );
}
