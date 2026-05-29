import { useState } from "react";
import useManagerNotificationPolling from "../../../../hooks/useManagerNotificationPolling";

export default function NotificationScreen() {
    const [filter, setFilter] = useState("all");
    const { notifications, loading, error, handleMarkAsRead, handleMarkAllAsRead, unreadCounts, refresh } = useManagerNotificationPolling("all");

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        refresh(newFilter);
    };

    const formatTimeAgo = (createdAt) => {
        const now = new Date();
        const created = new Date(createdAt);
        const diffMs = now - created;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return created.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "approval":
                return "timer";
            case "alert":
                return "auto_awesome";
            case "info":
                return "info";
            default:
                return "notifications";
        }
    };

    const getNotificationColor = (type, priority) => {
        if (priority === "low") {
            return {
                border: "border-slate-300 dark:border-slate-700",
                bg: "bg-slate-100 dark:bg-slate-800",
                text: "text-slate-400",
                iconBg: "bg-slate-100 dark:bg-slate-800",
                iconText: "text-slate-400"
            };
        }
        switch (type) {
            case "approval":
                return {
                    border: "border-red-500",
                    bg: "bg-red-100 dark:bg-red-900/30",
                    text: "text-red-600",
                    iconBg: "bg-red-100 dark:bg-red-900/30",
                    iconText: "text-red-600"
                };
            case "alert":
                return {
                    border: "border-amber-500",
                    bg: "bg-amber-100 dark:bg-amber-900/30",
                    text: "text-amber-600",
                    iconBg: "bg-amber-100 dark:bg-amber-900/30",
                    iconText: "text-amber-600"
                };
            case "info":
            default:
                return {
                    border: "border-blue-500",
                    bg: "bg-blue-100 dark:bg-blue-900/30",
                    text: "text-blue-600",
                    iconBg: "bg-blue-100 dark:bg-blue-900/30",
                    iconText: "text-blue-600"
                };
        }
    };

    return (
        <main className="flex-1 flex flex-col min-w-0">
            {/* <!-- Workspace Content --> */}
            <div className=" mx-auto w-full grow">
                {/* <!-- Page Heading --> */}
                <PageHeading onMarkAllAsRead={handleMarkAllAsRead} unreadTotal={unreadCounts.total} />

                {/* <!-- Filter Chips --> */}
                <FilterChips filter={filter} setFilter={handleFilterChange} unreadCounts={unreadCounts} />

                {/* <!-- Notification List --> */}
                <NotificationSection
                    notifications={notifications}
                    loading={loading}
                    error={error}
                    onMarkAsRead={handleMarkAsRead}
                    formatTimeAgo={formatTimeAgo}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationColor={getNotificationColor}
                />

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

function PageHeading({ onMarkAllAsRead, unreadTotal }) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
                <h2 className="text-4xl font-black tracking-tight mb-2">Notifications / Inbox</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Things that need your attention</p>
            </div>
            <div className="flex items-center gap-3">
                {unreadTotal > 0 && (
                    <button
                        onClick={onMarkAllAsRead}
                        className="text-primary hover:text-primary/80 text-sm font-bold px-4 py-2 transition-colors"
                    >
                        Mark all as read
                    </button>
                )}
                <button className="size-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined">settings</span>
                </button>
            </div>
        </div>
    );
}

function FilterChips({ filter, setFilter, unreadCounts }) {
    const filters = [
        { key: "all", label: "All" },
        { key: "approval", label: "Approvals" },
        { key: "alert", label: "Alerts (AI / System)" },
        { key: "info", label: "Info" },
    ];

    return (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {filters.map((f) => (
                <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`h-10 px-6 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                        filter === f.key
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary"
                    }`}
                >
                    {f.label}
                    {f.key !== "all" && unreadCounts[f.key] > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                            {unreadCounts[f.key]}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

function NotificationSection({
    notifications,
    loading,
    error,
    onMarkAsRead,
    formatTimeAgo,
    getNotificationIcon,
    getNotificationColor,
}) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                <span className="material-symbols-outlined">error</span>
                <span>Failed to load notifications. Please try again later.</span>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="size-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-slate-400">notifications_none</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">No notifications found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {notifications.map((notification) => {
                const colors = getNotificationColor(notification.type, notification.priority);
                const icon = getNotificationIcon(notification.type);
                const isUnread = !notification.read;

                return (
                    <div
                        key={notification.id}
                        className={`group relative bg-white dark:bg-slate-900 border-l-4 ${colors.border} p-5 rounded-r-xl rounded-l-md shadow-sm hover:shadow-md transition-all flex items-start gap-4 ring-1 ring-slate-200 dark:ring-slate-800 ${
                            isUnread ? "" : "opacity-80"
                        }`}
                    >
                        <div className="flex-shrink-0 mt-1 relative">
                            <div className={`size-10 rounded-full ${colors.iconBg} ${colors.iconText} flex items-center justify-center`}>
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontVariationSettings: isUnread ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                    {icon}
                                </span>
                            </div>
                            {isUnread && (
                                <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`font-black truncate ${isUnread ? "text-[#0d141b] dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                                    {notification.title}
                                </h3>
                                <span className="text-xs font-bold text-slate-400 whitespace-nowrap ml-4">
                                    {formatTimeAgo(notification.createdAt)}
                                </span>
                            </div>
                            <p className={`text-sm mb-3 ${isUnread ? "text-slate-600 dark:text-slate-400" : "text-slate-400 dark:text-slate-500"}`}>
                                {notification.message}
                            </p>
                            <div className="flex items-center gap-3">
                                {notification.actionUrl && (
                                    <a
                                        href={notification.actionUrl}
                                        className={`text-xs font-bold px-4 py-2 rounded-full transition-colors ${
                                            isUnread
                                                ? "bg-primary text-white hover:bg-primary/90"
                                                : "border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
                                        }`}
                                    >
                                        View Details
                                    </a>
                                )}
                                {isUnread && (
                                    <button
                                        onClick={() => onMarkAsRead(notification.id)}
                                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold px-2 py-1 transition-colors"
                                    >
                                        Dismiss
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
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