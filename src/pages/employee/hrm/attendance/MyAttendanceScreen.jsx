export default function MyAttendanceScreen() {
    return (
        <main className="overflow-y-auto scrollbar-hide">
            <div className="space-y-8">
                {/* <!-- Today Attendance Card --> */}
                <TodayAttendanceCard />

                {/* <!-- Summary Stats Grid --> */}
                <SummaryStatsGrid />

                {/* <!-- Attendance History --> */}
                <AttendanceHistorySection />
            </div>
            <Footer />
        </main>
    );
}

function TodayAttendanceCard() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">
                        <span className="size-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
                        Working
                    </span>
                    <span className="text-slate-400 text-sm">•</span>
                    <p className="text-slate-900 dark:text-white font-bold text-lg">Today – Tuesday, Oct 24</p>
                </div>
                <div className="grid grid-cols-2 gap-8 py-2">
                    <div className="space-y-1">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-tight">Check-in Time</p>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">09:02 AM</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-tight">Check-out Time</p>
                        <p className="text-2xl font-extrabold text-slate-300 dark:text-slate-700">--:--</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Check-out
                    </button>
                    <p className="text-sm text-slate-500 italic">Expected checkout: 06:00 PM</p>
                </div>
            </div>
            <div className="w-full md:w-64 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                <div className="h-full w-full bg-cover bg-center" dataalt="Modern abstract office building exterior" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCsCpdIVc-oWFG0W-f-rR0PwzG1Dk-olCPTWp4i20-u3Kle5beC4PfQFFlwTnOaAqlrQF4-ZsideMxmASrN6qswtCKF59ZEJWVzFq5NakVAAZATWMZnLC6k7V8fH_wCjQH7N4Fpdh4D7Kb4MexABsqPnbEtZ5woKjcF4E6Ioe1SvIeCYi9FTl4n6nYY0kJK2r2KHhyhJJptg_QR21o-MMnuW0s2xOBWU32qeVd9dfTTP7lC1hb8MWlge4jK61ZFNEdD-9Ej62BDG8w")' }}></div>
                <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="bg-white/90 dark:bg-slate-900/90 text-[10px] px-2 py-1 rounded font-bold shadow-sm">HQ Office</span>
                    <span className="bg-white/90 dark:bg-slate-900/90 text-[10px] px-2 py-1 rounded font-bold shadow-sm">Verified</span>
                </div>
            </div>
        </section>
    );
}
function StatsCard(props) {
    const itemColor = [
        "bg-blue-50 dark:bg-blue-500/10",
        "bg-amber-50 dark:bg-amber-500/10",
        "bg-red-50 dark:bg-red-500/10",
        "bg-green-50 dark:bg-green-500/10"
    ];

    const textColor = [
        "text-blue-600 bg-blue-50",
        "text-amber-600 bg-amber-50",
        "text-red-600 bg-red-50",
        "text-green-600 bg-green-50"
    ];
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 ${itemColor[props.index]} rounded-lg`}>
                    <span className="material-symbols-outlined text-blue-600 text-xl">{props.icon}</span>
                </div>
                <span className={`text-[10px] font-bold ${textColor[props.index]} px-2 py-0.5 rounded uppercase`}>This Month</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{props.label}</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{props.days}</p>
        </div>
    )
}
function SummaryStatsGrid() {
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard index={0} icon="calendar_month" label="Working Days" days="18" />
            <StatsCard index={1} icon="schedule" label="Late Days" days="2" />
            <StatsCard index={2} icon="error" label="Missing Records" days="1" />
            <StatsCard index={3} icon="hourglass_top" label="OT Hours" days="4.5" />
        </section>
    );
}

function Tr(props) {
    const isRequest = props.isRequest ? <a className="text-primary hover:underline text-xs font-bold flex items-center gap-1" href="#">
        Request adjustment
        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
    </a> : <span className="material-symbols-outlined text-[18px]">{props.icon}</span>;

    const statusColor = props.status == "Missing" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
        : props.status == "Present" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
            : props.status == "Working" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                : props.status == "Late" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{props.datetime}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{props.day}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{props.checkin}</td>
            <td className="px-6 py-4 text-sm text-slate-400 dark:text-slate-600">{props.checkout}</td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{props.workingHours}</td>
            <td className="px-6 py-4">
                <span className={`px-2.5 py-1  text-[10px] font-bold rounded uppercase tracking-wide ${statusColor}`}>{props.status}</span>
            </td>
            <td className="px-6 py-4">

                <button className="text-slate-400 hover:text-primary transition-colors">
                    {isRequest}
                </button>
            </td>
        </tr>
    );
}

function AttendanceHistorySection() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-bold text-slate-900 dark:text-white">Attendance History</h3>
                <div className="flex flex-wrap items-center gap-3">
                    <select className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm font-bold rounded-lg px-3 py-2 pr-8 focus:ring-primary">
                        <option>October 2023</option>
                        <option>September 2023</option>
                        <option>August 2023</option>
                    </select>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button className="px-3 py-1.5 text-xs font-bold rounded bg-primary text-white shadow-sm">All</button>
                        <button className="px-3 py-1.5 text-xs font-bold rounded text-slate-500 hover:text-slate-700">Present</button>
                        <button className="px-3 py-1.5 text-xs font-bold rounded text-slate-500 hover:text-slate-700">Late</button>
                        <button className="px-3 py-1.5 text-xs font-bold rounded text-slate-500 hover:text-slate-700">Missing</button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Check-in</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Check-out</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Working Hours</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {/* <!-- Oct 24 (Today) --> */}
                        <Tr datetime="Oct 24, 2023" day="Tuesday" checkin="09:02 AM" checkout="--:--" workingHours="9h 10m" status="Working" icon="check_circle" isRequest={true} />
                        {/* <!-- Oct 23 --> */}
                        <Tr datetime="Oct 23, 2023" day="Monday" checkin="08:55 AM" checkout="06:05 PM" workingHours="9h 10m" status="Present" icon="check_circle" />
                        {/* <!-- Oct 21 (Missing Record) --> */}
                        <Tr datetime="Oct 21, 2023" day="Saturday" checkin="No entry" checkout="No entry" workingHours="No entry" status="Missing" icon="error" />
                        {/* <!-- Oct 20 --> */}
                        <Tr datetime="Oct 20, 2023" day="Friday" checkin="09:15 AM" checkout="06:05 PM" workingHours="9h 10m" status="Late" icon="check_circle" />
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <p className="text-xs text-slate-500">Showing 1-15 of 22 entries</p>
                <div className="flex gap-2">
                    <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-50">Prev</button>
                    <button className="px-3 py-1 rounded bg-white dark:bg-slate-900 border border-primary text-primary text-xs font-bold">1</button>
                    <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold">2</button>
                    <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-700 text-xs font-bold">Next</button>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="mt-auto px-8 py-6 text-center text-slate-400 text-xs border-t border-slate-200 dark:border-slate-800">
            © 2023 SmartOps Enterprise Portal • Version 2.4.1 • Data synced 2 minutes ago
        </footer>
    );
}