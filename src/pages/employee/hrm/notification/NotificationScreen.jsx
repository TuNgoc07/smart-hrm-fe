import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useNotificationPolling from '../../../../hooks/useNotificationPolling';

const FILTER_TABS = ['All', 'Requests', 'Attendance', 'Payroll', 'System'];

const FILTER_TYPE_MAP = {
    'Requests': 'REQUESTS',
    'Attendance': 'ATTENDANCE',
    'Payroll': 'PAYROLL',
    'System': 'SYSTEM',
};

const getIconConfig = (type, title = '') => {
    const t = title.toLowerCase();
    if (type === 'ATTENDANCE') {
        if (t.includes('explanation')) return { icon: 'assignment_late', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' };
        if (t.includes('approved')) return { icon: 'check_circle', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' };
        if (t.includes('rejected')) return { icon: 'cancel', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' };
        return { icon: 'warning', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' };
    }
    if (type === 'REQUESTS') return { icon: 'event_available', bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' };
    if (type === 'PAYROLL') return { icon: 'payments', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' };
    return { icon: 'info', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' };
};

const formatTime = (createdAt) => {
    if (!createdAt) return '';
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

function PageHeading({ onMarkAllRead }) {
    return (
        <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Notifications / Inbox</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">Updates about your HR activities</p>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onMarkAllRead}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">done_all</span>
                    <span>Mark all as read</span>
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">settings</span>
                </button>
            </div>
        </div>
    );
}

function FilterBar({ activeFilter, onFilterChange }) {
    return (
        <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl w-fit">
            {FILTER_TABS.map(tab => (
                <button
                    key={tab}
                    onClick={() => onFilterChange(tab)}
                    className={`flex h-9 items-center justify-center px-5 rounded-lg text-sm transition-all ${
                        activeFilter === tab
                            ? 'bg-white dark:bg-slate-700 text-primary font-bold shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-white/50 dark:hover:bg-slate-700/50'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}

function NotificationIcon({ icon, bgColor, textColor }) {
    return (
        <div className={`flex items-center justify-center rounded-lg ${bgColor} ${textColor} shrink-0 size-12`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
    );
}

function NotificationContent({ title, message, time, isUnread }) {
    return (
        <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
                <p className={`${isUnread ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300 font-medium'} text-base leading-normal`}>
                    {title}
                </p>
                {isUnread && <div className="h-2 w-2 rounded-full bg-primary shrink-0"></div>}
            </div>
            <p className={`${isUnread ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-500'} text-sm leading-normal line-clamp-1`}>
                {message}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 font-medium">{time}</p>
        </div>
    );
}

function NotificationButton({ isUnread, onClick }) {
    if (isUnread) {
        return (
            <button
                onClick={onClick}
                className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
                View
            </button>
        );
    }
    return (
        <button
            onClick={onClick}
            className="px-5 py-2 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
            View
        </button>
    );
}

function NotificationItem({ notification, onMarkRead, navigate }) {
    const isUnread = !notification.read;
    const { icon, bg, text } = getIconConfig(notification.type, notification.title);
    const time = formatTime(notification.createdAt);

    const baseClasses = "group flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all";
    const hoverClasses = isUnread
        ? "hover:shadow-md hover:border-primary/30 unread-tint relative overflow-hidden"
        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-90";

    const handleView = () => {
        if (isUnread) onMarkRead(notification.id);
        if (notification.actionUrl) navigate(notification.actionUrl);
    };

    return (
        <div className={`${baseClasses} ${hoverClasses}`}>
            {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
            <div className="flex items-center gap-4 flex-1">
                <NotificationIcon icon={icon} bgColor={bg} textColor={text} />
                <NotificationContent title={notification.title} message={notification.message} time={time} isUnread={isUnread} />
            </div>
            <div className="shrink-0">
                <NotificationButton isUnread={isUnread} onClick={handleView} />
            </div>
        </div>
    );
}

function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 animate-pulse">
                    <div className="rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 size-12"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ filter }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 size-16 mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">notifications_off</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">No notifications</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {filter === 'All' ? "You're all caught up!" : `No ${filter.toLowerCase()} notifications`}
            </p>
        </div>
    );
}

export default function NotificationScreen() {
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('All');
    const { notifications, loading, error, handleMarkAsRead, handleMarkAllAsRead } = useNotificationPolling();

    const filtered = activeFilter === 'All'
        ? notifications
        : notifications.filter(n => n.type === FILTER_TYPE_MAP[activeFilter]);

    return (
        <main className="flex-1 flex flex-col ">
            <div className=" w-full flex flex-col gap-6">
                <PageHeading onMarkAllRead={handleMarkAllAsRead} />

                <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

                {loading ? (
                    <LoadingSkeleton />
                ) : error ? (
                    <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        <span className="material-symbols-outlined">error</span>
                        <span>Failed to load notifications. Please try again later.</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <EmptyState filter={activeFilter} />
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map(n => (
                            <NotificationItem
                                key={n.id}
                                notification={n}
                                onMarkRead={handleMarkAsRead}
                                navigate={navigate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}