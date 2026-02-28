function Header() {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div className="space-y-2">
                <RequestTitle />
                <QuickStats />
            </div>
            <StatusBar />
        </div>

    );
}
function RequestTitle() {
    return (
        <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-primary">
                <span className="material-symbols-outlined text-[28px]">calendar_month</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Annual Leave</h2>
        </div>
    );
}

function QuickStats() {
    return (
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Request ID:</span> #REQ-1024</span>
            <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className="flex items-center gap-1.5"><span className="font-semibold text-slate-700 dark:text-slate-300">Created:</span> Oct 24, 2024</span>
        </div>
    );
}

function StatusBar() {
    return (
        <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-bold rounded-full border border-amber-200 dark:border-amber-900/50 flex items-center gap-1.5">
                <span className="size-2 bg-amber-500 rounded-full animate-pulse"></span>
                Pending Approval
            </span>
        </div>
    );
}

function RequestInfoSection() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Request Details</h3>
                <button className="text-primary text-xs font-bold uppercase tracking-wider hover:underline">Edit Request</button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leave Type</p>
                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">Annual Leave</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duration</p>
                    <p className="text-base font-medium text-slate-900 dark:text-slate-100">2 Days (Working)</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start &amp; End Dates</p>
                    <div className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-slate-100">
                        <span>Oct 28, 2024</span>
                        <span className="material-symbols-outlined text-[18px] text-slate-400">arrow_forward</span>
                        <span>Oct 29, 2024</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attachment</p>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">description</span>
                        <span className="text-sm font-medium">medical_proof.pdf</span>
                        <button className="ml-2 text-primary p-1 hover:bg-primary/5 rounded">
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason</p>
                    <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">Family matter - attending a scheduled event and handling relocation logistics.</p>
                </div>
            </div>
        </section>
    )
}

function MainRequestDetailCard() {
    return (
        <div className="lg:col-span-2 space-y-6">
            <RequestInfoSection />
            <CommentSection />
        </div>
    )
}

// RIGHT COMPONENTS

function CommentSection() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Manager Feedback</h3>
            </div>
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full">
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[40px]">forum</span>
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-sm italic font-medium">No feedback or comments provided yet.</p>
            </div>
        </section>
    );
}

function ApprovalCard() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Current Approver</h3>
            <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-cover bg-center ring-2 ring-white dark:ring-slate-800" dataalt="Alex Thompson profile picture" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCx5Puk6mYp2HGLi-0vrNXSD8-b7_UZOwhfscLbtNyQ-z7eGxyFL9Qge6cRVzlSimHeGsL25i-3PNPObj3b7jgVIHzOicTNhg0vBpOjfPj3fH7KE1y1OnrRO4aJ1gjj0h1NY2rRcFi6IwIM9k-EMMiMckXEVT2aWFfmIznbQdBl5V5HOJXMFCA5VeWf-n9HJ4ADqKkJhZpWqU0yS6nKqadeosWoI8DDSpKLJRMqEcD55g_gf9nd2kxz93Oa2IkAdO75KmLRGTs5oQk')" }}></div>
                <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Alex Thompson</p>
                    <p className="text-xs text-slate-500">Line Manager</p>
                </div>
            </div>
        </section>
    );
}

function ApprovalTimeLine() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Approval Timeline</h3>
            <div className="relative space-y-8">
                {/* <!-- Step 1: Submitted --> */}
                <div className="relative pl-8 flex flex-col">
                    <div className="absolute left-0 top-1 size-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center border-2 border-green-500 z-10">
                        <span className="material-symbols-outlined text-[14px] text-green-600 font-bold">check</span>
                    </div>
                    <div className="absolute left-[11px] top-7 w-[2px] h-[calc(100%+8px)] bg-slate-200 dark:bg-slate-800"></div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Request Submitted</span>
                    <span className="text-xs text-slate-500 mt-0.5">Oct 24, 2024 · 09:15 AM</span>
                    <span className="text-xs text-slate-400 mt-1">By: You</span>
                </div>
                {/* <!-- Step 2: Pending Manager --> */}
                <div className="relative pl-8 flex flex-col">
                    <div className="absolute left-0 top-1 size-6 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary z-10">
                        <div className="size-2 bg-primary rounded-full"></div>
                    </div>
                    <div className="absolute left-[11px] top-7 w-[2px] h-[calc(100%+8px)] bg-slate-100 dark:bg-slate-800/50"></div>
                    <span className="text-sm font-bold text-primary">Pending Manager Approval</span>
                    <span className="text-xs text-slate-500 mt-0.5">Assigned to Alex Thompson</span>
                    <span className="inline-flex mt-2 items-center px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-primary uppercase tracking-tight w-max border border-blue-100 dark:border-blue-800/50">
                        In Progress
                    </span>
                </div>
                {/* <!-- Step 3: Final Approval --> */}
                <div className="relative pl-8 flex flex-col">
                    <div className="absolute left-0 top-1 size-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-200 dark:border-slate-700 z-10">
                    </div>
                    <span className="text-sm font-medium text-slate-400 dark:text-slate-600">Approval Completed</span>
                    <span className="text-xs text-slate-400 mt-0.5 italic">Waiting for previous steps</span>
                </div>
            </div>
        </section>
    );
}

function HelperTip() {
    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-3">
        <span className="material-symbols-outlined text-primary text-[20px]">info</span>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
            Most leave requests are processed within 24-48 hours. If you need urgent approval, please contact your manager directly.
        </p>
    </div>
}

function RightContentSection() {
    return (
        <div className="space-y-6">
            {/* <!-- Approver Card --> */}
            <ApprovalCard />

            {/* <!-- Approval Timeline --> */}
            <ApprovalTimeLine />

            {/* <!-- Helper Tip --> */}
            <HelperTip />
        </div>
    );
}
export default function RequestDetailScreen() {
    return (
        <main className="flex-1 flex flex-col overflow-y-auto ">
            <div className="w-full space-y-6">
                {/* <!-- Request Title & Quick Stats --> */}
                <Header />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* <!-- Main Request Detail Card --> */}
                    <MainRequestDetailCard />

                    {/* <!-- Right Column: Timeline and Approver --> */}
                    <RightContentSection />
                </div>
            </div>
        </main>
    );
}