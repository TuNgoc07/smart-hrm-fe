function Breadcrumbs() {
    return (
        <div className="space-y-4">
            <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <a className="hover:text-primary" href="#">Home</a>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <a className="hover:text-primary" href="#">HR</a>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-slate-900 dark:text-white">My Payslip</span>
            </nav>
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">My Payslip</h1>
                <p className="text-slate-500 mt-1">View your monthly salary breakdown and download payslip documents.</p>
            </div>
        </div>
    );
}

function PayslipControls() {
    return (
        <div className="flex items-center gap-4">
            <div className="w-48">
                <select className="form-input w-full rounded-lg text-sm border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-primary focus:border-primary">
                    <option defaultValue="September 2024">September 2024</option>
                    <option>August 2024</option>
                    <option>July 2024</option>
                </select>
            </div>
            <div className="flex h-7 items-center justify-center gap-x-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-3 border border-emerald-200 dark:border-emerald-800">
                <span className="size-1.5 rounded-full bg-emerald-500"></span>
                <p className="text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">Paid</p>
            </div>
        </div>
    );
}

function Header() {
    return (
        <header className="py-4 flex items-center justify-between">
            <Breadcrumbs />
            <div className="flex items-center gap-4">
                <PayslipControls />
            </div>
        </header>
    );
}

function DashboardContent() {
    return (
        <div className="flex flex-col gap-6">
            {/* <!-- Hero Summary Card --> */}
            <SummaryCard />

            {/* <!-- Breakdown Section --> */}
            <BreakdownSection />

            {/* Attendance Reference Section */}
            <AttendanceReferenceSection />

            {/* <!-- Footer Action --> */}
            <Footer />
        </div>
    );
}


function SummaryCard() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-[#e7edf3] dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20"></div>
            <div className="relative">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Net Salary</p>
                <h3 className="text-4xl font-extrabold text-[#0d141b] dark:text-white mb-6">18,500,000 <span className="text-lg font-bold text-slate-400">VND</span></h3>
                <div className="flex flex-wrap gap-8 items-center border-t border-slate-100 dark:border-slate-800 pt-6">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">event_available</span>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Payment Date</p>
                            <p className="text-sm font-semibold">Oct 05, 2024</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">account_balance</span>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold">Bank Account</p>
                            <p className="text-sm font-semibold">Vietcombank • **** 1234</p>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <button className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

function EarningCard() {
    return (
        <div className="bg-emerald-50/30 dark:bg-emerald-900/5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col">
            <div className="p-5 border-b border-emerald-100 dark:border-emerald-900/30">
                <h4 className="text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    Earnings
                </h4>
            </div>
            <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Base Salary</p>
                    <p className="text-sm font-bold">16,000,000</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Overtime (4.5h)</p>
                    <p className="text-sm font-bold">1,500,000</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Meal Allowance</p>
                    <p className="text-sm font-bold">1,000,000</p>
                </div>
            </div>
            <div className="p-5 bg-emerald-100/50 dark:bg-emerald-900/20 mt-auto rounded-b-xl">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Total Earnings</p>
                    <p className="text-lg font-extrabold text-emerald-900 dark:text-emerald-300">18,500,000</p>
                </div>
            </div>
        </div>
    )
}

function DeductionCard() {
    return (
        <div className="bg-rose-50/30 dark:bg-rose-900/5 rounded-xl border border-rose-100 dark:border-rose-900/30 flex flex-col">
            <div className="p-5 border-b border-rose-100 dark:border-rose-900/30">
                <h4 className="text-rose-800 dark:text-rose-400 font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">remove_circle</span>
                    Deductions
                </h4>
            </div>
            <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Insurance (Social/Health)</p>
                    <p className="text-sm font-bold">0</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Personal Income Tax</p>
                    <p className="text-sm font-bold">0</p>
                </div>
                <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Late Penalty (2 incidents)</p>
                    <p className="text-sm font-bold text-rose-600">0</p>
                </div>
            </div>
            <div className="p-5 bg-rose-100/50 dark:bg-rose-900/20 mt-auto rounded-b-xl">
                <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-rose-900 dark:text-rose-300">Total Deductions</p>
                    <p className="text-lg font-extrabold text-rose-900 dark:text-rose-300">0</p>
                </div>
            </div>
        </div>
    )
}

function BreakdownSection() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* <!-- Earnings Card --> */}
            <EarningCard />

            {/* <!-- Deductions Card --> */}
            <DeductionCard />
        </div>
    );
}

function AttendanceReferenceSection() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-[#e7edf3] dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg">Attendance Metrics</h4>
                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                    View Detailed Attendance
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
                    <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined">work</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Working Days</p>
                        <p className="text-xl font-bold">22 Days</p>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
                    <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined">beach_access</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">Paid Leave</p>
                        <p className="text-xl font-bold">2 Days</p>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
                    <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined">timer</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase">OT Hours</p>
                        <p className="text-xl font-bold">4.5 Hours</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <div className="flex justify-center gap-4 py-8 border-t border-slate-200 dark:border-slate-800">
            <button className="flex items-center gap-2 px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                View Full Payslip (PDF)
            </button>
            <button className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-blue-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">download</span>
                Export Record
            </button>
        </div>
    );
}

export default function MyPayslipScreen() {
    return (
        <main className="flex-1 flex flex-col overflow-y-auto">
            {/* <!-- Header --> */}
            <Header />

            {/* <!-- Dashboard Content --> */}
            <DashboardContent />
        </main>
    )
}