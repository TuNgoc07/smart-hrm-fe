export default function ApprovalHistoryScreen() {
    return (
        <div className="flex-1 overflow-y-auto space-y-6">
            <nav className="flex items-center gap-2 text-sm">
                <a className="text-primary font-medium flex items-center gap-1" href="#">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Approvals
                </a>
                <span className="text-[#4c739a]">/</span>
                <span className="text-[#4c739a]">History</span>
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[#0d141b] dark:text-white text-3xl font-black tracking-tight">Approval History</h1>
                    <p className="text-[#4c739a] text-base font-normal">Audit log of your managerial decisions</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex h-10 items-center gap-x-2 rounded-lg bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 px-4">
                        <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                        <p className="text-[#0d141b] dark:text-white text-sm font-medium">Last 30 days</p>
                        <span className="material-symbols-outlined text-slate-400">expand_more</span>
                    </div>
                    <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 text-[#0d141b] dark:text-white text-sm font-bold gap-2">
                        <span className="material-symbols-outlined text-xl">download</span>
                        Export CSV
                    </button>
                </div>
            </div>
            <div className="bg-white dark:bg-[#182430] p-4 rounded-xl border border-[#e7edf3] dark:border-slate-700 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person_search</span>
                    <input className="w-full pl-10 pr-4 py-2 bg-background-light dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary" placeholder="Search employee..." type="text" />
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="flex h-9 items-center gap-x-2 rounded-lg bg-background-light dark:bg-slate-900 px-3 cursor-pointer">
                        <p className="text-xs font-semibold text-[#4c739a] uppercase tracking-wider">Type:</p>
                        <p className="text-[#0d141b] dark:text-white text-sm font-medium">All Types</p>
                        <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
                    </div>
                    <div className="flex h-9 items-center gap-x-2 rounded-lg bg-background-light dark:bg-slate-900 px-3 cursor-pointer">
                        <p className="text-xs font-semibold text-[#4c739a] uppercase tracking-wider">Decision:</p>
                        <p className="text-[#0d141b] dark:text-white text-sm font-medium">All Status</p>
                        <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
                    </div>
                    <div className="flex h-9 items-center gap-x-2 rounded-lg bg-background-light dark:bg-slate-900 px-3 cursor-pointer">
                        <p className="text-xs font-semibold text-[#4c739a] uppercase tracking-wider">Status:</p>
                        <p className="text-[#0d141b] dark:text-white text-sm font-medium">Final</p>
                        <span className="material-symbols-outlined text-slate-400 text-lg">expand_more</span>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-[#182430] rounded-xl border border-[#e7edf3] dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background-light dark:bg-slate-800/50 border-b border-[#e7edf3] dark:border-slate-700">
                            <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Decision Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Request Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Decision</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Approved By</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Comment</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7edf3] dark:divide-slate-700">
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-[#0d141b] dark:text-white">Oct 24, 2023</span>
                                    <span className="text-xs text-[#4c739a]">09:15 AM</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="size-8 rounded-full bg-cover"
                                        data-alt="Employee Sarah Chen avatar"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDiOuyvdWycGzPcLyxp7UaVy_F115bmZWRDn_h9AF3_n8UCqt4U972E8T4g4tT24d5YEKNWGkoEKDcBkOOLJO2nv_WNF0PQlGfVmmCOyTiwWkwaMPUiLvXkNHb8YYN7boYaPqfCsgUoGvqoNPRQpuuTvkIRwKrTWER0bXuH5j7tYSynuFk25xe5Gz2pz-BI-xYqsnSVqz5KKqGnji7amG2w5T5l85vChj9nvPU-xI9NQzffS85YCsCwPMXrBC6JNlrU8r01undztCE')" }}
                                    ></div>
                                    <span className="text-sm font-medium text-[#0d141b] dark:text-white">Sarah Chen</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">event_busy</span>
                                    <span className="text-sm text-[#0d141b] dark:text-slate-300">Annual Leave</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    APPROVED
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="size-6 rounded-full bg-cover bg-center"
                                        data-alt="Sarah Lee avatar"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCBm8hh8APyw3UOAjbh0LcuAJPflDLj94VVqqFR4j7tgAchTdO4lZ-wRkSFcpgQgmmtfUW3JhHg6wSYBJykz4tD8lwxHmFTNGTAwxcWATB3RSBm4j3-zGHOGsTpFwQ1Vn2aJPyjfj9QyEloTHd1TD_ihY-DRugU_zhppDAmct2eyt78FFQW5RrKcfWH-1I8X1ajMkaODbiR7C-2uVFU0NCu8My4cRowNahTvjX66d75kbBA1l6QRX-QPDURSsRA4KxeHdsWaQjRync')" }}
                                    ></div>
                                    <span className="text-sm font-medium text-[#0d141b] dark:text-slate-200">Sarah Lee</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-sm text-[#4c739a] truncate max-w-[150px]">Coverage confirmed by Team Alpha.</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">Final</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-primary hover:text-primary/80 transition-colors">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                            </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-[#0d141b] dark:text-white">Oct 23, 2023</span>
                                    <span className="text-xs text-[#4c739a]">02:45 PM</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="size-8 rounded-full bg-cover"
                                        data-alt="Employee Michael Scott avatar"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAGn2q6CgkIvaZVRtoRXto8We49iWVHFOf4eEEeDBeFc7giJuLw9nMFCZuwCGMLQ8eN3EsJcCtml1e9RVd6kN7T8hWgCMxiSTMEZegKpSFFUfajyJbgzyIB2qbRJ5TZSCli-yqLVa8mlscMPTU3O30Dv2ZMUbwlqOD7NNEUuDE-7m1_owtzRzwGydXznPxt5p8EzhJxpOezVZ29B8KcvjJ_1Y3NMXzJ41gtVbrkSII7CdAodkHyECfcgfUlWsFi_pA5kpBo60wnvrY')" }}
                                    ></div>
                                    <span className="text-sm font-medium text-[#0d141b] dark:text-white">Michael Scott</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                                    <span className="text-sm text-[#0d141b] dark:text-slate-300">Attendance Adjustment</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    REJECTED
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="size-6 rounded-full bg-cover bg-center"
                                        data-alt="Alex Thompson avatar"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDn-cbR6HCIrglpQHcOCWYVqEbYKZxDXVl1s-2igG0NCqeoOaZ8N3heEqWRWIKo4EaUf2noYZE_IxfDwy4lvwV3IpXxQxk2U8hIFSUA0vgPWw9lnzuwy40B8ae9fw2hXDy6EyKNf_ZqpkmTHFJSmItzVKRmxcDrG4rx2hoFORIUF1uuX2MQBiuh6QEzgCMa8azaP58gdAsn2XXGvByOuBnQS25qVHywp-GUOWDNusqSQo0BVf2AExkc-wk8ZkSmAXusk40-st07MX8')" }}
                                    ></div>
                                    <span className="text-sm font-medium text-[#0d141b] dark:text-slate-200">Alex Thompson</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-sm text-[#4c739a] truncate max-w-[150px]">Missing supporting clock-in log.</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">Final</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-primary hover:text-primary/80 transition-colors">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                            </td>
                        </tr>
                        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-[#0d141b] dark:text-white">Oct 21, 2023</span>
                                    <span className="text-xs text-[#4c739a]">11:20 AM</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="size-8 rounded-full bg-cover"
                                        data-alt="Employee Jason Bourne avatar"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuANzU7DVETb9mssMPBRBfEUgxSEjclLhg8tSjroEL2cboOoDm2NDm4KGmIU0zyE7gBaIpSq1JjWr2fefS9pR3VsnvfVakeKKiulLG_r5tswma_xJeJU7PNKiG_xklsbxlWj0MdtBVxMUVI7583BGUGWeMOD4xfgEAldWS6QM8rHyPRK_n7hFllJQGdvmMPA6NapUIbadz8dn4PpZm8n-8hDobp4_1XcUjYsWuWzqGubpzoMzMb752SYdoxzWgou5cEeVZgrPASoQ-k')" }}
                                    ></div>
                                    <span className="text-sm font-medium text-[#0d141b] dark:text-white">Jason Bourne</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">medical_services</span>
                                    <span className="text-sm text-[#0d141b] dark:text-slate-300">Sick Leave</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    APPROVED
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="size-6 rounded-full bg-cover bg-center"
                                        data-alt="Alex Thompson avatar"
                                        style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDn-cbR6HCIrglpQHcOCWYVqEbYKZxDXVl1s-2igG0NCqeoOaZ8N3heEqWRWIKo4EaUf2noYZE_IxfDwy4lvwV3IpXxQxk2U8hIFSUA0vgPWw9lnzuwy40B8ae9fw2hXDy6EyKNf_ZqpkmTHFJSmItzVKRmxcDrG4rx2hoFORIUF1uuX2MQBiuh6QEzgCMa8azaP58gdAsn2XXGvByOuBnQS25qVHywp-GUOWDNusqSQo0BVf2AExkc-wk8ZkSmAXusk40-st07MX8')" }}
                                    ></div>
                                    <span className="text-sm font-medium text-[#0d141b] dark:text-slate-200">Alex Thompson</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <p className="text-sm text-[#4c739a] truncate max-w-[150px]">Doctor's note attached.</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-0.5 rounded">Escalated</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="text-primary hover:text-primary/80 transition-colors">
                                    <span className="material-symbols-outlined">visibility</span>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-white dark:bg-[#182430] border border-[#e7edf3] dark:border-slate-700 p-5 rounded-xl flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                        <span className="material-symbols-outlined text-2xl">check_circle</span>
                    </div>
                    <div>
                        <p className="text-[#4c739a] text-xs font-bold uppercase tracking-wider">Approved (30d)</p>
                        <p className="text-2xl font-black text-[#0d141b] dark:text-white">42</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#182430] border border-[#e7edf3] dark:border-slate-700 p-5 rounded-xl flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                        <span className="material-symbols-outlined text-2xl">cancel</span>
                    </div>
                    <div>
                        <p className="text-[#4c739a] text-xs font-bold uppercase tracking-wider">Rejected</p>
                        <p className="text-2xl font-black text-[#0d141b] dark:text-white">5</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#182430] border border-[#e7edf3] dark:border-slate-700 p-5 rounded-xl flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined text-2xl">avg_pace</span>
                    </div>
                    <div>
                        <p className="text-[#4c739a] text-xs font-bold uppercase tracking-wider">Avg Response</p>
                        <p className="text-2xl font-black text-[#0d141b] dark:text-white">1.2 Days</p>
                    </div>
                </div>
            </div>
        </div>
    );
}