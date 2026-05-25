import { useState, useEffect } from "react";
import { fetchMyAttendance, fetchMyAttendanceCycles, getAttendanceStatusConfig } from "../../../../utils/employeeApi";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export default function MyAttendanceScreen() {
    /* ── Cycles: danh sách kỳ từ backend (dựa trên AttendancePeriodConfig) ── */
    const [cycles, setCycles] = useState([]);        /* 12 kỳ gần nhất */
    const [selectedCycle, setSelectedCycle] = useState(null); /* kỳ đang chọn */
    const [cyclesLoading, setCyclesLoading] = useState(true);

    /* ── Attendance data cho kỳ đang chọn ──────────────────────── */
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");

    /* Bước 1: Lấy danh sách kỳ — chạy 1 lần khi mount */
    useEffect(() => {
        fetchMyAttendanceCycles()
            .then(list => {
                setCycles(list);
                /* Tự chọn kỳ hiện tại (isCurrent = true) */
                const current = list.find(c => c.isCurrent) || list[0];
                setSelectedCycle(current || null);
            })
            .catch(console.error)
            .finally(() => setCyclesLoading(false));
    }, []);

    /* Bước 2: Lấy data attendance khi selectedCycle thay đổi */
    useEffect(() => {
        if (!selectedCycle) return;
        setLoading(true);
        fetchMyAttendance(selectedCycle.startDate, selectedCycle.endDate)
            .then(res => setData(res))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedCycle]);

    const stats = data?.stats || {};
    const todayRecord = data?.today;
    const records = (data?.records || []).filter(r => {
        if (statusFilter === "All") return true;
        return r.status?.toLowerCase() === statusFilter.toLowerCase();
    });

    /* ── Fallback UI: nếu không có cycles (lỗi API hoặc chưa có data) ── */
    if (!cyclesLoading && cycles.length === 0) {
        return (
            <main className="overflow-y-auto scrollbar-hide">
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-6xl">
                        calendar_month
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white">Không thể tải kỳ chấm công</h3>
                    <p className="text-sm text-slate-500 max-w-md text-center">
                        Hệ thống không tìm thấy dữ liệu kỳ chấm công. Vui lòng liên hệ HR Admin để cấu hình kỳ chấm công hoặc thử lại sau.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="overflow-y-auto scrollbar-hide">
            <div className="space-y-8">
                <PendingExplanationsSection />
                <TodayAttendanceCard record={todayRecord} loading={loading} />
                <SummaryStatsGrid stats={stats} loading={loading} />
                <AttendanceHistorySection
                    records={records}
                    loading={loading}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    cycles={cycles}
                    cyclesLoading={cyclesLoading}
                    selectedCycle={selectedCycle}
                    setSelectedCycle={setSelectedCycle}
                    totalCount={data?.records?.length || 0}
                />
            </div>
            <Footer />
        </main>
    );
}

function TodayAttendanceCard({ record, loading }) {
    const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    const status = record?.status || "no_record";
    const statusCfg = getAttendanceStatusConfig(status);
    const checkin = record?.checkInTime || "--:--";
    const checkout = record?.checkOutTime || "--:--";
    const shiftEnd = record?.shiftEnd || "18:00";
    const isRemote = record?.isRemote;

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                    {loading
                        ? <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                        : <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${statusCfg.badge}`}>
                            <span className={`size-2 rounded-full ${statusCfg.dot}`}></span>
                            {statusCfg.label}
                          </span>
                    }
                    <span className="text-slate-400 text-sm">•</span>
                    <p className="text-slate-900 dark:text-white font-bold text-lg">Today – {todayLabel}</p>
                    {isRemote && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 rounded-full font-bold">Remote</span>}
                </div>
                <div className="grid grid-cols-2 gap-8 py-2">
                    <div className="space-y-1">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-tight">Check-in Time</p>
                        {loading
                            ? <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                            : <p className={`text-2xl font-extrabold ${checkin !== '--:--' ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>{checkin}</p>
                        }
                    </div>
                    <div className="space-y-1">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-tight">Check-out Time</p>
                        {loading
                            ? <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                            : <p className={`text-2xl font-extrabold ${checkout !== '--:--' ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>{checkout}</p>
                        }
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!record?.checkout && record?.checkin && (
                        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                            Check-out
                        </button>
                    )}
                    {shiftEnd && <p className="text-sm text-slate-500 italic">Expected checkout: {shiftEnd}</p>}
                </div>
            </div>
            <div className="w-full md:w-64 h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                <div className="absolute bottom-3 left-3 flex gap-2">
                    <span className="bg-white/90 dark:bg-slate-900/90 text-[10px] px-2 py-1 rounded font-bold shadow-sm">HQ Office</span>
                    {record?.checkin && <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-1 rounded font-bold shadow-sm">Verified</span>}
                </div>
            </div>
        </section>
    );
}
function StatsCard(props) {
    const itemColor = [
        "bg-blue-50 dark:bg-blue-500/10",
        "bg-amber-50 dark:bg-amber-500/10",
        "bg-red-50 dark:bg-red-500/10",
        "bg-green-50 dark:bg-green-500/10"
    ];

    const textColor = [
        "text-blue-600 bg-blue-50",
        "text-amber-600 bg-amber-50",
        "text-red-600 bg-red-50",
        "text-green-600 bg-green-50"
    ];
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-transform hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-3">
                <div className={`p-2 ${itemColor[props.index]} rounded-lg`}>
                    <span className="material-symbols-outlined text-blue-600 text-xl">{props.icon}</span>
                </div>
                <span className={`text-[10px] font-bold ${textColor[props.index]} px-2 py-0.5 rounded uppercase`}>This Month</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{props.label}</p>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{props.days}</div>
        </div>
    )
}
function SummaryStatsGrid({ stats, loading }) {
    const Skeleton = () => <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" />;
    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard index={0} icon="calendar_month" label="Working Days" days={loading ? <Skeleton /> : stats.workingDays ?? "–"} />
            <StatsCard index={1} icon="schedule" label="Late Days" days={loading ? <Skeleton /> : stats.lateDays ?? "–"} />
            <StatsCard index={2} icon="error" label="Missing Records" days={loading ? <Skeleton /> : stats.missingRecords ?? "–"} />
            <StatsCard index={3} icon="hourglass_top" label="OT Hours" days={loading ? <Skeleton /> : stats.otHours ?? "–"} />
        </section>
    );
}

function Tr(props) {
    const isRequest = props.isRequest ? <a className="text-primary hover:underline text-xs font-bold flex items-center gap-1" href="#">
        Request adjustment
        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
    </a> : <span className="material-symbols-outlined text-[18px]">{props.icon}</span>;

    const statusColor = props.status == "Missing" ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
        : props.status == "Present" ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
            : props.status == "Working" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                : props.status == "Late" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400";

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{props.datetime}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{props.day}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{props.checkin}</td>
            <td className="px-6 py-4 text-sm text-slate-400 dark:text-slate-600">{props.checkout}</td>
            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{props.workingHours}</td>
            <td className="px-6 py-4">
                <span className={`px-2.5 py-1  text-[10px] font-bold rounded uppercase tracking-wide ${statusColor}`}>{props.status}</span>
            </td>
            <td className="px-6 py-4">

                <button className="text-slate-400 hover:text-primary transition-colors">
                    {isRequest}
                </button>
            </td>
        </tr>
    );
}

function AttendanceHistorySection({ records, loading, statusFilter, setStatusFilter, cycles, cyclesLoading, selectedCycle, setSelectedCycle, totalCount }) {
    const filters = ["All", "Present", "Working", "Late", "Missing"];
    const dateLabel = (dateStr) => {
        try { return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
        catch { return dateStr; }
    };

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Attendance History</h3>
                    {/* Hiển thị kỳ đang xem — startDate → endDate */}
                    {selectedCycle && (
                        <p className="text-xs text-slate-400 mt-0.5">
                            Period: {dateLabel(selectedCycle.startDate)} – {dateLabel(selectedCycle.endDate)}
                        </p>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Dropdown chọn kỳ chấm công (thay thế month/year selector) */}
                    {cyclesLoading ? (
                        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    ) : (
                        <select
                            value={selectedCycle ? `${selectedCycle.startDate}|${selectedCycle.endDate}` : ""}
                            onChange={e => {
                                /* Parse lại startDate|endDate từ value */
                                const [start, end] = e.target.value.split("|");
                                const found = cycles.find(c => c.startDate === start && c.endDate === end);
                                if (found) setSelectedCycle(found);
                            }}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-lg px-3 py-2 focus:ring-primary"
                        >
                            {cycles.map(c => (
                                <option key={`${c.startDate}|${c.endDate}`} value={`${c.startDate}|${c.endDate}`}>
                                    {c.label}{c.isCurrent ? " (Current)" : ""}
                                </option>
                            ))}
                        </select>
                    )}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {filters.map(f => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                                    statusFilter === f ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                                }`}
                            >{f}</button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Check-in</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Check-out</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Working Hours</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td></tr>
                            ))
                            : records.length === 0
                                ? <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">No records found</td></tr>
                                : records.map((r,index) => (
                                    <Tr
                                        key={index}
                                        datetime={dateLabel(r.attendanceDate)}
                                        day={r.dayOfWeek}
                                        checkin={r.checkInTime || "–"}
                                        checkout={r.checkOutTime || "–"}
                                        workingHours={r.workHours || "–"}
                                        status={r.status}
                                        isRequest={r.isException || r.status === "Missing"}
                                        icon={r.status === "Missing" ? "error" : "check_circle"}
                                    />
                                ))
                        }
                    </tbody>
                </table>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">Showing {records.length} of {totalCount} entries this period</p>
            </div>
        </section>
    );
}

