function PageHeading() {
    return (
        <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Notifications / Inbox</h1>
                <p className="text-slate-500 dark:text-slate-400 text-base">Updates about your HR activities</p>
            </div>
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 transition-colors">
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

function FilterBar() {
    return (
        <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl w-fit">
            <button className="flex h-9 items-center justify-center px-5 rounded-lg bg-white dark:bg-slate-700 text-primary text-sm font-bold shadow-sm">
                All
            </button>
            <button className="flex h-9 items-center justify-center px-5 rounded-lg text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all">
                Requests
            </button>
            <button className="flex h-9 items-center justify-center px-5 rounded-lg text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all">
                Attendance
            </button>
            <button className="flex h-9 items-center justify-center px-5 rounded-lg text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all">
                Payroll
            </button>
            <button className="flex h-9 items-center justify-center px-5 rounded-lg text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all">
                System
            </button>
        </div>
    );
}

function LoadButton() {
    return (
        <div className="flex justify-center mt-4">
            <button className="text-primary font-bold text-sm hover:underline py-2 px-4 rounded-lg hover:bg-primary/5 transition-all">
                Load older notifications
            </button>
        </div>
    )
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

function NotificationButton({ isUnread }) {
    if (isUnread) {
        return (
            <button className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                View
            </button>
        );
    }
    return (
        <button className="px-5 py-2 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            View
        </button>
    );
}

function NotificationItem({ icon, iconBgColor, iconTextColor, title, message, time, isUnread }) {
    const baseClasses = "group flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-all";
    const hoverClasses = isUnread
        ? "hover:shadow-md hover:border-primary/30 unread-tint relative overflow-hidden"
        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-90";

    return (
        <div className={`${baseClasses} ${hoverClasses}`}>
            {isUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
            <div className="flex items-center gap-4 flex-1">
                <NotificationIcon icon={icon} bgColor={iconBgColor} textColor={iconTextColor} />
                <NotificationContent title={title} message={message} time={time} isUnread={isUnread} />
            </div>
            <div className="shrink-0">
                <NotificationButton isUnread={isUnread} />
            </div>
        </div>
    );
}

function NotificationsSection() {
    return (
        <div className="flex flex-col gap-3">
            {/* <!-- Unread Leave Request --> */}
            <NotificationItem
                icon="check_circle"
                iconBgColor="bg-green-100 dark:bg-green-900/30"
                iconTextColor="text-green-600 dark:text-green-400"
                title="Leave Request Approved"
                message="Your leave request (Oct 28–29) was approved"
                time="2 hours ago"
                isUnread={true}
            />

            {/* <!-- Unread Attendance --> */}
            <NotificationItem
                icon="warning"
                iconBgColor="bg-orange-100 dark:bg-orange-900/30"
                iconTextColor="text-orange-600 dark:text-orange-400"
                title="Missing Check-out"
                message="You missed a check-out on Oct 23. Please update your logs."
                time="Yesterday"
                isUnread={true}
            />

            {/* <!-- Read Payroll --> */}
            <NotificationItem
                icon="payments"
                iconBgColor="bg-blue-100 dark:bg-blue-900/30"
                iconTextColor="text-blue-600 dark:text-blue-400"
                title="Payslip Available"
                message="Your September payslip is ready for viewing"
                time="Oct 05"
                isUnread={false}
            />

            {/* <!-- Read System Notification --> */}
            <NotificationItem
                icon="info"
                iconBgColor="bg-slate-100 dark:bg-slate-800"
                iconTextColor="text-slate-600 dark:text-slate-400"
                title="Platform Maintenance"
                message="System will be down for scheduled maintenance tonight at 12 AM"
                time="Oct 04"
                isUnread={false}
            />
        </div>
    );
}

export default function NotificationScreen() {
    return (
        <main className="flex-1 flex flex-col ">
            <div className=" w-full flex flex-col gap-6">
                {/* <!-- PageHeading --> */}
                <PageHeading />

                {/* <!-- Filter Tabs --> */}
                <FilterBar />

                {/* <!-- Notification List --> */}
                <NotificationsSection />

                {/* <!-- Load More button --> */}
                <LoadButton />

            </div>
        </main>
    );
}