export default function OrgQuickView({ employee, onClose }) {
    return (
      <aside
        className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l shadow-2xl z-40
          transition-transform duration-300
          ${employee ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Employee Quick View</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
  
        {/* CONTENT */}
        {employee && (
          <div className="flex-1 overflow-y-auto p-8">
  
            {/* AVATAR */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative">
                <img
                  src={employee.avatar}
                  className="size-32 rounded-3xl shadow-xl border-4 border-white"
                />
                <div className="absolute bottom-1 right-1 size-6 bg-green-500 border-4 border-white rounded-full" />
              </div>
  
              <h2 className="mt-6 text-2xl font-bold">{employee.name}</h2>
              <p className="text-primary font-semibold">{employee.title}</p>
            </div>
  
            {/* DETAILS */}
            <div className="space-y-6">
              <InfoRow icon="domain" label="Department" value={employee.department} />
              <InfoRow icon="location_on" label="Location" value={employee.location} />
  
              {employee.reportsTo && (
                <InfoRow
                  icon="supervisor_account"
                  label="Reports to"
                  value={employee.reportsTo}
                  highlight
                />
              )}
            </div>
          </div>
        )}
  
        {/* FOOTER */}
        <div className="p-6 border-t bg-slate-50 flex flex-col gap-3">
          <button className="w-full bg-primary text-white font-bold py-3 rounded-xl">
            View Full Profile
          </button>
          <button className="w-full border py-3 rounded-xl font-bold">
            Contact
          </button>
        </div>
      </aside>
    );
  }
  
  /* ================= SMALL UI ================= */
  
  function InfoRow({ icon, label, value, highlight }) {
    return (
      <div className="flex items-start gap-4">
        <div className="p-2 bg-slate-100 rounded-lg text-[#4c739a]">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div>
          <p className="text-xs uppercase font-bold text-[#4c739a]">{label}</p>
          <p className={`text-sm ${highlight ? "text-primary font-bold" : ""}`}>
            {value}
          </p>
        </div>
      </div>
    );
  }
  