function PendingExplanationsSection() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [explanation, setExplanation] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchPending = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/employee/attendance-exceptions/my-pending`, { headers: getHeaders() });
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setItems(data);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPending(); }, []);

    const openModal = (item) => { setSelected(item); setExplanation(""); setError(""); };
    const closeModal = () => { setSelected(null); setExplanation(""); setError(""); };

    const handleSubmit = async () => {
        if (!explanation.trim()) { setError("Explanation cannot be empty."); return; }
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/employee/attendance-exceptions/${selected.exceptionId}/submit-explanation`,
                { method: "POST", headers: getHeaders(), body: JSON.stringify({ explanation }) }
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Submit failed");
            setItems(prev => prev.filter(i => i.exceptionId !== selected.exceptionId));
            closeModal();
        } catch (e) {
            setError(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || items.length === 0) return null;

    const exceptionTypeLabel = (type) => type?.replace(/_/g, " ") ?? type;

    return (
        <>
            <section className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                        <span className="material-symbols-outlined text-amber-600 text-xl">warning</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Action Required — Explanation Needed</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">HR has requested explanations for the following attendance records</p>
                    </div>
                    <span className="ml-auto px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">{items.length}</span>
                </div>
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.exceptionId} className="bg-white dark:bg-slate-900 rounded-xl border border-amber-100 dark:border-slate-700 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded uppercase">
                                        {exceptionTypeLabel(item.exceptionType)}
                                    </span>
                                    <span className="text-xs text-slate-400">{item.attendanceDate}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{item.reason}</p>
                                {item.hrComment && (
                                    <p className="text-xs text-slate-500 italic">HR note: {item.hrComment}</p>
                                )}
                            </div>
                            <button
                                onClick={() => openModal(item)}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0"
                            >
                                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                                Submit Explanation
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h2 className="font-bold text-slate-900 dark:text-white">Submit Explanation</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {exceptionTypeLabel(selected.exceptionType)} • {selected.attendanceDate}
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Reason flagged</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{selected.reason}</p>
                                {selected.hrComment && (
                                    <p className="text-xs text-primary mt-1">HR note: {selected.hrComment}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1.5 block">
                                    Your Explanation
                                </label>
                                <textarea
                                    value={explanation}
                                    onChange={e => setExplanation(e.target.value)}
                                    placeholder="Please explain the reason for this attendance exception..."
                                    rows={5}
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <p className="text-right text-xs text-slate-400 mt-1">{explanation.length} chars</p>
                            </div>
                            {error && (
                                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[16px]">error</span>{error}
                                </p>
                            )}
                        </div>
                        <div className="p-6 pt-0 flex gap-3 justify-end">
                            <button onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all"
                            >
                                {submitting ? (
                                    <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>Submitting...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[16px]">send</span>Submit</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function Footer() {
    return (
        <footer className="mt-auto px-8 py-6 text-center text-slate-400 text-xs border-t border-slate-200 dark:border-slate-800">
            © 2023 SmartOps Enterprise Portal • Version 2.4.1 • Data synced 2 minutes ago
        </footer>
    );
}