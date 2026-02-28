import React from "react";

export default function ManagerSettingScreen() {
    return (
        <main className="flex-1 overflow-y-auto  ">
            <div className="mx-auto space-y-8">
                <BreadcrumbSection />
                <ProfileCard />
                <NotificationPreferences />
                <ApprovalDelegation />
                <PageActions />
            </div>
        </main>
    );
}

function BreadcrumbSection() {
    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                <a className="text-[#4c739a] text-sm font-medium hover:text-primary" href="#">Home</a>
                <span className="text-[#4c739a] text-sm font-medium">/</span>
                <span className="text-[#0d141b] dark:text-slate-100 text-sm font-medium">Manager Settings</span>
            </div>
            <h2 className="text-[#0d141b] dark:text-white text-3xl font-black leading-tight tracking-tight">Manager Settings</h2>
        </div>
    );
}
function ProfileCard() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32 ring-4 ring-primary/10 shadow-lg"
                        data-alt="Manager Profile Photo Large"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB4tDHH3h3eaAXkF_49Sn7-GX5AtRYpegr7alHS7bbP8SDEW4VPe2Ug42JGByrRpKUFykV0yaDQGKXfupUrf1vw2kXa_rQaMbwSNPoRlSNuF4loE9Rfl23ISmXJbxW9kgdCKv9egOWhjKH9P6J19tUdCtLpq_JzqqE2U1EAXa1H2a4_Et72L2nX15O25oiM1XkewzacwG65XfLfmQvfHeAg2LPXT5tj_YKXrGW_nGr5qOHjPO_qZHTIPtRgymt7v9SugNv5bwec_iM")' }}
                    ></div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 text-[#0d141b] dark:text-white text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors">
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                        <span>Change Photo</span>
                    </button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-1 block">Full Name</label>
                        <p className="text-lg font-semibold text-[#0d141b] dark:text-white">Nguyễn Văn A</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-1 block">Email</label>
                        <p className="text-lg font-semibold text-[#0d141b] dark:text-white">manager@company.com</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-1 block">Title</label>
                        <p className="text-lg font-semibold text-[#0d141b] dark:text-white">Line Manager</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-1 block">Department</label>
                        <p className="text-lg font-semibold text-[#0d141b] dark:text-white">Product Design</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#4c739a] mb-1 block">Team</label>
                        <p className="text-lg font-semibold text-[#0d141b] dark:text-white">Team Alpha</p>
                    </div>
                </div>
            </div>
        </section>
    );
}



function NotificationPreferences() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e7edf3] dark:border-slate-800">
                <h3 className="text-lg font-bold">Notification Preferences</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-[#4c739a]">Notification Type</th>
                            <th className="px-6 py-4 text-sm font-bold text-[#4c739a] text-center w-32">In-App</th>
                            <th className="px-6 py-4 text-sm font-bold text-[#4c739a] text-center w-32">Email</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e7edf3] dark:divide-slate-800">
                        <NotificationRow title="Approval requests" desc="Notify when new requests need your approval" />
                        <NotificationRow title="Attendance issues" desc="Critical attendance alerts for team members" />
                        <NotificationRow title="AI Insights alerts" desc="New operational intelligence reports available" />
                        <NotificationRow title="System updates" desc="Critical platform maintenance notifications" disabled />
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function NotificationRow({ title, desc, disabled = false }) {
    return (
        <tr className={disabled ? "bg-slate-50/50 dark:bg-slate-800/20" : ""}>
            <td className="px-6 py-4">
                <p className={`text-sm font-semibold ${disabled ? "text-[#4c739a]" : "text-[#0d141b] dark:text-white"}`}>{title}</p>
                <p className="text-xs text-[#4c739a]">{desc}</p>
            </td>
            <td className="px-6 py-4 text-center">
                <div className="flex justify-center">
                    <input
                        checked
                        className={`h-5 w-10 rounded-full appearance-none relative before:content-[''] before:absolute before:size-4 before:rounded-full before:top-0.5 before:left-0.5 transition-all ${disabled
                            ? "bg-slate-300 dark:bg-slate-800 opacity-50 cursor-not-allowed before:bg-slate-100 before:left-5"
                            : "bg-slate-200 dark:bg-slate-700 checked:bg-primary cursor-pointer before:bg-white checked:before:translate-x-5"
                            }`}
                        disabled={disabled}
                        type="checkbox"
                    />
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                <div className="flex justify-center">
                    <input
                        checked
                        className={`h-5 w-10 rounded-full appearance-none relative before:content-[''] before:absolute before:size-4 before:rounded-full before:top-0.5 before:left-0.5 transition-all ${disabled
                            ? "bg-slate-300 dark:bg-slate-800 opacity-50 cursor-not-allowed before:bg-slate-100 before:left-5"
                            : "bg-slate-200 dark:bg-slate-700 checked:bg-primary cursor-pointer before:bg-white checked:before:translate-x-5"
                            }`}
                        disabled={disabled}
                        type="checkbox"
                    />
                </div>
            </td>
        </tr>
    );
}

