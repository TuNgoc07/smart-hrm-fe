export default function FilesTab() {
    return (
      <div className="mt-6 space-y-6">
        {/* ===== FILES HEADER ===== */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    folder_open
                  </span>
                  Files & Documents
                </h3>
                <p className="text-xs text-slate-500">
                  Manage and access employee records and related documents.
                </p>
              </div>
  
              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-64">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                    search
                  </span>
                  <input
                    className="w-full bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-primary/20"
                    placeholder="Search documents..."
                  />
                </div>
  
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/90">
                  <span className="material-symbols-outlined text-[18px]">
                    upload
                  </span>
                  Upload Document
                </button>
              </div>
            </div>
  
            {/* ===== CATEGORY FILTER ===== */}
            <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
              {[
                "All Files",
                "CV & Resume",
                "Contracts",
                "Decisions",
                "Certificates",
                "ID Cards",
              ].map((item, idx) => (
                <button
                  key={item}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap
                    ${
                      idx === 0
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
  
          {/* ===== TABLE ===== */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <Th>Document Name</Th>
                  <Th>Category</Th>
                  <Th>Uploaded Date</Th>
                  <Th>Uploaded By</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
  
              <tbody className="divide-y">
                <FileRow
                  icon="picture_as_pdf"
                  iconBg="bg-red-50 text-red-600"
                  name="Curriculum_Vitae_NguyenVanA.pdf"
                  size="2.4 MB"
                  category="CV"
                  categoryColor="bg-blue-100 text-blue-700"
                  date="Oct 12, 2021"
                  user="Admin Jane"
                />
  
                <FileRow
                  icon="description"
                  iconBg="bg-blue-50 text-blue-600"
                  name="Labor_Contract_2024_NV1234.docx"
                  size="1.1 MB"
                  category="Contract"
                  categoryColor="bg-purple-100 text-purple-700"
                  date="Oct 16, 2024"
                  user="Admin Jane"
                />
  
                <FileRow
                  icon="verified"
                  iconBg="bg-amber-50 text-amber-600"
                  name="Promotion_Decision_Sr_Designer.pdf"
                  size="850 KB"
                  category="Decision"
                  categoryColor="bg-amber-100 text-amber-700"
                  date="Jan 01, 2024"
                  user="System"
                  system
                />
  
                <FileRow
                  icon="school"
                  iconBg="bg-green-50 text-green-600"
                  name="Master_Design_Degree.pdf"
                  size="4.2 MB"
                  category="Certificate"
                  categoryColor="bg-green-100 text-green-700"
                  date="Oct 12, 2021"
                  user="Admin Jane"
                />
              </tbody>
            </table>
          </div>
  
          {/* ===== FOOTER ===== */}
          <div className="p-4 bg-slate-50 border-t flex items-center justify-between">
            <p className="text-xs text-slate-500">Showing 4 of 4 documents</p>
  
            <div className="flex items-center gap-1">
              <button className="p-1 text-slate-400" disabled>
                <span className="material-symbols-outlined text-[18px]">
                  chevron_left
                </span>
              </button>
              <button className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-primary text-white rounded">
                1
              </button>
              <button className="p-1 text-slate-400" disabled>
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
  
        {/* ===== META ===== */}
        <div className="flex flex-col sm:flex-row justify-between text-xs text-slate-500">
          <p>
            Last activity: Document uploaded 2 hours ago by{" "}
            <span className="font-bold text-slate-900">Admin Jane Doe</span>
          </p>
          <p>Storage used: 8.8 MB of 100 MB</p>
        </div>
      </div>
    );
  }
  
  /* ====== HELPERS ====== */
  
  function Th({ children, align }) {
    return (
      <th
        className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${
          align === "right" ? "text-right" : ""
        }`}
      >
        {children}
      </th>
    );
  }
  
  function FileRow({
    icon,
    iconBg,
    name,
    size,
    category,
    categoryColor,
    date,
    user,
    system,
  }) {
    return (
      <tr className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}
            >
              <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div>
              <p className="text-sm font-bold">{name}</p>
              <p className="text-[11px] text-slate-500">{size}</p>
            </div>
          </div>
        </td>
  
        <td className="px-6 py-4">
          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${categoryColor}`}
          >
            {category}
          </span>
        </td>
  
        <td className="px-6 py-4 text-sm text-slate-500">{date}</td>
  
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            {system ? (
              <div className="h-6 w-6 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold">
                SYS
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold" > AD </div>
            )}
            <span className="text-sm">{user}</span>
          </div>
        </td>
  
        <td className="px-6 py-4 text-right">
          <div className="flex justify-end gap-1">
            {["visibility", "download", "delete"].map((i) => (
              <button
                key={i}
                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {i}
                </span>
              </button>
            ))}
          </div>
        </td>
      </tr>
    );
  }
  