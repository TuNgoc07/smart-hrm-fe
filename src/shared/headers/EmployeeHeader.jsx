import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export default function EmployeeHeader() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { unreadCount } = useNotifications();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-white/80 dark:bg-[#16222e]/80 backdrop-blur-md border-b border-[#e7edf3] dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0 flex-1">
                {/* Mobile menu button */}
                <button 
                    onClick={toggleMobileMenu}
                    className="md:hidden p-2 text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <span className="text-xs sm:text-sm text-[#4c739a] font-medium truncate">Employee Dashboard</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
                <button
                    onClick={() => navigate('/employee/notifications')}
                    className="relative p-2 text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-lg sm:text-xl">notifications</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                    )}
                </button>
                <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-[#e7edf3] dark:border-slate-800 cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-[#0d141b] dark:text-white">John Doe</p>
                        <p className="text-[10px] text-[#4c739a] font-semibold uppercase">Senior Analyst</p>
                    </div>
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-center bg-cover border-2 border-white dark:border-slate-700 flex-shrink-0" alt="Profile photo of John Doe" style={{backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBrIAaT6xjPP54FFP_LX_TZqtTzjvlsAy4ClDJrRQ8plQ7jbSBH9_jEGfuowHthMDE7ipXujPBDvLuOo3R9XNZbZeAB2TSPUid2heydjsh2LvhFI9kvVx2tx6RBxFMLmlSMKKRzSs7haItji7wWBo2dPlhcxt_9FNi11Mjzz3sQDjDn6omVuAZrfwp6ttHm1-yH1T7UJ9LLCG5WrvEHcmfK-7oQz_5plFhET4NUBaM2_owQGiHTIq64O0qqNB7DRVbNz_7wxdOEh6M")`}}></div>
                </div>
            </div>
        </header>
    );
}