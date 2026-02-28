import { useNavigate } from "react-router-dom";

export default function TeamMembersScreen() {
    const navigate = useNavigate();
    return (
        <div className="flex-1 overflow-y-auto space-y-6">
            <BreadCrumb />
            <SummarySection />
            <FilterSection />
            <MembersTable navigate = {navigate}/>
        </div>
    );
}

function BreadCrumb() {
    return (
        <div className="space-y-2">
            <nav className="flex items-center text-xs font-medium text-[#4c739a] dark:text-slate-400">
                <span className="hover:text-primary cursor-pointer transition-colors">Home</span>
                <span className="material-symbols-outlined text-base mx-1 text-slate-300 dark:text-slate-600">chevron_right</span>
                <span className="hover:text-primary cursor-pointer transition-colors">Team HR</span>
                <span className="material-symbols-outlined text-base mx-1 text-slate-300 dark:text-slate-600">chevron_right</span>
                <span className="text-[#0d141b] dark:text-slate-200">Members</span>
            </nav>
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Team Members</h2>
                <button className="bg-primary text-white px-2 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-blue-600 transition-colors">
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Add Member</span>
                </button>
            </div>
        </div>
    );
}

function SummarySection() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-medium text-[#4c739a] dark:text-slate-400">Total Members</p>
                <p className="text-2xl font-bold mt-1">12</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-medium text-[#4c739a] dark:text-slate-400">Active</p>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-green-600">11</p>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-1.5 rounded">92%</span>
                </div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-medium text-[#4c739a] dark:text-slate-400">On Leave Today</p>
                <p className="text-2xl font-bold mt-1 text-primary">1</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <p className="text-sm font-medium text-[#4c739a] dark:text-slate-400">Attendance Issues</p>
                <p className="text-2xl font-bold mt-1 text-orange-500">2</p>
            </div>
        </div>
    );
}

function FilterSection() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded-xl p-4 flex flex-wrap items-center gap-4 shadow-sm">
            <div className="flex-1 min-w-[240px]">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input className="w-full pl-10 pr-4 py-2 border border-[#cfdbe7] dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary" placeholder="Search by name or ID" type="text" />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <select className="border border-[#cfdbe7] dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm px-4 py-2 focus:ring-primary min-w-[120px]">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>On Leave</option>
                </select>
                <select className="border border-[#cfdbe7] dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm px-4 py-2 focus:ring-primary min-w-[140px]">
                    <option>Position</option>
                    <option>Designer</option>
                    <option>Developer</option>
                    <option>Manager</option>
                </select>
                <select className="border border-[#cfdbe7] dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm px-4 py-2 focus:ring-primary min-w-[160px]">
                    <option>Attendance Today</option>
                    <option>Present</option>
                    <option>Late</option>
                    <option>Missing</option>
                </select>
                <button className="p-2 border border-[#cfdbe7] dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 transition-colors">
                    <span className="material-symbols-outlined text-slate-500">filter_list</span>
                </button>
            </div>
        </div>
    );
}

