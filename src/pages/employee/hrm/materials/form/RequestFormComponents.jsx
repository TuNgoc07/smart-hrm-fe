export function FormHeader({ stepNumber, title }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-[10px] font-bold tracking-tighter">{stepNumber}</span>
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
  );
}

export function CalculatedDuration({ duration }) {
  return (
    <div className="p-3 bg-primary/5 rounded-lg flex items-center justify-between border border-primary/20">
      <div className="flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined text-xl">calendar_today</span>
        <span className="text-sm font-bold uppercase tracking-wide">Calculated Duration</span>
      </div>
      <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
        {duration || "0 Days"}
      </span>
    </div>
  );
}

export function CalculatedOTHours({ hours }) {
  return (
    <div className="p-3 bg-primary/5 rounded-lg flex items-center justify-between border border-primary/20">
      <div className="flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined text-xl">schedule</span>
        <span className="text-sm font-bold uppercase tracking-wide">Calculated Hours</span>
      </div>
      <span className="bg-primary text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
        {hours || "0 Hours"}
      </span>
    </div>
  );
}

export function ReasonTextarea({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Reason / Justification</label>
      <textarea
        value={value}
        onChange={onChange}
        className="rounded-lg border-slate-200 dark:border-slate-800 dark:bg-slate-950 text-sm focus:ring-primary focus:border-primary"
        placeholder="Please provide a brief explanation for your request..."
        rows={4}
      />
    </div>
  );
}

export function AttachmentUpload() {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Attachments (Optional)</label>
      <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-slate-500 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all cursor-pointer">
        <span className="material-symbols-outlined text-4xl mb-2">upload_file</span>
        <p className="text-sm font-bold">Click or drag to upload</p>
        <p className="text-xs">PDF, JPG, PNG (Max 5MB)</p>
      </div>
    </div>
  );
}
