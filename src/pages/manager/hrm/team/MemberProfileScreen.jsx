export function MemberProfileScreen() {
    return (
        <div>
            <BreadCrumb />
            <ProfileHeader />
            <Content />

        </div>
    );
}

function BreadCrumb() {
    return (
        <div className="mb-6">
            <button className="flex items-center gap-2 text-primary hover:text-primary/80 font-bold text-sm transition-colors">
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                <span>Back to Team List</span>
            </button>
        </div>
    );
}

function ProfileHeader() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-cover bg-center ring-4 ring-slate-50 dark:ring-slate-800" dataalt="Portrait of employee John Doe" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuApSdxTKvnVu0FenwrOOGobOff-XhoGZaY8h9AFou10DcRHo-EHLs9CeOTlqm3-CGTCxy5tlEXw0z3KvX7jYPz0B9gCv9X6NCVv1nmHBkjfCn0A2yQd-4pmWL3zOm3YPsTvrjWrNJ-R3hrpmSdWZS5zNuy3rYLONQjYf2DqTgHTL9MrH1DcG0-MXlQTfyBkNbeEIBcIwoo_Wc_r21a-n07qpgz8R__Go98z0ANbmagZu9kSITqwBmxwEp8B_Heeycf9kD9bkuys1rk")' }}></div>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">John Doe</h1>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                Active
                            </div>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Senior Designer | <span className="text-primary font-bold">NV-1024</span></p>
                        <p className="text-slate-400 text-sm">Product Design Department</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 md:self-start">
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center min-w-[100px]">
                        <p className="text-xs text-slate-400 font-medium uppercase">Tenure</p>
                        <p className="text-base font-bold text-slate-700 dark:text-slate-200">3 Years</p>
                    </div>
                </div>
            </div>
            {/* <!-- Tabs --> */}
            <div className="flex gap-8 mt-10 border-b border-slate-200 dark:border-slate-800 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <button className="pb-4 text-sm font-bold border-b-2 border-primary text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">info</span> Overview
                </button>
                <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">schedule</span> Attendance
                </button>
                <button className="pb-4 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">approval</span> Requests
                </button>
                <button className="pb-4 text-sm font-bold text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">auto_awesome</span> Insights (AI)
                </button>
            </div>
        </div>
    );
}

function Content() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* <!-- Main Content Col (Overview + Attendance Preview) --> */}
            <div className="lg:col-span-2 space-y-8">
                <JobInfoCard />
                <AttendancePreviewTable />
            </div>
            {/* <!-- Sidebar Content Col (Quick Stats + AI Insights) --> */}
            <div className="space-y-8">
                <QuickStatsCard />
                <AIInsightCard />
            </div>

        </div>
    );
}

function JobInfoCard() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">work</span> Job Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Position</p>
                    <p className="text-slate-700 dark:text-slate-200 font-medium">Senior Product Designer</p>
                </div>
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Level</p>
                    <p className="text-slate-700 dark:text-slate-200 font-medium">Senior (L4)</p>
                </div>
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Working Model</p>
                    <p className="text-slate-700 dark:text-slate-200 font-medium">Hybrid (3 Days Office)</p>
                </div>
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">Join Date</p>
                    <p className="text-slate-700 dark:text-slate-200 font-medium">October 14, 2021</p>
                </div>
            </div>
        </div>
    );
}

function AttendancePreviewTable() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-slate-900 dark:text-white text-lg font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">event_available</span> Recent Attendance
                </h3>
                <button className="text-primary text-sm font-bold hover:underline">View All Logs</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Check-in</th>
                            <th className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Check-out</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">May 10, 2024</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold uppercase">On Time</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">08:55 AM</td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">06:05 PM</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">May 09, 2024</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[11px] font-bold uppercase">Late</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">09:15 AM</td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">06:45 PM</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">May 08, 2024</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold uppercase">On Time</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">08:48 AM</td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">06:10 PM</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function QuickStatsCard() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6">Quick Stats</h3>
            <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-slate-400 text-xs font-bold uppercase">Attendance Issues</p>
                        <p className="text-slate-500 text-[10px] italic">Last 30 days</p>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">2</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                    <p className="text-slate-400 text-xs font-bold uppercase">OT Hours <span className="text-[10px] opacity-60">(Month)</span></p>
                    <p className="text-2xl font-bold text-primary">12h</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                    <p className="text-slate-400 text-xs font-bold uppercase">Leave Balance</p>
                    <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">12 days</p>
                </div>
            </div>
        </div>
    );
}

function AIInsightCard() {
    return (
        <div className="bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">psychology</span>
                <h3 className="text-slate-900 dark:text-white text-lg font-bold">AI Insights</h3>
            </div>
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase px-1">Risk Profile</p>
                    <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                            <span className="material-symbols-outlined text-lg">warning</span>
                            <p className="text-sm font-bold">Attendance Risk: Medium</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
                            <span className="material-symbols-outlined text-lg">trending_up</span>
                            <p className="text-sm font-bold">OT Trend: Increasing</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                            <span className="material-symbols-outlined text-lg">verified_user</span>
                            <p className="text-sm font-bold">Attrition Risk: Low</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-primary/10">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        "John has shown a 15% increase in overtime over the last 2 weeks. Recommend reviewing workload distribution."
                    </p>
                </div>
            </div>
        </div>
    );
}