import React, { useState, useEffect, useCallback } from "react";
import { fetchTeamCalendar } from "../../../../utils/managerApi";

function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split("T")[0];
}

function formatWeekRange(weekStart, weekEnd) {
    if (!weekStart || !weekEnd) return "";
    const s = new Date(weekStart + "T00:00:00");
    const e = new Date(weekEnd + "T00:00:00");
    const opts = { month: "short", day: "numeric" };
    if (s.getFullYear() !== e.getFullYear())
        return `${s.toLocaleDateString("en-US", { ...opts, year: "numeric" })} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
    return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

export default function TeamCalendarScreen() {
    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState("ALL");

    const load = useCallback(async (ws) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchTeamCalendar(ws);
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(weekStart); }, [weekStart, load]);

    const goToPrevWeek = () => {
        const d = new Date(weekStart + "T00:00:00");
        d.setDate(d.getDate() - 7);
        setWeekStart(d.toISOString().split("T")[0]);
    };
    const goToNextWeek = () => {
        const d = new Date(weekStart + "T00:00:00");
        d.setDate(d.getDate() + 7);
        setWeekStart(d.toISOString().split("T")[0]);
    };
    const goToToday = () => setWeekStart(getMonday(new Date()));

    const weekRange = data ? formatWeekRange(data.weekStart, data.weekEnd) : "";

    const filteredMembers = data?.members?.filter(m => {
        if (filterStatus === "ALL") return true;
        return m.days.some(d => d.status === filterStatus);
    }) ?? [];

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-1 overflow-y-auto flex flex-col gap-6">
                <CalendarHeader />
                <div className="grid xl:grid-cols-12 flex items-center justify-between">
                    <CalendarToolbar
                        weekRange={weekRange}
                        onPrev={goToPrevWeek}
                        onNext={goToNextWeek}
                        onToday={goToToday}
                    />
                    <CalendarFilter activeFilter={filterStatus} onFilter={setFilterStatus} />
                </div>

                {loading && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#e7edf3] dark:border-slate-800 p-12 flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-primary text-3xl mr-3">progress_activity</span>
                        <span className="text-[#4c739a]">Loading calendar...</span>
                    </div>
                )}

                {error && !loading && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-700 dark:text-red-400 flex items-center gap-3">
                        <span className="material-symbols-outlined">error</span>
                        <span>Failed to load calendar: {error}</span>
                        <button onClick={() => load(weekStart)} className="ml-auto text-sm underline">Retry</button>
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        <CalendarTable days={data.days} members={filteredMembers} />
                        <CalendarFooter />
                    </>
                )}
            </div>
        </div>
    );
}

function CalendarHeader() {
    return (
        <div className="flex items-end justify-between">
            <div>
                <h4 className="text-3xl font-extrabold text-[#0d141b] dark:text-white">
                    Team Calendar
                </h4>
                <p className="text-[#4c739a] dark:text-slate-400 font-medium mt-1">
                    Weekly availability overview
                </p>
            </div>
        </div>
    );
}

function CalendarToolbar({ weekRange, onPrev, onNext, onToday }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 xl:col-span-6">
            <div className="flex items-center gap-3">
                <div className="flex items-center bg-white dark:bg-slate-800 rounded-full border shadow-sm">
                    <button onClick={onPrev} className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined flex items-center">chevron_left</span>
                    </button>
                    <span className="px-6 py-1 text-sm font-bold border-x dark:border-slate-700 min-w-[200px] text-center">
                        {weekRange}
                    </span>
                    <button onClick={onNext} className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined flex items-center">chevron_right</span>
                    </button>
                </div>

                <button onClick={onToday} className="px-6 py-2.5 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-full text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    Today
                </button>
            </div>
        </div>
    );
}

function CalendarFilter({ activeFilter, onFilter }) {
    const filters = [
        { key: "ALL", label: "All", activeClass: "bg-[#0d141b] dark:bg-white text-white dark:text-[#0d141b]", inactiveClass: "bg-white dark:bg-slate-800 border dark:border-slate-700 text-[#0d141b] dark:text-white" },
        { key: "LEAVE", label: "Leave", activeClass: "bg-blue-100 text-primary border border-primary/30", inactiveClass: "bg-white dark:bg-slate-800 text-[#4c739a] border dark:border-slate-700" },
        { key: "REMOTE", label: "Remote", activeClass: "bg-yellow-100 text-yellow-700 border border-yellow-300", inactiveClass: "bg-white dark:bg-slate-800 text-[#4c739a] border dark:border-slate-700" },
        { key: "ONSITE", label: "Onsite", activeClass: "bg-green-100 text-green-700 border border-green-300", inactiveClass: "bg-white dark:bg-slate-800 text-[#4c739a] border dark:border-slate-700" },
    ];
    return (
        <div className="flex items-center gap-2 xl:col-span-6 justify-end">
            <span className="text-xs font-bold text-[#4c739a] uppercase tracking-wider mr-2">Filter by:</span>
            {filters.map(f => (
                <button
                    key={f.key}
                    onClick={() => onFilter(f.key)}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-colors ${activeFilter === f.key ? f.activeClass : f.inactiveClass}`}
                >
                    {f.label}
                </button>
            ))}
        </div>
    );
}