function ApprovalDelegation() {
    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border-2 border-primary shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0">
                <div className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">Critical Setting</div>
            </div>
            <div className="p-6 md:p-8 space-y-8">
                <div>
                    <h3 className="text-xl font-bold mb-1">Approval Delegation</h3>
                    <p className="text-sm text-[#4c739a]">Temporarily delegate your approval authority to another team member.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0d141b] dark:text-white">Delegate approvals to</label>
                        <div className="relative">
                            <select className="form-select w-full rounded-lg border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-3 px-4 focus:ring-primary focus:border-primary">
                                <option selected>Sarah Lee</option>
                                <option>Michael Chen</option>
                                <option>Jessica Park</option>
                                <option>David Wilson</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4c739a]">
                                <span className="material-symbols-outlined">expand_more</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0d141b] dark:text-white">Scope</label>
                        <div className="h-[46px] flex items-center">
                            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
                                <span className="material-symbols-outlined text-sm mr-2">verified_user</span>
                                Scope: All approvals
                            </span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0d141b] dark:text-white">From</label>
                        <div className="relative">
                            <input
                                className="form-input w-full rounded-lg border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-3 px-10 focus:ring-primary focus:border-primary"
                                type="text"
                                value="01/11/2024"
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-xl">calendar_today</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#0d141b] dark:text-white">To</label>
                        <div className="relative">
                            <input
                                className="form-input w-full rounded-lg border-[#e7edf3] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm py-3 px-10 focus:ring-primary focus:border-primary"
                                type="text"
                                value="10/11/2024"
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-xl">event_available</span>
                        </div>
                    </div>
                </div>
                <div className="pt-4 space-y-4">
                    <button className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-600 transition-all shadow-md active:scale-[0.98]">
                        <span className="material-symbols-outlined">assignment_ind</span>
                        Enable Delegation
                    </button>
                    <div className="flex gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-[#e7edf3] dark:border-slate-700">
                        <span className="material-symbols-outlined text-primary text-xl">info</span>
                        <p className="text-xs text-[#4c739a] leading-relaxed">
                            <span className="font-bold text-[#0d141b] dark:text-white">Note:</span> Delegation only affects approval rights. Access to payroll data and system configuration remains restricted to the original manager profile.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
function PageActions() {
    return (
        <div className="flex items-center justify-end gap-4 pt-6 pb-12 border-t border-[#e7edf3] dark:border-slate-800">
            <button className="px-8 py-3 rounded-lg border border-[#e7edf3] dark:border-slate-700 text-[#0d141b] dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
            </button>
            <button className="px-8 py-3 rounded-lg bg-primary text-white font-bold text-sm hover:bg-blue-600 shadow-sm transition-all active:scale-[0.98]">
                Save Changes
            </button>
        </div>
    );
}