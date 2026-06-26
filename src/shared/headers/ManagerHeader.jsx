import { useNavigate } from 'react-router-dom';
import useManagerNotificationPolling from '../../hooks/useManagerNotificationPolling';

export default function ManagerHeader() {
  const navigate = useNavigate();
  const { unreadCount } = useManagerNotificationPolling("all");

  return (
    <header className="h-14 sm:h-16 border-b border-[#e7edf3] dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3">
      
      {/* LEFT: Context */}
      <div className="flex flex-col min-w-0 flex-1">
        <h1 className="text-base sm:text-lg md:text-xl font-black tracking-tight truncate">
          Welcome back, Manager 👋
        </h1>
        <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
          Hiring Manager • Product Design Team
        </p>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        
        {/* Search */}
        <label className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-primary w-48 md:w-64"
            placeholder="Search candidates or team members…"
          />
        </label>

        {/* Icons */}
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={() => navigate('/manager/notifications')}
            className="size-9 sm:size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center relative"
          >
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg sm:text-xl">
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </button>

          <button className="size-9 sm:size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-lg sm:text-xl">
              help_outline
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
