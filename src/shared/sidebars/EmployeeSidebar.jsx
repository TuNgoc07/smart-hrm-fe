import { NavLink } from "react-router-dom";

export default function EmployeeSidebar() {
    return (
        <aside className="w-64 flex-shrink-0 border-r border-[#e7edf3] dark:border-slate-800 bg-white dark:bg-[#16222e] flex flex-col justify-between py-6">
            <div className="fixed flex flex-col gap-8">
                {/* <!-- Logo/Brand --> */}
                <div className="px-6 flex items-center gap-3">
                    <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-[#0d141b] dark:text-white text-lg font-bold leading-tight">Smart Ops</h1>
                        <p className="text-[#4c739a] text-xs font-medium uppercase tracking-wider">Enterprise</p>
                    </div>
                </div>
                {/* <!-- Menu Items --> */}
                <nav className="flex flex-col gap-1 px-3">
                    <NavLink to="/employee/home" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-bold">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                        <span className="text-sm">Dashboard</span>
                    </NavLink>
                    <NavLink to="/employee/my-attendance" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">schedule</span>
                        <span className="text-sm font-medium">Attendance</span>
                    </NavLink>
                    <NavLink to="/employee/my-requests" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">pending_actions</span>
                        <span className="text-sm font-medium">My Requests</span>
                    </NavLink>
                    
                    <NavLink to="/employee/my-payslip" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="text-sm font-medium">My Payslip</span>
                    </NavLink>
                    <NavLink to="/employee/my-documents" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">folder_open</span>
                        <span className="text-sm font-medium">My Documents</span>
                    </NavLink>
                    <NavLink to="/employee/chatbot" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined">smart_toy</span>
                        <span className="text-sm font-medium">HR Chatbot</span>
                    </NavLink>
                </nav>
            </div>
            {/* <!-- Bottom Menu --> */}
            <div className="fixed bottom-0 flex flex-col gap-1 px-3">
                <NavLink to="/employee/notifications" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">notifications</span>
                    <span className="text-sm font-medium">Notifications</span>
                </NavLink>
                <NavLink to="/employee/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4c739a] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-sm font-medium">Profile</span>
                </NavLink>
            </div>
        </aside>
    );
}