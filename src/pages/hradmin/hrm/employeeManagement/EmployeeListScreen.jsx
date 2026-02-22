import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function EmployeeListScreen() {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
   const navigate = useNavigate();

  const employees = [
    {
      name: "Alexander Wright",
      email: "alex.wright@enterprise.com",
      id: "EMP-4829",
      dept: "Engineering",
      deptStyle: "bg-blue-100 text-blue-800",
      position: "Sr. Backend Engineer",
      manager: "Sarah Jenkins",
      managerAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      status: "Active",
      statusStyle: "bg-green-100 text-green-700",
    },
    {
      name: "Julian Marquez",
      email: "julian.m@enterprise.com",
      id: "EMP-5102",
      dept: "Design",
      deptStyle: "bg-purple-100 text-purple-800",
      position: "UI/UX Designer",
      manager: "Maya Rose",
      managerAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      status: "Probation",
      statusStyle: "bg-amber-100 text-amber-700",
    },
    {
      name: "Robert Vance",
      email: "robert.vance@enterprise.com",
      id: "EMP-2122",
      dept: "Marketing",
      deptStyle: "bg-slate-100 text-slate-700",
      position: "Digital Analyst",
      manager: null,
      avatar: "https://randomuser.me/api/portraits/men/66.jpg",
      status: "Inactive",
      statusStyle: "bg-slate-200 text-slate-600",
    },
  ];

  return (
    <div
      className="max-w-[1440px] mx-auto px-6 py-8 space-y-6"
      onClick={() => setOpenMenuIndex(null)}
    >
      {/* ===== PAGE HEADER ===== */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold">Employee Management</h1>
          <p className="text-slate-500">
            1,250 Total Employees active in the system
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 h-10 border rounded-lg font-bold text-sm">
            Import
          </button>
          <button className="px-4 h-10 border rounded-lg font-bold text-sm">
            Export
          </button>
          <button className="px-6 h-11 bg-primary text-white rounded-lg font-bold">
            Add Employee
          </button>
        </div>
      </div>

      {/* ===== SEARCH & FILTER BAR ===== */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4 flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <label className="relative block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <span className="material-symbols-outlined">search</span>
              </span>
              <input
                type="text"
                placeholder="Search by name, employee ID or corporate email..."
                className="w-full bg-slate-100 border-none rounded-lg py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/50"
              />
            </label>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Dept", value: "All" },
              { label: "Pos", value: "All" },
              { label: "Status", value: "Active" },
              { label: "Type", value: "Full-time" },
            ].map((f) => (
              <button
                key={f.label}
                className="flex items-center gap-2 px-3 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm font-semibold"
              >
                <span className="text-xs font-bold text-slate-500 uppercase">
                  {f.label}:
                </span>
                <span>{f.value}</span>
                <span className="material-symbols-outlined text-slate-400">
                  expand_more
                </span>
              </button>
            ))}

            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:text-primary">
              <span className="material-symbols-outlined">
                filter_list_off
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl border overflow-visibility">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left">Employee</th>
              <th className="px-6 py-4">Employee ID</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Position</th>
              <th className="px-6 py-4">Manager</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {employees.map((emp, i) => (
              <tr key={emp.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => {
                navigate(`/hr/employee-detail/${emp.id}`)
              }}>
                {/* Employee */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar}
                      className="w-10 h-10 rounded-full object-cover"
                      alt={emp.name}
                    />
                    <div>
                      <p className="font-bold">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 font-mono text-slate-500">
                  {emp.id}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${emp.deptStyle}`}
                  >
                    {emp.dept}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {emp.position}
                </td>

                <td className="px-6 py-4">
                  {emp.manager ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={emp.managerAvatar}
                        className="w-6 h-6 rounded-full"
                        alt={emp.manager}
                      />
                      <span className="text-slate-600">
                        {emp.manager}
                      </span>
                    </div>
                  ) : (
                    <span className="italic text-slate-400">
                      None assigned
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-md text-xs font-bold ${emp.statusStyle}`}
                  >
                    {emp.status}
                  </span>
                </td>

                {/* ===== ACTIONS (3 DOT MENU) ===== */}
                <td
                  className="px-6 py-4 text-right relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() =>
                      setOpenMenuIndex(openMenuIndex === i ? null : i)
                    }
                    className="p-2 rounded-lg hover:bg-slate-100"
                  >
                    <span className="material-symbols-outlined">
                      more_vert
                    </span>
                  </button>

                  {openMenuIndex === i && (
                    <div className="absolute right-6 top-12 w-52 bg-white border rounded-xl shadow-lg z-50">
                      <ul className="py-2 text-sm">
                        <li>
                          <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100">
                            <span className="material-symbols-outlined text-slate-500">
                              visibility
                            </span>
                            View Profile
                          </button>
                        </li>

                        <li>
                          <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100">
                            <span className="material-symbols-outlined text-slate-500">
                              edit
                            </span>
                            Edit Info
                          </button>
                        </li>

                        <li>
                          <button className="w-full px-4 py-2 flex items-center gap-3 hover:bg-slate-100">
                            <span className="material-symbols-outlined text-slate-500">
                              sync_alt
                            </span>
                            Assign Department
                          </button>
                        </li>

                        <li className="border-t mt-2">
                          <button className="w-full px-4 py-2 flex items-center gap-3 text-red-600 hover:bg-red-50">
                            <span className="material-symbols-outlined">
                              block
                            </span>
                            Deactivate
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== PAGINATION ===== */}
        <div className="px-6 py-4 flex justify-between items-center border-t bg-slate-50">
          <p className="text-sm text-slate-500">
            Showing <b>1–10</b> of <b>1,250</b> employees
          </p>

          <div className="flex gap-1">
            <button className="w-9 h-9 border rounded-lg">‹</button>
            <button className="w-9 h-9 bg-primary text-white rounded-lg">
              1
            </button>
            <button className="w-9 h-9 border rounded-lg">2</button>
            <button className="w-9 h-9 border rounded-lg">3</button>
            <button className="w-9 h-9 border rounded-lg">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
