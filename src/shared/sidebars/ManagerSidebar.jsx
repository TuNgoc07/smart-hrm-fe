import { useNavigate } from "react-router-dom";

export default function ManagerSidebar() {
  const navigate = useNavigate();
  return (
    <aside className="w-64 border-r border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col h-screen sticky top-0">

      {/* TOP */}
      <div className="p-6">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="size-8 bg-primary rounded flex items-center justify-center text-white">
            <span className="material-symbols-outlined">dataset</span>
          </div>
          <h2 className="font-bold text-lg tracking-tight">
            SmartOps
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          <SidebarItem icon="home" label="Home" act="home" navigate={navigate} />
          <SidebarItem icon="group" label="Team & Hiring" active act="team" navigate={navigate} />
          <SidebarItem icon="person_add" label="ATS Pipeline" act="ats" navigate={navigate} />
          <SidebarItem icon="inbox" label="Notifications / Inbox" act="notifications" navigate={navigate} />
          <SidebarItem icon="auto_awesome" label="Insights" act="insights" navigate={navigate} />
        </nav>
      </div>

      {/* BOTTOM */}
      <div className="mt-auto p-4 border-t border-[#e7edf3] dark:border-slate-800">

        {/* Profile */}
        <div className="flex items-center gap-3 p-2">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-slate-200"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBVxZzX7pP_4nYQDa2dinbsaKILKxLyIq-ktE8drlfI-9fk-IQoxVb9AMkxzEdZ1w8v3N9R7HNgZdtDZ9GbmcXSpyA8Mir8fo5vYbLaV9YXVu-EnmDnB9hZUCcyp7g_7OOWcBsICACg9JXo93ticAPgiBeTwCPwvSWMaz87tVjIFX32mJGLCFl91gBazUD9paUiLkJMvnqBjSSHSUj2vvhioXYWuuG7e0HwF4Q9EXEJyvhOpaoYCz5ya4l4gI2qrblXgMAM_f5HCTA")',
            }}
          />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold leading-none">
              Alex Morgan
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Line / Hiring Manager
            </p>
          </div>
        </div>

        {/* Team Context */}
        <button className="w-full mt-4 flex items-center justify-center gap-2 rounded-lg h-10 bg-primary text-white text-xs font-bold transition-opacity hover:opacity-90">
          Product Design Team
        </button>
      </div>
    </aside>
  );
}

/* Small helper */
function SidebarItem({ icon, label, active, navigate, act }) {
  return (
    <button
      onClick={() => navigate(`/manager/${act}`)}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors
      ${active
          ? "bg-primary/10 text-primary font-bold"
          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
        }`}
    >
      <span className="material-symbols-outlined">
        {icon}
      </span>
      <p className="text-sm">{label}</p>
    </button>
  );
}
