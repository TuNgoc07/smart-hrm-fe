import { useNavigate } from 'react-router-dom';
import useHrAdminNotificationPolling from '../../hooks/useHrAdminNotificationPolling';

export default function HRHeader() {
    const navigate = useNavigate();
    const { unreadCount } = useHrAdminNotificationPolling("all");

    return (
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b px-4 sm:px-6 md:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center gap-3">
          <div className="relative max-w-xs sm:max-w-md md:max-w-xl w-full flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm"
              placeholder="Search employees, documents, or apps..."
            />
          </div>
  
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            <button
                onClick={() => navigate('/hr/notifications')}
                className="relative p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                )}
            </button>
            <span className="material-symbols-outlined hidden sm:block cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full p-2 transition-colors">help</span>
  
            <img
              className="w-8 h-8 rounded-full flex-shrink-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAummvz8S57QX0W6ckuVRwnqQuBTBuGHr_-TEnAbR7VetwvZiWyvisVJvlBFZ7KYMt9yvlWPf7V3e56SNLKAWE1diMQKyrzd099Ycasr8d-48mkZ61Vw8FaTxC6X2q5-ZDMXJLxpiz09kjWkqD11ElQXPBLaowxe993Jwbtkr6QA6-q7D9Iq-z1JHSw33RaJYadD6JVg5E29R2VOhB2UtAfF9l1titg2C84sgYAI1760a4UiQAAeo6wxVd6t3nOtYV1v4UxFB1OUgU"
            />
          </div>
        </div>
      </header>
    );
  }
  