import {useState} from 'react';
const MOCK_DATA = {
  adjustmentTypes: [
    { value: "LATE_ARRIVAL", label: "Late Arrival" },
    { value: "EARLY_DEPARTURE", label: "Early Departure" },
    { value: "MISSING_CHECK_IN", label: "Missing Check-in" },
    { value: "MISSING_CHECK_OUT", label: "Missing Check-out" }
  ]
};

export default function AdjustmentRequestForm({ formData, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Adjustment Type</label>
        <select
          value={formData.adjustmentType}
          onChange={(e) => onChange({ ...formData, adjustmentType: e.target.value })}
          className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        >
          <option value="">Select adjustment type</option>
          {MOCK_DATA.adjustmentTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date</label>
        <input
          type="date"
          value={formData.adjustmentDate}
          onChange={(e) => onChange({ ...formData, adjustmentDate: e.target.value })}
          className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Original Time</label>
        <input
          type="time"
          value={formData.originalTime}
          onChange={(e) => onChange({ ...formData, originalTime: e.target.value })}
          className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Adjusted Time</label>
        <input
          type="time"
          value={formData.adjustedTime}
          onChange={(e) => onChange({ ...formData, adjustedTime: e.target.value })}
          className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        />
      </div>
    </div>
  );
}
