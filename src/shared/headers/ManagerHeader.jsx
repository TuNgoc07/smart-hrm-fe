export default function ManagerHeader() {
  return (
    <header className="h-16 border-b border-[#e7edf3] dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
      
      {/* LEFT: Context */}
      <div className="flex flex-col">
        <h1 className="text-xl font-black tracking-tight">
          Welcome back, Alex 👋
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Hiring Manager • Product Design Team
        </p>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Search */}
        <label className="relative hidden lg:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary w-64"
            placeholder="Search candidates or team members…"
          />
        </label>

        {/* Icons */}
        <div className="flex gap-2">
          <button className="size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center relative">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
              notifications
            </span>
            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark" />
          </button>

          <button className="size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
              help_outline
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