function MembersTable({navigate}) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[#cfdbe7] dark:border-slate-700">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Position</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Attendance Today</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Join Date</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr
                    onClick = {() => navigate('/manager/profile')} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwTZDaCGz9uT_ig1uJnK9dwOBClpI9aPLmQawiGSqEO_XZTp0CX467MVAol9ThT7ZyhTJfOl_-jDXLzT5hptvbbcKEZKxYRgNyAsS_4fJyPEtOIVPCkIXgLSTdkKfaO9nmsT2NR4Hd3IHSEucWg-JNeRrHpGIcGafmeCC9JWAu1c9n3hvmlapYEfQNL41byWdOFid9scwl-9renYdhwdXuWlsAe_k__J0MRNwCgutlikpMBf4AhPL_o4en50QZXlU1P6OH4C-BRgI" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">John Doe</p>
                                    <p className="text-xs text-[#4c739a] dark:text-slate-400">#EMP-2041</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">Senior Designer</td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-green-500"></span>
                                <span className="text-sm">Present</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">12 Jan 2022</td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-xl">visibility</span>
                            </button>
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCes-q0ojHhWMRoIsWD-lG9fUdbG7K8wxzzIpFGNBAJDiiQ6bjiKU7IyDXQ08FAcoa3E_K2mJHqQy501mm7FV8p8HIyemx3Fd_-4OHUQeiLp7JavCiWK9VLdqsnDXQz1BbAhblf22b8w9NJj4Ety6Ije_xePIc1Uw-shEIViq9V68EpI-z6JEzQMyzvrRdxUePRxUYytxgcM2iR8xza2is0aJNoxMVdtZfX0jzzgm-BJ_kPUFQFmHuZuLDYQV1naeBxw5P4CASeuc4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Chloe Wong</p>
                                    <p className="text-xs text-[#4c739a] dark:text-slate-400">#EMP-2155</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">UX Researcher</td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-orange-500"></span>
                                <span class="text-sm">Late (09:15 AM)</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">05 Mar 2023</td>
                        <td class="px-6 py-4 text-right">
                            <button class="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                                <span class="material-symbols-outlined text-xl">visibility</span>
                            </button>
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBirvlDX0CjW7NERbeYOM-BumlQPIswVynu2NQcTiihmpSa_Nrp-5L7LBIePfbLZwwyrW1MDJdV3A90PrNbGzex5d5Bfp6hxo_ZdJqizpGJH1WGeF9U3Wioug6csXDyGuq9eziHrjNGWh14y-rNtqfbJrxaAXZjXumkpi5wbKqAZd3MPyIsuuI4kGIKw8oVmO2f3pVM7tLh27MRYp4gBa0kwwiQAqIIWmgkRdCEYMqHHWhCPhRqwtBnzwi3wO-sHgVqHFPXjFdW81I" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Marcus Smith</p>
                                    <p className="text-xs text-[#4c739a] dark:text-slate-400">#EMP-1982</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">Developer</td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">On Leave</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <span class="size-2 rounded-full bg-blue-500"></span>
                                <span class="text-sm text-blue-600 dark:text-blue-400 font-medium">On Leave</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">20 Nov 2021</td>
                        <td class="px-6 py-4 text-right">
                            <button class="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                                <span class="material-symbols-outlined text-xl">visibility</span>
                            </button>
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhoQK8Z2SS83G9X9K0Uou1MYYcxo6TBxUK0Uwk1lQ9-0xmil1KxPRJjlBu_t6Kxhm6gzijliYQ7dd7Qqz5Pmli-rdAfliYIgoeB8pAfXMdMvf5UAfWBlmbUoyIqJlf2pSf2KEb4OeqfkD9JmGmUK0dpKV4Zq075v8P8ujvf3vjKsoc7SNEGRLiygW02f4v76AXOq4CSDUXzI7qIw5dLHu_ib19S9UbHzxvhShxR6B_si92X8HcMdpX5UkRnvIwGFFXzbKyJQi_V7I" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Sarah Jenkins</p>
                                    <p className="text-xs text-[#4c739a] dark:text-slate-400">#EMP-2088</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">Product Manager</td>
                        <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-red-500"></span>
                                <span className="text-sm text-red-600 dark:text-red-400 font-medium">Missing</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">14 Sep 2022</td>
                        <td className="px-6 py-4 text-right">
                            <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-xl">visibility</span>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-[#cfdbe7] dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-[#4c739a] dark:text-slate-400 font-medium">Showing 1 to 4 of 12 entries</span>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold uppercase text-slate-500">Per page</label>
                        <select className="text-xs border border-[#cfdbe7] dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 px-2 py-1">
                            <option>10</option>
                            <option>25</option>
                            <option>50</option>
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button className="px-2 py-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50" disabled="">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-bold">1</button>
                    <button className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700">2</button>
                    <button className="px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </div>
        </div>
    );
}