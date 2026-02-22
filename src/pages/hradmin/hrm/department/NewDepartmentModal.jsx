export default function NewDepartmentModal({ onClose }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="w-full max-w-[560px] bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* HEADER */}
          <div className="px-6 py-5 border-b bg-slate-50 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold">Add Department</h2>
              <p className="text-sm text-slate-500">
                Define a new organizational unit within the company.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-slate-500">
                close
              </span>
            </button>
          </div>
  
          {/* BODY */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* NAME & CODE */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Department Name" required placeholder="e.g. Quality Assurance" />
              <Input label="Department Code" required placeholder="e.g. QA-04" />
            </div>
  
            {/* MANAGER */}
            <div className="space-y-2">
              <Label>Department Manager</Label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  className="w-full h-11 pl-11 pr-4 border rounded-lg text-sm focus:ring-1 focus:ring-primary"
                  placeholder="Search employee by name or ID"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  expand_more
                </span>
              </div>
            </div>
  
            {/* PARENT */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Parent Department</Label>
                <span className="text-[10px] uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-400 font-bold">
                  Optional
                </span>
              </div>
              <div className="relative">
                <select className="w-full h-11 border rounded-lg px-4 text-sm focus:ring-1 focus:ring-primary appearance-none">
                  <option>None (Top Level)</option>
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>Operations</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>
  
            {/* DESCRIPTION */}
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                rows={3}
                className="w-full border rounded-lg p-4 text-sm focus:ring-1 focus:ring-primary resize-none"
                placeholder="Briefly describe the department's core responsibilities and objectives..."
              />
            </div>
          </div>
  
          {/* FOOTER */}
          <div className="px-6 py-5 border-t bg-slate-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 h-11 rounded-lg border font-bold text-sm hover:bg-slate-100"
            >
              Cancel
            </button>
            <button className="px-6 h-11 rounded-lg bg-primary text-white font-bold flex items-center gap-2 hover:bg-blue-600">
              <span className="material-symbols-outlined">check_circle</span>
              Create Department
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  /* ===== SMALL COMPONENTS ===== */
  
  function Label({ children }) {
    return <label className="text-sm font-bold">{children}</label>;
  }
  
  function Input({ label, required, placeholder }) {
    return (
      <div className="space-y-2">
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <input
          className="w-full h-11 border rounded-lg px-4 text-sm focus:ring-1 focus:ring-primary"
          placeholder={placeholder}
        />
      </div>
    );
  }
  