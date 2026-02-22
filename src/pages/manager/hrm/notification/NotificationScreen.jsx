export default function NotificationScreen() {
    return (
        <main className="flex-1 flex flex-col min-w-0">
            {/* <!-- Workspace Content --> */}
            <div className=" mx-auto w-full grow">
                {/* <!-- Page Heading --> */}
                <PageHeading />

                {/* <!-- Filter Chips --> */}
                <FilterChips />

                {/* <!-- Notification List --> */}
                <NotificationSection />

                {/* <!-- Pagination/Load more (Optional but good for UX) --> */}
                <Pagination />
            </div>
            {/* <!-- Footer Meta --> */}
            <Footer />
        </main>
    );
}

function Footer() {
    return (
        <footer className="mt-4 p-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                <p>© 2023 SmartOps Enterprise. v2.4.1-stable</p>
                <div className="flex gap-6">
                    <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                    <a className="hover:text-primary transition-colors" href="#">Support Center</a>
                    <a className="hover:text-primary transition-colors" href="#">API Documentation</a>
                </div>
            </div>
        </footer>
    );
}


function PageHeading() {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
                <h2 className="text-4xl font-black tracking-tight mb-2">Notifications / Inbox</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Things that need your attention</p>
            </div>
            <div className="flex items-center gap-3">
                <button className="text-primary hover:text-primary/80 text-sm font-bold px-4 py-2 transition-colors">
                    Mark all as read
                </button>
                <button className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined">settings</span>
                </button>
            </div>
        </div>
    );
}

function FilterChips() {
    return (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button className="h-10 px-6 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 whitespace-nowrap">
                All
            </button>
            <button className="h-10 px-6 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors text-sm font-medium whitespace-nowrap">
                Approvals
                <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">1</span>
            </button>
            <button className="h-10 px-6 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors text-sm font-medium whitespace-nowrap">
                Alerts (AI / System)
            </button>
            <button className="h-10 px-6 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors text-sm font-medium whitespace-nowrap">
                Info
            </button>
        </div>
    );
}

function NotificationSection() {
    return (
        <div className="space-y-3">
            {/* <!-- Urgent / Unread Item --> */}
            <div className="group relative bg-white dark:bg-slate-900 border-l-4 border-red-500 p-5 rounded-r-xl rounded-l-md shadow-sm hover:shadow-md transition-all flex items-start gap-4 ring-1 ring-slate-200 dark:ring-slate-800">
                <div className="flex-shrink-0 mt-1 relative">
                    <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
                    </div>
                    <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-[#0d141b] dark:text-white truncate">OT Request Pending</h3>
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-4">10 mins ago</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">John Doe requested 2h OT (Oct 21). Review required for payroll processing.</p>
                    <div className="flex items-center gap-3">
                        <button className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">View Details</button>
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold px-2 py-1 transition-colors">Dismiss</button>
                    </div>
                </div>
            </div>
            {/* <!-- Alert (AI) --> */}
            <div className="group relative bg-white dark:bg-slate-900 border-l-4 border-amber-500 p-5 rounded-r-xl rounded-l-md shadow-sm hover:shadow-md transition-all flex items-start gap-4 ring-1 ring-slate-200 dark:ring-slate-800">
                <div className="flex-shrink-0 mt-1">
                    <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-[#0d141b] dark:text-white truncate">AI High Attrition Risk</h3>
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-4">1h ago</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Emma Watson shows high risk indicators based on recent activity and survey data.</p>
                    <div className="flex items-center gap-3">
                        <button className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-primary/90 transition-colors">View Analysis</button>
                    </div>
                </div>
            </div>
            {/* <!-- Info / Read Item --> */}
            <div className="group relative bg-slate-50 dark:bg-slate-900/50 border-l-4 border-slate-300 dark:border-slate-700 p-5 rounded-r-xl rounded-l-md shadow-sm flex items-start gap-4 ring-1 ring-slate-100 dark:ring-slate-800 opacity-80">
                <div className="flex-shrink-0 mt-1">
                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                        <span className="material-symbols-outlined">check_circle</span>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-500 dark:text-slate-400 truncate">Request Approved</h3>
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-4">Yesterday</span>
                    </div>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">Your leave request for Dec 20-24 has been approved by HR.</p>
                    <div className="flex items-center gap-3">
                        <button className="border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold px-4 py-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors">View Receipt</button>
                    </div>
                </div>
            </div>
            {/* <!-- Another Info Item --> */}
            <div className="group relative bg-slate-50 dark:bg-slate-900/50 border-l-4 border-slate-300 dark:border-slate-700 p-5 rounded-r-xl rounded-l-md shadow-sm flex items-start gap-4 ring-1 ring-slate-100 dark:ring-slate-800 opacity-80">
                <div className="flex-shrink-0 mt-1">
                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                        <span className="material-symbols-outlined">info</span>
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-500 dark:text-slate-400 truncate">System Maintenance</h3>
                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap ml-4">Oct 19, 2023</span>
                    </div>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-3">Scheduled maintenance this Saturday from 02:00 to 04:00 AM UTC.</p>
                    <div className="flex items-center gap-3">
                        <button className="border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold px-4 py-2 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors">Schedule</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Pagination() {
    return (
        <div className="mt-8 text-center">
            <button className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 mx-auto">
                <span className="material-symbols-outlined">expand_more</span>
                Load more activity
            </button>
        </div>
    );
}