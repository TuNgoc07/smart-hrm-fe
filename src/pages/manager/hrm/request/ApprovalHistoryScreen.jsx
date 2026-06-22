import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApprovalHistory } from "../../../../utils/managerApi";

export default function ApprovalHistoryScreen() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState(30);
    const [typeFilter, setTypeFilter] = useState("all");
    const [decisionFilter, setDecisionFilter] = useState("all");
    const [search, setSearch] = useState("");
    const searchTimerRef = useRef(null);

    const load = useCallback(async (params) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchApprovalHistory(params);
            setData(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load({ dateRange, type: typeFilter, decision: decisionFilter, search });
    }, [dateRange, typeFilter, decisionFilter, load]);

    const handleSearchChange = (val) => {
        setSearch(val);
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            load({ dateRange, type: typeFilter, decision: decisionFilter, search: val });
        }, 400);
    };

    const records = data?.records ?? [];

    return (
        <div className="flex-1 overflow-y-auto space-y-6">
            <nav className="flex items-center gap-2 text-sm">
                <button onClick={() => navigate(-1)} className="text-primary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Approvals
                </button>
                <span className="text-[#4c739a]">/</span>
                <span className="text-[#4c739a]">History</span>
            </nav>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-[#0d141b] dark:text-white text-3xl font-black tracking-tight">Approval History</h1>
                    <p className="text-[#4c739a] text-base font-normal">Audit log of your managerial decisions</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <select
                        value={dateRange}
                        onChange={e => setDateRange(Number(e.target.value))}
                        className="h-10 rounded-lg bg-white dark:bg-slate-800 border border-[#e7edf3] dark:border-slate-700 px-3 text-sm font-medium text-[#0d141b] dark:text-white"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={60}>Last 60 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>
                </div>
            </div>
            <div className="bg-white dark:bg-[#182430] p-4 rounded-xl border border-[#e7edf3] dark:border-slate-700 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px] relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person_search</span>
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-background-light dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                        placeholder="Search employee..."
                        type="text"
                        value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap gap-3">
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        className="h-9 rounded-lg bg-background-light dark:bg-slate-900 px-3 text-sm text-[#0d141b] dark:text-white border-none"
                    >
                        <option value="all">All Types</option>
                        <option value="leave">Leave</option>
                        <option value="ot">OT</option>
                        <option value="adjust">Attendance</option>
                    </select>
                    <select
                        value={decisionFilter}
                        onChange={e => setDecisionFilter(e.target.value)}
                        className="h-9 rounded-lg bg-background-light dark:bg-slate-900 px-3 text-sm text-[#0d141b] dark:text-white border-none"
                    >
                        <option value="all">All Decisions</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </div>
            {loading && (
                <div className="bg-white dark:bg-[#182430] rounded-xl border border-[#e7edf3] dark:border-slate-700 p-12 flex items-center justify-center">
                    <span className="material-symbols-outlined animate-spin text-primary text-3xl mr-3">progress_activity</span>
                    <span className="text-[#4c739a]">Loading history...</span>
                </div>
            )}

            {error && !loading && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-red-700 dark:text-red-400 flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <span>Failed to load: {error}</span>
                    <button onClick={() => load({ dateRange, type: typeFilter, decision: decisionFilter, search })} className="ml-auto text-sm underline">Retry</button>
                </div>
            )}

            {!loading && !error && (
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
                        {records.length === 0 ? (
                            <tr><td colSpan={8} className="px-6 py-12 text-center text-[#4c739a]">
                                <span className="material-symbols-outlined text-3xl block mb-2">inbox</span>
                                No approval records found
                            </td></tr>
                        ) : records.map(row => (
                            <HistoryRow key={row.approvalId} row={row} />
                        ))}
                    </tbody>
                </table>
            </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="bg-white dark:bg-[#182430] border border-[#e7edf3] dark:border-slate-700 p-5 rounded-xl flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                        <span className="material-symbols-outlined text-2xl">check_circle</span>
                    </div>
                    <div>
                        <p className="text-[#4c739a] text-xs font-bold uppercase tracking-wider">Approved ({dateRange}d)</p>
                        <p className="text-2xl font-black text-[#0d141b] dark:text-white">{data?.totalApproved ?? "—"}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#182430] border border-[#e7edf3] dark:border-slate-700 p-5 rounded-xl flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                        <span className="material-symbols-outlined text-2xl">cancel</span>
                    </div>
                    <div>
                        <p className="text-[#4c739a] text-xs font-bold uppercase tracking-wider">Rejected</p>
                        <p className="text-2xl font-black text-[#0d141b] dark:text-white">{data?.totalRejected ?? "—"}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#182430] border border-[#e7edf3] dark:border-slate-700 p-5 rounded-xl flex items-center gap-4">
                    <div className="size-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined text-2xl">avg_pace</span>
                    </div>
                    <div>
                        <p className="text-[#4c739a] text-xs font-bold uppercase tracking-wider">Avg Response</p>
                        <p className="text-2xl font-black text-[#0d141b] dark:text-white">{data ? `${data.avgResponseTimeDays} Days` : "—"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getDecisionBadge(decision) {
    if (decision === "APPROVED") return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (decision === "REJECTED") return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
}

function getStatusBadge(status) {
    if (status === "Escalated") return "text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-0.5 rounded";
    return "text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-2 py-0.5 rounded";
}

function getTypeIcon(requestType) {
    if (!requestType) return "description";
    const rt = requestType.toLowerCase();
    if (rt.includes("leave")) return "event_busy";
    if (rt.includes("ot") || rt.includes("overtime")) return "more_time";
    if (rt.includes("adjust") || rt.includes("attendance")) return "schedule";
    return "description";
}

function HistoryRow({ row }) {
    const navigate = useNavigate();
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4">
                <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#0d141b] dark:text-white">{row.decisionDate}</span>
                    <span className="text-xs text-[#4c739a]">{row.decisionTime}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    {row.employeeAvatar ? (
                        <div className="size-8 rounded-full bg-cover flex-shrink-0" style={{ backgroundImage: `url(${row.employeeAvatar})` }} />
                    ) : (
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-xs">
                            {row.employeeName?.charAt(0)}
                        </div>
                    )}
                    <span className="text-sm font-medium text-[#0d141b] dark:text-white">{row.employeeName}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">{getTypeIcon(row.requestType)}</span>
                    <span className="text-sm text-[#0d141b] dark:text-slate-300">{row.requestType}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={getDecisionBadge(row.decision)}>{row.decision}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    {row.approverAvatar ? (
                        <div className="size-6 rounded-full bg-cover bg-center flex-shrink-0" style={{ backgroundImage: `url(${row.approverAvatar})` }} />
                    ) : (
                        <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            {row.approverName?.charAt(0)}
                        </div>
                    )}
                    <span className="text-sm font-medium text-[#0d141b] dark:text-slate-200">{row.approverName}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <p className="text-sm text-[#4c739a] truncate max-w-[150px]">{row.comment || "—"}</p>
            </td>
            <td className="px-6 py-4">
                <span className={getStatusBadge(row.requestStatus)}>{row.requestStatus}</span>
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={() => navigate(`/manager/request-details/${row.requestId}`)}
                    className="text-primary hover:text-primary/80 transition-colors"
                >
                    <span className="material-symbols-outlined">visibility</span>
                </button>
            </td>
        </tr>
    );
}