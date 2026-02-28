import { useState } from "react";
import CheckinModal from "./hrm/attendance/CheckinModal";
import CheckoutModal from "./hrm/attendance/CheckoutModal";

export default function EmployeeHomeScreen() {
    const [showCheckinModal, setShowCheckinModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    return (
        <div className="flex flex-col gap-8">
            <WelcomeCard />
            <StatsGrid />
            <MainContent setShowCheckinModal={setShowCheckinModal} setShowCheckoutModal={setShowCheckoutModal} />
            {showCheckinModal && <CheckinModal onClose={() => setShowCheckinModal(false)} />}
            {showCheckoutModal && <CheckoutModal onClose={() => setShowCheckoutModal(false)} />}
        </div>
    );
}

function WelcomeCard() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#16222e] border border-[#e7edf3] dark:border-slate-800 shadow-sm p-6 flex flex-col @container">
            <div className="flex flex-col @xl:flex-row @xl:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-4xl">waving_hand</span>
                    </div>
                    <div>
                        <h2 className="text-[#0d141b] dark:text-white text-2xl font-extrabold tracking-tight">Good Morning, John 👋</h2>
                        <p className="text-[#4c739a] font-medium mt-1">Tuesday, October 24, 2023</p>
                    </div>
                </div>
                <div className="flex flex-col items-start @xl:items-end gap-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">Checked in at 09:00 AM</span>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
                        View Full Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatsGrid() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Today Attendance" status="Present" description="Ontime arrival" />
            <StatsCard title="Leave Balance" status="14 Days" description="2 days expiring soon" />
            <StatsCard title="Monthly OT" status="4.5 hrs" description="+15% from last month" />
            <StatsCard title="Pending Requests" status="2 Pending" description="Awaiting HR approval" />
        </div>
    );
}

function StatsCard({ title, status, description }) {
    return (
        <div className="bg-white dark:bg-[#16222e] p-6 rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm flex flex-col gap-1">
            <p className="text-[#4c739a] text-sm font-bold uppercase tracking-wider">{title}</p>
            <div className="flex items-baseline gap-2">
                <p className="text-[#0d141b] dark:text-white text-2xl font-extrabold leading-tight">{status}</p>
            </div>
            <p className="text-xs text-[#4c739a] mt-2">{description}</p>
        </div>
    );
}

function PendingCard({ title, status, action, history }) {
    const icon = history ? { icon: "history" } : { icon: "edit_document" };
    return (
        <div className="p-4 flex items-center justify-between border-b border-[#e7edf3] dark:border-slate-800 bg-amber-50/30 dark:bg-amber-500/5">
            <div className="flex items-center gap-4">
                <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 p-2 rounded-lg">
                    <span className="material-symbols-outlined">{icon.icon}</span>
                </div>
                <div>
                    <p className="text-sm font-bold text-[#0d141b] dark:text-white">{title}</p>
                    <p className="text-xs text-[#4c739a]">{status}</p>
                </div>
            </div>
            <button className="text-primary text-sm font-bold hover:underline">{action}</button>
        </div>
    );
}
function PendingActionSection() {
    return (
        <section>
            <h3 className="text-[#0d141b] dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">warning</span>
                Pending Actions
            </h3>
            <div className="bg-white dark:bg-[#16222e] rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm overflow-hidden">
                <PendingCard title="Missing check-out yesterday" status="Oct 23, 2023 • Log incomplete" action="Submit explanation" history />
                <PendingCard title="Update Medical Insurance" status="Expires in 12 days" action="Update Now" />
            </div>
        </section>
    );
}

function ActionCard({ icon, title, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-white dark:bg-[#16222e] border border-[#e7edf3] dark:border-slate-800 rounded-xl hover:border-primary hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <span className="text-xs font-bold text-[#0d141b] dark:text-white">{title}</span>
        </button>
    );
}

function QuickActionSection({ setShowCheckinModal, setShowCheckoutModal }) {
    const checkin = () => {
        setShowCheckinModal(true);
    }
    const checkout = () => {
        setShowCheckoutModal(true);
    }



    return (
        <section>
            <h3 className="text-[#0d141b] dark:text-white text-lg font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ActionCard icon="timer" title="Check-in" onClick={checkin} />
                <ActionCard icon="timer" title="Check-out" onClick={checkout} />
                <ActionCard icon="add_circle" title="New Request" />
                <ActionCard icon="calendar_month" title="My Attendance" />
                <ActionCard icon="assignment" title="My Requests" />
            </div>
        </section>
    );
}

function getNotificationIcon(title) {
    const iconMap = {
        'payslip': { icon: 'paid', bg: 'bg-primary/10', color: 'text-primary' },
        'leave': { icon: 'verified', bg: 'bg-emerald-100', color: 'text-emerald-600' },
        'policy': { icon: 'campaign', bg: 'bg-amber-100', color: 'text-amber-600' },
        'meeting': { icon: 'event', bg: 'bg-slate-100', color: 'text-slate-600' },
        'approved': { icon: 'verified', bg: 'bg-emerald-100', color: 'text-emerald-600' },
        'request': { icon: 'edit_document', bg: 'bg-blue-100', color: 'text-blue-600' },
        'reminder': { icon: 'notifications', bg: 'bg-purple-100', color: 'text-purple-600' }
    };

    const lowerTitle = title.toLowerCase();

    for (const [keyword, config] of Object.entries(iconMap)) {
        if (lowerTitle.includes(keyword)) {
            return config;
        }
    }

    // Default icon if no match found
    return { icon: 'notifications', bg: 'bg-slate-100', color: 'text-slate-600' };
}

function NotificationItem({ title, time }) {
    const { icon, bg, color } = getNotificationIcon(title);

    return (
        <div className="p-4 flex gap-4 border-b border-[#e7edf3] dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className={`${bg} ${color} h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <div>
                <p className="text-sm font-bold text-[#0d141b] dark:text-white leading-tight">{title}</p>
                <p className="text-xs text-[#4c739a] mt-1">{time}</p>
            </div>
        </div>
    );
}

function NotificationSection() {
    return (
        <div className="flex flex-col">
            {/* Header notification section */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#0d141b] dark:text-white text-lg font-bold">Notifications</h3>
                <a className="text-xs font-bold text-primary hover:underline uppercase tracking-wider" href="#">View All</a>
            </div>
            {/* Notification section */}
            <div className="bg-white dark:bg-[#16222e] rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm flex flex-col h-full">
                <NotificationItem
                    title="Payslip for Sept 2023 is now available"
                    time="2 hours ago"
                />
                <NotificationItem
                    title="Your Leave Request (Oct 30) was approved"
                    time="Yesterday"
                />
                <NotificationItem
                    title="New Policy: Updated Remote Work Guidelines"
                    time="Oct 21, 2023"
                />
                <NotificationItem
                    title="Upcoming Townhall Meeting"
                    time="Oct 20, 2023"
                />
            </div>
        </div>
    );
}

function MainContent({ setShowCheckinModal, setShowCheckoutModal }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* <!-- Left: Pending Actions & Quick Actions --> */}
            <div className="lg:col-span-2 flex flex-col gap-8">
                <PendingActionSection />
                <QuickActionSection setShowCheckinModal={setShowCheckinModal} setShowCheckoutModal={setShowCheckoutModal} />
            </div>

            {/* <!-- Right: Recent Notifications --> */}
            <NotificationSection />

        </div>
    );
}