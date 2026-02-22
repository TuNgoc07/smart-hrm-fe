export default function ReviewExceptionModal({ data, onClose }) {
    if (!data) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
  
        {/* MODAL */}
        <div className="bg-white dark:bg-slate-900 w-full max-w-[800px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
  
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-bold">Review Exception</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
  
          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
  
            {/* EMPLOYEE INFO */}
            <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-xl border">
              <img
                src={data.avatar}
                alt={data.name}
                className="w-16 h-16 rounded-full border object-cover"
              />
              <div>
                <p className="text-lg font-bold">{data.name}</p>
                <p className="text-sm text-slate-500">
                  ID: {data.empId} • {data.department}
                </p>
                <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  Shift Date: {data.date}
                </div>
              </div>
            </div>
  
            {/* ATTENDANCE DATA */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3">
                Original Attendance Data
              </h3>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  
                {/* REPORTED */}
                <DataCard title="Reported Log">
                  <DataRow label="Clock In" value={data.reportedIn} />
                  <DataRow label="Clock Out" value={data.reportedOut} />
                  <DataRow
                    label="Method"
                    value={
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          smartphone
                        </span>
                        {data.method}
                      </span>
                    }
                  />
                </DataCard>
  
                {/* EXPECTED */}
                <DataCard title="Scheduled Shift">
                  <DataRow label="Expected In" value={data.expectedIn} />
                  <DataRow label="Expected Out" value={data.expectedOut} />
                  <DataRow label="Location" value={data.location} />
                </DataCard>
              </div>
            </div>
  
            {/* AI ANALYSIS */}
            {data.aiAnalysis && (
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="bg-primary text-white p-2 rounded-lg">
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">AI Flag Analysis</p>
                    <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                      {data.aiAnalysis}
                    </p>
                  </div>
                </div>
              </div>
            )}
  
            {/* COMMENT */}
            <div>
              <label className="block text-sm font-bold mb-1">
                Reason for Decision <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Enter notes or explanation for this action..."
                className="w-full rounded-lg border px-3 py-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>
  
          {/* FOOTER */}
          <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">
            <button className="flex items-center gap-2 text-slate-500 font-bold hover:bg-slate-100 px-3 py-2 rounded-lg">
              <span className="material-symbols-outlined text-sm">help_outline</span>
              Request Explanation
            </button>
  
            <div className="flex gap-3">
              <button className="px-5 py-2 text-rose-600 font-bold hover:bg-rose-50 rounded-lg">
                Reject
              </button>
              <button className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">
                Approve Exception
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  /* ================= SUB COMPONENTS ================= */
  
  function DataCard({ title, children }) {
    return (
      <div className="p-4 rounded-lg border bg-white space-y-3">
        <p className="text-xs font-bold uppercase text-slate-400">{title}</p>
        {children}
      </div>
    );
  }
  
  function DataRow({ label, value }) {
    return (
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
    );
  }
  