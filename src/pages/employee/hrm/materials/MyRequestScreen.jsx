import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyRequests, getStatusConfig, formatDate } from "../../../../utils/employeeApi";


function Header() {
    return (
        <div className="flex items-center gap-4 ml-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Employee Workspace</h2>
        </div>
    );
}

function StatsCard({ ...props }) {
    const colorIcon = props.label == "Pending" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
        : props.label == "Approved" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
            : props.label == "Rejected" ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "bg-primary/10 text-primary";
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-1 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{props.label}</p>
            <div className="flex items-center justify-between mt-1">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{props.amount}</span>
                <div className={`${colorIcon} p-2 rounded-lg`}>
                    <span className="material-symbols-outlined">{props.icon}</span>
                </div>
            </div>
        </div>
    );
}

function StatsSection({ summary, loading }) {
    const Sk = () => <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard label="Pending" amount={loading ? <Sk /> : summary.pending ?? 0} icon="pending_actions" />
            <StatsCard label="Approved" amount={loading ? <Sk /> : summary.approved ?? 0} icon="task_alt" />
            <StatsCard label="Rejected" amount={loading ? <Sk /> : summary.rejected ?? 0} icon="cancel" />
            <StatsCard label="Action Required" amount={loading ? <Sk /> : summary.actionRequired ?? 0} icon="assignment_late" />
        </div>
    );
}

function TypeFilter({ value, onChange }) {
    return (
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Type:</span>
            <select value={value} onChange={e => onChange(e.target.value)} className="border-none bg-transparent text-sm font-medium p-0 focus:ring-0 text-slate-700 dark:text-slate-300">
                <option value="">All Types</option>
                <option value="LEAVE">Leave</option>
                <option value="OT">Overtime</option>
                <option value="ADJUSTMENT">Adjustment</option>
            </select>
        </div>
    );
}

function StatusFilter({ value, onChange }) {
    return (
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status:</span>
            <select value={value} onChange={e => onChange(e.target.value)} className="border-none bg-transparent text-sm font-medium p-0 focus:ring-0 text-slate-700 dark:text-slate-300">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="in_progress">In Progress</option>
            </select>
        </div>
    );
}

function MoreFiltersButton() {
    return (
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">
            <span className="material-symbols-outlined text-base">filter_list</span>
            More Filters
        </button>
    );
}

function ActionButton({ onClick }) {
    return (
        <button onClick={onClick} className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined">add</span>
            <span>New Request</span>
        </button>
    );
}

function FilterBar({ children }) {
    return (
        <div className="flex flex-wrap gap-3 items-center lg:justify-end">
            {children}
        </div>
    );
}

function Tr(props) {
    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">{props.icon}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{props.requestType}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-slate-600 dark:text-slate-400">{props.dates}</span>
            </td>
            <td className="px-6 py-4 max-w-xs">
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{props.reason}</p>
            </td>
            <td className="px-6 py-4">
                <div className="flex justify-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${props.statusClass || "bg-slate-100 text-slate-600"}`}>
                        {props.status}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm text-slate-700 dark:text-slate-300">{props.approver}</span>
            </td>
            <td className="px-6 py-4 text-right">
                <button onClick={props.onClick} className="text-primary hover:text-primary/80 text-sm font-bold">{props.action}</button>
            </td>
        </tr>
    );
}

function Pagination() {
    return (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">Showing 1 to 4 of 9 requests</span>
            <div className="flex items-center gap-2">
                <button className="p-1 rounded border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled="">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="size-8 rounded bg-primary text-white text-sm font-bold">1</button>
                <button className="size-8 rounded text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">2</button>
                <button className="size-8 rounded text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">3</button>
                <button className="p-1 rounded border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </div>
    );
}

const REQUEST_TYPE_META = {
    LEAVE: { icon: "event_available", label: "Leave" },
    OT: { icon: "timer", label: "Overtime (OT)" },
    ADJUSTMENT: { icon: "fingerprint", label: "Adjustment" },
    OTHER: { icon: "description", label: "Request" },
};

function RequestTable({ rows, loading, onClick }) {
    const titleTable = ["Request Type", "Date(s)", "Summary", "Status", "Approver", "Action"];
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            {titleTable.map((item, index) => (
                                <th key={index} className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{item}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td></tr>
                            ))
                            : rows.length === 0
                                ? <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">No requests found</td></tr>
                                : rows.map(r => {
                                    const meta = REQUEST_TYPE_META[r.requestType] || REQUEST_TYPE_META.OTHER;
                                    const statusCfg = getStatusConfig(r.status);
                                    return (
                                        <Tr
                                            key={r.requestId}
                                            onClick={() => onClick(r)}
                                            icon={meta.icon}
                                            requestType={meta.label}
                                            dates={r.dates || formatDate(r.submittedAt)}
                                            reason={r.description || r.title || "–"}
                                            status={statusCfg.label}
                                            statusClass={statusCfg.bg}
                                            approver={r.approverName || "HR Admin"}
                                            action="View"
                                        />
                                    );
                                })
                        }
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500">Showing {loading ? "…" : rows.length} requests</span>
            </div>
        </div>
    );
}


export default function MyRequestScreen() {
    const navigate = useNavigate();
    const [typeFilter, setTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchMyRequests(typeFilter, statusFilter)
            .then(res => {
                // Handle different response structures
                const data = res.data || res;
                const rows = Array.isArray(data) ? data : (data.data || []);
                const summary = data.summary || {};
                setRows(rows);
                setSummary(summary);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [typeFilter, statusFilter]);

    return (
        <main className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
                <StatsSection summary={summary} loading={loading} />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <ActionButton onClick={() => navigate("/employee/new-request")} />
                    <FilterBar>
                        <TypeFilter value={typeFilter} onChange={setTypeFilter} />
                        <StatusFilter value={statusFilter} onChange={setStatusFilter} />
                        <MoreFiltersButton />
                    </FilterBar>
                </div>
                <RequestTable rows={rows} loading={loading} onClick={() => navigate("/employee/request-details")} />
            </div>
        </main>
    );
}