const STATUS_CONFIG = {
    ONSITE:  { label: "ONSITE",  textClass: "text-green-700 dark:text-green-400",  bgClass: "bg-green-50 dark:bg-green-900/20" },
    REMOTE:  { label: "REMOTE",  textClass: "text-yellow-700 dark:text-yellow-400", bgClass: "bg-yellow-50 dark:bg-yellow-900/20" },
    LEAVE:   { label: "LEAVE",   textClass: "text-blue-700 dark:text-blue-400",    bgClass: "bg-blue-50 dark:bg-blue-900/20" },
    ABSENT:  { label: "ABSENT",  textClass: "text-red-500 dark:text-red-400",      bgClass: "bg-red-50 dark:bg-red-900/20" },
    WEEKEND: { label: "",        textClass: "",                                     bgClass: "" },
};

function CalendarRow({ member, days }) {
    return (
        <div className="grid grid-cols-8 border-b border-[#e7edf3] dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <div className="p-4 border-r border-[#e7edf3] dark:border-slate-800 flex items-center gap-3">
                {member.avatarUrl ? (
                    <div
                        className="size-10 rounded-full bg-cover bg-center border-2 border-white shadow-sm flex-shrink-0"
                        style={{ backgroundImage: `url(${member.avatarUrl})` }}
                    />
                ) : (
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-sm">
                        {member.fullName?.charAt(0)}
                    </div>
                )}
                <span className="text-sm font-medium dark:text-white truncate">{member.fullName}</span>
            </div>

            {(member.days ?? []).map((dayCell, index) => {
                const cfg = STATUS_CONFIG[dayCell.status] ?? {};
                const isWeekend = dayCell.status === "WEEKEND";
                return (
                    <div key={index} className={`p-2 flex items-center justify-center ${isWeekend ? "bg-slate-100/30 dark:bg-slate-800/80" : ""}`}>
                        {dayCell.status && !isWeekend && (
                            <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full ${cfg.textClass} ${cfg.bgClass}`}>
                                {cfg.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function CalendarTable({ days = [], members = [] }) {
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#e7edf3] dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="grid grid-cols-8 border-b border-[#e7edf3] dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800/50">
                <div className="p-4 border-r border-[#e7edf3] dark:border-slate-800 font-bold text-xs uppercase text-[#4c739a]">Team Member</div>
                {days.map((day) => (
                    <div
                        key={day.date}
                        className={`p-4 text-center ${day.weekend ? "bg-slate-100/30 dark:bg-slate-800/80" : ""} ${day.date === today ? "bg-primary/5 border-b-2 border-primary" : ""}`}
                    >
                        <span className="block text-xs font-bold text-[#4c739a] uppercase tracking-tighter">{day.dayLabel}</span>
                        <span className={`block text-xl font-extrabold ${day.weekend ? "opacity-50" : ""} ${day.date === today ? "text-primary" : "dark:text-white"}`}>
                            {day.dayNumber}
                        </span>
                    </div>
                ))}
            </div>
            {members.length === 0 ? (
                <div className="p-12 text-center text-[#4c739a]">
                    <span className="material-symbols-outlined text-4xl mb-2 block">calendar_month</span>
                    No team members found
                </div>
            ) : (
                members.map((member) => (
                    <CalendarRow key={member.employeeId} member={member} days={days} />
                ))
            )}
        </div>
    );
}

function CalendarFooter() {
    const legend = [
        { key: "ONSITE",  label: "Onsite",  textClass: "text-green-700 dark:text-green-400",  dotClass: "bg-green-500" },
        { key: "REMOTE",  label: "Remote",  textClass: "text-yellow-700 dark:text-yellow-400", dotClass: "bg-yellow-500" },
        { key: "LEAVE",   label: "Leave",   textClass: "text-blue-700 dark:text-blue-400",    dotClass: "bg-blue-500" },
        { key: "ABSENT",  label: "Absent",  textClass: "text-red-600 dark:text-red-400",      dotClass: "bg-red-500" },
    ];
    return (
        <div className="mt-2 px-4 py-3 flex items-center justify-between gap-10 flex-wrap">
            <div className="flex items-center gap-6 flex-wrap">
                <span className="text-xs font-bold uppercase text-[#4c739a]">Legend:</span>
                {legend.map(l => (
                    <span key={l.key} className={`flex items-center gap-1.5 text-xs font-bold ${l.textClass}`}>
                        <span className={`size-2.5 rounded-full ${l.dotClass}`} />
                        {l.label}
                    </span>
                ))}
            </div>
            <div className="flex items-center gap-1 text-[10px] font-medium text-[#4c739a]">
                <span className="material-symbols-outlined text-sm">update</span>
                Data refreshes on week change
            </div>
        </div>
    );
}