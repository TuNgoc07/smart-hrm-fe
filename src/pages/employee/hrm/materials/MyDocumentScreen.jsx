export default function MyDocumentScreen() {
    return (
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="mx-auto space-y-6">

                <Header />
                {/* <!-- Stats / Summary Cards --> */}
                <SummarySection />

                {/* <!-- Filter Bar --> */}
                <FilterSection />

                {/* <!-- Document Table --> */}
                <DocumentTable />

                {/* <!-- Additional Info Section --> */}
                <AdditionInfoSection />
            </div>
        </main>
    );
}

function Header() {
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold">My Documents</h1>
            <button className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold">New Document + </button>
        </div>
    );
}

function SummaryCard(props) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 p-5 rounded-xl flex flex-col gap-1 shadow-sm">
            <div className="flex justify-between items-start">
                <span className="text-[#4c739a] text-sm font-semibold uppercase tracking-wider">{props.type}</span>
                <span className="material-symbols-outlined text-primary">{props.icon}</span>
            </div>
            <p className="text-[#0d141b] dark:text-white text-3xl font-extrabold">{props.amount}</p>
        </div>
    );
}

function SummarySection() {
    return (
        <div className="grid grid-cols-4 gap-4">
            <SummaryCard type="Total Documents" amount="8" icon="folder" />
            <SummaryCard type="Contracts" amount="2" icon="assignment" />
            <SummaryCard type="Payslips" amount="4" icon="payments" />
            <SummaryCard type="Policies" amount="2" icon="gavel" />
        </div>
    );
}

function FilterSection() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-end gap-4">
            <SearchBar />
            <DocumentFilter />
            <TimeFilter />

            <button className="bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                Clear Filters
            </button>
        </div>
    );
}

function SearchBar() {
    return (
        <div className="flex-1 max-w-sm">
            <label className="block text-sm font-bold text-[#0d141b] dark:text-white pb-2">Search</label>
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-xl">search</span>
                <input className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-primary focus:border-primary dark:text-white" placeholder="Search by file name..." type="text" />
            </div>
        </div>
    );
}

function DocumentFilter() {
    return (
        <div className="w-48">
            <label className="block text-sm font-bold text-[#0d141b] dark:text-white pb-2">Document Type</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-primary focus:border-primary dark:text-white">
                <option>All Types</option>
                <option>Contract</option>
                <option>Payslip</option>
                <option>Policy</option>
                <option>Other</option>
            </select>
        </div>
    );
}

function TimeFilter() {
    return (
        <div className="w-32">
            <label className="block text-sm font-bold text-[#0d141b] dark:text-white pb-2">Year</label>
            <select className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-primary focus:border-primary dark:text-white">
                <option>2024</option>
                <option>2023</option>
                <option>2022</option>
            </select>
        </div>
    );
}

function DocumentTable() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[#cfdbe7] dark:border-slate-800">
                        <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Document Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Period</th>
                        <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Uploaded Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* <!-- Row 1 --> */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded flex items-center justify-center text-red-500">
                                    <span className="material-symbols-outlined">picture_as_pdf</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0d141b] dark:text-white">Employment_Contract_2024.pdf</p>
                                    <p className="text-xs text-[#4c739a]">1.2 MB</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Contract</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#4c739a] dark:text-slate-400">Jan 2024 - Dec 2024</td>
                        <td className="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Oct 15, 2024</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="View">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                                <button className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Download">
                                    <span className="material-symbols-outlined">download</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                    {/* <!-- Row 2 --> */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded flex items-center justify-center text-red-500">
                                    <span className="material-symbols-outlined">picture_as_pdf</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0d141b] dark:text-white">Payslip_Oct_2024.pdf</p>
                                    <p className="text-xs text-[#4c739a]">450 KB</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Payslip</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#4c739a] dark:text-slate-400">Oct 2024</td>
                        <td className="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Nov 01, 2024</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="View">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                                <button className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Download">
                                    <span className="material-symbols-outlined">download</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                    {/* <!-- Row 3 --> */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded flex items-center justify-center text-red-500">
                                    <span className="material-symbols-outlined">picture_as_pdf</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0d141b] dark:text-white">Internal_Privacy_Policy_v2.pdf</p>
                                    <p className="text-xs text-[#4c739a]">2.8 MB</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Policy</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#4c739a] dark:text-slate-400">Permanent</td>
                        <td className="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Sep 20, 2024</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="View">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                                <button className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Download">
                                    <span className="material-symbols-outlined">download</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                    {/* <!-- Row 4 --> */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded flex items-center justify-center text-red-500">
                                    <span className="material-symbols-outlined">picture_as_pdf</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#0d141b] dark:text-white">Payslip_Sep_2024.pdf</p>
                                    <p className="text-xs text-[#4c739a]">448 KB</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Payslip</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-[#4c739a] dark:text-slate-400">Sep 2024</td>
                        <td className="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">Oct 01, 2024</td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="View">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                                <button className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Download">
                                    <span className="material-symbols-outlined">download</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            {/* <!-- Table Fosoter / Pagination Placeholder --> */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-[#cfdbe7] dark:border-slate-800">
                <p className="text-xs font-semibold text-[#4c739a]">Showing 4 of 8 documents</p>
                <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-[#4c739a] cursor-not-allowed opacity-50">Previous</button>
                    <button className="px-3 py-1 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-[#4c739a]">Next</button>
                </div>
            </div>
        </div>
    );
}

function AdditionInfoSection() {
    return (
        <div className="grid grid-cols-2 gap-6">
            <AdditionInfoCard title="Confidentiality Note" description="All documents in this portal are strictly confidential. Do not share your login credentials or downloaded copies with unauthorized personnel." />
            <AdditionInfoCard title="Need Assistance?" description="All If you can't find a specific document or notice an error in your payslip, please contact the HR support desk at hr-ops@enterprise.com" />
        </div>
    );
}

function AdditionInfoCard({ title, description }) {
    return (
        <div className="bg-blue-50 dark:bg-primary/10 p-6 rounded-xl border border-primary/20 flex gap-4">
            <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">info</span>
            </div>
            <div>
                <h4 className="text-sm font-bold text-[#0d141b] dark:text-white mb-1">{title}</h4>
                <p className="text-xs text-[#4c739a] leading-relaxed">{description}</p>
            </div>
        </div>
    );
}