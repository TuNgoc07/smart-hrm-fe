const ADJUSTMENT_TYPES = [
  { value: "LATE_ARRIVAL",     label: "Late Arrival",       icon: "login",        needsOriginal: true,  adjustedLabel: "Correct Check-in Time" },
  { value: "EARLY_DEPARTURE",  label: "Early Departure",    icon: "logout",       needsOriginal: true,  adjustedLabel: "Correct Check-out Time" },
  { value: "MISSING_CHECK_IN", label: "Missing Check-in",   icon: "person_add",   needsOriginal: false, adjustedLabel: "Actual Check-in Time" },
  { value: "MISSING_CHECK_OUT",label: "Missing Check-out",  icon: "person_remove",needsOriginal: false, adjustedLabel: "Actual Check-out Time" },
];

const inputCls = "rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm px-3 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none w-full";

export default function AdjustmentRequestForm({ formData, onChange }) {
  const selected = ADJUSTMENT_TYPES.find(t => t.value === formData.adjustmentType);

  return (
    <div className="space-y-5">
      {/* Adjustment Type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Adjustment Type <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ADJUSTMENT_TYPES.map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => onChange({ ...formData, adjustmentType: type.value, originalTime: "", adjustedTime: "" })}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center text-xs font-bold transition-all ${
                formData.adjustmentType === type.value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary/40"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date + Time fields — only show when type selected */}
      {selected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Attendance Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={formData.adjustmentDate || ""}
              onChange={(e) => onChange({ ...formData, adjustmentDate: e.target.value })}
              className={inputCls}
            />
          </div>

          {selected.needsOriginal && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Original Time</label>
              <input
                type="time"
                value={formData.originalTime || ""}
                onChange={(e) => onChange({ ...formData, originalTime: e.target.value })}
                className={inputCls}
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {selected.adjustedLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              value={formData.adjustedTime || ""}
              onChange={(e) => onChange({ ...formData, adjustedTime: e.target.value })}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {/* Summary badge */}
      {selected && formData.adjustmentDate && formData.adjustedTime && (
        <div className="flex items-center gap-2 text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-base">info</span>
          <span>
            <strong>{selected.label}</strong> on <strong>{formData.adjustmentDate}</strong>
            {selected.needsOriginal && formData.originalTime && <> — from <strong>{formData.originalTime}</strong></>}
            {" "}→ <strong>{formData.adjustedTime}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
