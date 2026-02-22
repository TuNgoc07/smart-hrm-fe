export default function ContractRenewalModal({ data, onClose }) {
    if (!data) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
        {/* MODAL */}
        <div className="bg-white w-full max-w-[600px] rounded-xl shadow-2xl overflow-hidden">
  
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7edf3]">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#0d141b]">
              <span className="material-symbols-outlined text-primary">
                edit_calendar
              </span>
              Extend Contract
            </h2>
  
            <button
              onClick={onClose}
              className="text-[#4c739a] hover:text-[#0d141b]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
  
          {/* CONTENT */}
          <div className="p-6 space-y-6">
  
            {/* INFO BOX */}
            <div className="grid grid-cols-3 gap-4 bg-[#f6f7f8] rounded-lg border border-[#e7edf3] p-4">
              <InfoItem label="Employee" value={data.name} />
              <InfoItem label="Contract ID" value={data.contractID} />
              <InfoItem label="Expiry" value={data.expiry} />
            </div>
  
            {/* FORM */}
            <div className="space-y-4">
  
              {/* NEW END DATE */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0d141b]">
                  New End Date <span className="text-red-500">*</span>
                </label>
  
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a]">
                    calendar_today
                  </span>
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#cfdbe7] focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
  
                <p className="text-xs text-[#4c739a]">
                  Extension must be for at least 3 months (Min: Feb 20, 2024).
                </p>
              </div>
  
              {/* REASON */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-[#0d141b]">
                  Reason for Extension <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain why the contract is being extended (e.g., Performance, Project Continuation)..."
                  className="w-full px-4 py-3 rounded-lg border border-[#cfdbe7] focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                />
              </div>
            </div>
  
            {/* INFO NOTE */}
            <div className="flex gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <span className="material-symbols-outlined text-primary">
                info
              </span>
              <p className="text-xs text-primary leading-relaxed font-medium">
                Extending this contract will trigger an automated update to the
                payroll cycle and benefit eligibility records for{" "}
                <b>{data.name}</b>. Ensure all compliance documents are uploaded to
                the <b>Documents</b> tab after confirmation.
              </p>
            </div>
          </div>
  
          {/* FOOTER */}
          <div className="px-6 py-4 bg-slate-50 border-t border-[#e7edf3] flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-[#0d141b] hover:bg-slate-200"
            >
              Cancel
            </button>
  
            <button
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 active:scale-95 transition"
            >
              Confirm Extension
              <span className="material-symbols-outlined text-sm">
                check_circle
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  /* ========= SUB ========= */
  
  function InfoItem({ label, value }) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#4c739a]">
          {label}
        </span>
        <span className="text-sm font-bold text-[#0d141b]">
          {value}
        </span>
      </div>
    );
  }
  