import { useState, useEffect } from "react";
import CheckinModal from "../../common/CheckinModal";
import CheckoutModal from "../../common/CheckoutModal";
import { fetchDashboard, fetchNotifications, markNotificationRead, markAllNotificationsRead } from "../../utils/employeeApi";

export default function EmployeeHomeScreen() {
    const [showCheckinModal, setShowCheckinModal] = useState(false);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [dashboard, setDashboard] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchDashboard(), fetchNotifications()])
            .then(([dash, notifs]) => {
                setDashboard(dash.data);
                setNotifications(Array.isArray(notifs) ? notifs.slice(0, 5) : []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (e) { console.error(e); }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex flex-col gap-8">
            <WelcomeCard dashboard={dashboard} loading={loading} />
            <StatsGrid dashboard={dashboard} loading={loading} />
            <MainContent
                dashboard={dashboard}
                notifications={notifications}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
                setShowCheckinModal={setShowCheckinModal}
                setShowCheckoutModal={setShowCheckoutModal}
            />
            {showCheckinModal && <CheckinModal onClose={() => setShowCheckinModal(false)} />}
            {showCheckoutModal && <CheckoutModal onClose={() => setShowCheckoutModal(false)} />}
        </div>
    );
}

function WelcomeCard({ dashboard, loading }) {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const name = dashboard?.employeeName || "–";
    const avatar = dashboard?.avatar;
    const checkin = dashboard?.todayAttendance?.checkInTime;
    const todayStatus = dashboard?.todayAttendance?.status || "no_record";

    const checkinBadge = checkin
        ? { bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", label: `Checked in at ${checkin}` }
        : { bg: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700", dot: "bg-slate-400", text: "text-slate-500", label: "Not checked in yet" };

    return (
        <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#16222e] border border-[#e7edf3] dark:border-slate-800 shadow-sm p-6 flex flex-col @container">
            <div className="flex flex-col @xl:flex-row @xl:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                    {avatar
                        ? <img src={avatar} alt={name} className="h-16 w-16 rounded-xl object-cover" />
                        : <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><span className="material-symbols-outlined text-4xl">waving_hand</span></div>
                    }
                    <div>
                        {loading
                            ? <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                            : <h2 className="text-[#0d141b] dark:text-white text-2xl font-extrabold tracking-tight">Good Morning, {name} 👋</h2>
                        }
                        <p className="text-[#4c739a] font-medium mt-1">{today}</p>
                    </div>
                </div>
                <div className="flex flex-col items-start @xl:items-end gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full ${checkinBadge.bg}`}>
                        <span className={`flex h-2 w-2 rounded-full ${checkinBadge.dot}`}></span>
                        <span className={`text-sm font-bold ${checkinBadge.text}`}>{checkinBadge.label}</span>
                    </div>
                    <button className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors">
                        View Full Profile
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatsGrid({ dashboard, loading }) {
    const todayStatus = dashboard?.todayAttendance?.status;
    const lateMinutes = dashboard?.todayAttendance?.lateMinutes || 0;
    const attendanceLabel = todayStatus === "late" ? `Late (${lateMinutes}m)` : todayStatus === "working" ? "Working" : todayStatus === "present" ? "Present" : todayStatus === "absent" ? "Absent" : "–";
    const attendanceDesc = todayStatus === "late" ? `${lateMinutes} min late today` : todayStatus === "working" ? "Currently clocked in" : todayStatus === "present" ? "On-time arrival" : "No record yet";

    const leaveRemaining = dashboard?.leaveBalance?.totalRemaining ?? "–";
    const otHours = dashboard?.monthlyOtHours ?? "–";
    const pendingCount = dashboard?.pendingRequestsCount ?? "–";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard loading={loading} title="Today Attendance" status={loading ? "–" : attendanceLabel} description={loading ? "" : attendanceDesc} />
            <StatsCard loading={loading} title="Leave Balance" status={loading ? "–" : `${leaveRemaining} Days`} description="Remaining this year" />
            <StatsCard loading={loading} title="Monthly OT" status={loading ? "–" : `${otHours} hrs`} description="This month" />
            <StatsCard loading={loading} title="Pending Requests" status={loading ? "–" : `${pendingCount} Pending`} description="Awaiting approval" />
        </div>
    );
}

function StatsCard({ title, status, description, loading }) {
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

function PendingCard({ title, status, action, icon = "edit_document" }) {
    return (
        <div className="p-4 flex items-center justify-between border-b border-[#e7edf3] dark:border-slate-800 bg-amber-50/30 dark:bg-amber-500/5 last:border-0">
            <div className="flex items-center gap-4">
                <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 p-2 rounded-lg">
                    <span className="material-symbols-outlined">{icon}</span>
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
function PendingActionSection({ dashboard }) {
    const pendingExplanations = dashboard?.pendingExplanationsCount || 0;
    const pendingRequests = dashboard?.pendingRequestsCount || 0;
    const hasActions = pendingExplanations > 0 || pendingRequests > 0;

    return (
        <section>
            <h3 className="text-[#0d141b] dark:text-white text-lg font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">warning</span>
                Pending Actions
                {hasActions && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">
                        {pendingExplanations + pendingRequests}
                    </span>
                )}
            </h3>
            <div className="bg-white dark:bg-[#16222e] rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm overflow-hidden">
                {pendingExplanations > 0 && (
                    <PendingCard
                        title={`${pendingExplanations} attendance explanation${pendingExplanations > 1 ? 's' : ''} required`}
                        status="Review and submit your explanation"
                        action="Submit Now"
                        icon="history"
                    />
                )}
                {pendingRequests > 0 && (
                    <PendingCard
                        title={`${pendingRequests} request${pendingRequests > 1 ? 's' : ''} awaiting approval`}
                        status="Track your submitted requests"
                        action="View Requests"
                    />
                )}
                {!hasActions && (
                    <div className="p-8 flex flex-col items-center justify-center text-center gap-2">
                        <span className="material-symbols-outlined text-emerald-400 text-3xl">check_circle</span>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No pending actions — you're all caught up!</p>
                    </div>
                )}
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

function NotificationItem({ notification, onMarkRead }) {
    const { icon, bg, color } = getNotificationIcon(notification.title);
    const timeAgo = notification.createdAt
        ? new Date(notification.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "";

    return (
        <div
            className={`p-4 flex gap-4 border-b border-[#e7edf3] dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
            onClick={() => !notification.read && onMarkRead(notification.id)}
        >
            <div className={`${bg} ${color} h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center relative`}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
                {!notification.read && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-white dark:border-[#16222e]" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm leading-tight ${notification.read ? 'text-[#0d141b] dark:text-slate-300 font-medium' : 'font-bold text-[#0d141b] dark:text-white'}`}>{notification.title}</p>
                {notification.message && <p className="text-xs text-slate-500 mt-0.5 truncate">{notification.message}</p>}
                <p className="text-xs text-[#4c739a] mt-1">{timeAgo}</p>
            </div>
        </div>
    );
}

function NotificationSection({ notifications, onMarkRead, onMarkAllRead }) {
    const unreadCount = notifications.filter(n => !n.read).length;
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#0d141b] dark:text-white text-lg font-bold flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && <span className="px-2 py-0.5 text-xs font-bold bg-primary text-white rounded-full">{unreadCount}</span>}
                </h3>
                <button onClick={onMarkAllRead} className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">Mark all read</button>
            </div>
            <div className="bg-white dark:bg-[#16222e] rounded-xl border border-[#e7edf3] dark:border-slate-800 shadow-sm flex flex-col h-full">
                {notifications.length === 0
                    ? <div className="p-8 text-center text-sm text-slate-400">No notifications</div>
                    : notifications.map(n => <NotificationItem key={n.id} notification={n} onMarkRead={onMarkRead} />)
                }
            </div>
        </div>
    );
}

function MainContent({ dashboard, notifications, onMarkRead, onMarkAllRead, setShowCheckinModal, setShowCheckoutModal }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
                <PendingActionSection dashboard={dashboard} />
                <QuickActionSection setShowCheckinModal={setShowCheckinModal} setShowCheckoutModal={setShowCheckoutModal} />
            </div>
            <NotificationSection notifications={notifications} onMarkRead={onMarkRead} onMarkAllRead={onMarkAllRead} />
        </div>
    );
}