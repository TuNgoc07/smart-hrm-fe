export default function NewPositionModal({ open, onClose }) {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        {/* MODAL */}
        <div className="bg-white w-full max-w-[720px] rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
  
          {/* HEADER */}
          <div className="flex items-center justify-between px-8 py-6 border-b">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Add New Position
              </h2>
              <p className="text-sm text-slate-500">
                Create a structured role within the organization hierarchy.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
  
          {/* BODY */}
          <div className="overflow-y-auto p-8">
            <form className="space-y-6">
  
              {/* ROW 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Position Name"
                  placeholder="e.g., Senior Software Engineer"
                />
                <Input
                  label="Position Code (Unique)"
                  placeholder="e.g., POS-1024"
                  uppercase
                  info
                />
              </div>
  
              {/* ROW 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                  label="Department"
                  placeholder="Select Department"
                  options={[
                    "Engineering",
                    "Product Management",
                    "Data Science",
                    "Operations",
                    "Human Resources",
                  ]}
                />
                <Select
                  label="Level / Grade"
                  placeholder="Choose Grade"
                  options={[
                    "Junior (L1)",
                    "Middle (L2)",
                    "Senior (L3)",
                    "Lead (L4)",
                    "Staff / Principal (L5)",
                    "Manager (M1)",
                  ]}
                />
              </div>
  
              {/* DESCRIPTION */}
              <Textarea
                label="Description"
                placeholder="Outline the core responsibilities and expectations for this role..."
              />
  
              {/* CAREER PATH */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold">
                    Career Path / Next Position
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    OPTIONAL
                  </span>
                </div>
  
                <select className="w-full h-12 rounded-lg border bg-white px-4 text-sm">
                  <option>None defined</option>
                  <option>Lead Software Engineer</option>
                  <option>Engineering Manager</option>
                  <option>Product Director</option>
                </select>
  
                <p className="text-xs text-slate-400">
                  Linking a next position helps in succession planning and employee
                  development maps.
                </p>
              </div>
            </form>
          </div>
  
          {/* FOOTER */}
          <div className="px-8 py-6 bg-slate-50 border-t flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button className="px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                save
              </span>
              Save Position
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  /* ====== SUB COMPONENTS ====== */
  
  function Input({ label, placeholder, uppercase, info }) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold">{label}</label>
        <div className="relative">
          <input
            placeholder={placeholder}
            className={`w-full h-12 rounded-lg border bg-white px-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${
              uppercase ? "uppercase pr-10" : ""
            }`}
          />
          {info && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <span className="material-symbols-outlined text-[20px]">
                info
              </span>
            </span>
          )}
        </div>
      </div>
    );
  }
  
  function Select({ label, options, placeholder }) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold">{label}</label>
        <select className="w-full h-12 rounded-lg border bg-white px-4 text-sm">
          <option disabled selected>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }
  
  function Textarea({ label, placeholder }) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold">{label}</label>
        <textarea
          rows={4}
          placeholder={placeholder}
          className="w-full rounded-lg border bg-white p-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    );
  }
  