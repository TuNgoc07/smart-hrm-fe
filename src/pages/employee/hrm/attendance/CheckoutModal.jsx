export default function CheckoutModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <div className="bg-white dark:bg-[#16222e] w-full max-w-md rounded-2xl shadow-2xl border border-[#e7edf3] dark:border-slate-800 overflow-hidden">
                <div className="px-8 pt-8 pb-2 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="bg-primary/10 text-primary p-3 rounded-full">
                            <span className="material-symbols-outlined text-3xl">logout</span>
                        </div>
                    </div>
                    <h2 className="text-[#0d141b] dark:text-white text-2xl font-extrabold tracking-tight">Attendance Check-out</h2>
                    <p className="text-[#4c739a] font-semibold mt-1">Tuesday, Oct 24, 2023</p>
                </div>
                <div className="px-8 py-2">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl py-8 px-4 border border-slate-100 dark:border-slate-700/50 text-center mb-6">
                        <div className="text-[#0d141b] dark:text-white text-5xl font-extrabold tracking-tighter tabular-nums">
                            06:05:12 <span className="text-2xl font-bold text-primary ml-1">PM</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#4c739a] mt-2">Current System Time</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-sm text-emerald-500">login</span>
                                <span className="text-[10px] font-bold text-[#4c739a] uppercase tracking-wide">Checked-in</span>
                            </div>
                            <p className="text-sm font-bold text-[#0d141b] dark:text-white">09:00 AM</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 rounded-xl p-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-sm text-primary">timer</span>
                                <span className="text-[10px] font-bold text-[#4c739a] uppercase tracking-wide">Duration</span>
                            </div>
                            <p className="text-sm font-bold text-[#0d141b] dark:text-white">9h 05m</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 p-2 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 mb-8">
                        <div className="flex items-center gap-2 text-sm text-[#4c739a]">
                            <span className="text-base">📍</span>
                            <span className="font-medium">Head Office - HCM</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#4c739a]">
                            <span className="text-base">🌐</span>
                            <span className="font-medium">IP: 115.78.x.x</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                            CONFIRM CHECK-OUT
                        </button>
                        <button 
                        onClick = {onClose}
                        className="w-full py-2 text-[#4c739a] hover:text-[#0d141b] dark:hover:bg-white font-bold text-sm transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
                <div className="px-8 py-2 bg-slate-50 dark:bg-slate-800/30 border-t border-[#e7edf3] dark:border-slate-800 flex gap-3">
                    <span className="material-symbols-outlined text-amber-500 flex-shrink-0">info</span>
                    <p className="text-xs text-[#4c739a] leading-relaxed">
                        Confirming will end your workday session. Ensure all tasks are saved.
                    </p>
                </div>
            </div>
        </div>
    );
}