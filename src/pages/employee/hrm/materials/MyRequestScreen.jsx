import { useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";


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

function StatsSection() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard label="Pending" amount="2" icon="pending_actions" />
            <StatsCard label="Approved" amount="5" icon="task_alt" />
            <StatsCard label="Rejected" amount="1" icon="cancel" />
            <StatsCard label="Action Required" amount="1" icon="assignment_late" />
        </div>
    );
}

function TypeFilter() {
    return (
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Type:</span>
            <select className="border-none bg-transparent text-sm font-medium p-0 focus:ring-0 text-slate-700 dark:text-slate-300">
                <option>All Types</option>
                <option>Leave</option>
                <option>Overtime</option>
                <option>Adjustment</option>
                <option>WFH</option>
            </select>
        </div>
    );
}

function StatusFilter() {
    return (
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status:</span>
            <select className="border-none bg-transparent text-sm font-medium p-0 focus:ring-0 text-slate-700 dark:text-slate-300">
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
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
    const colorItem = props.status == "Pending" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-600/20"
        : props.status == "Rejected" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-600/20"
            : props.status == "Approved" ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 ring-1 ring-inset ring-green-600/20"
                : "bg-primary/10 text-primary ring-1 ring-inset ring-primary/20";

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
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${colorItem}`}>
                        {props.status}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <img className="size-6 rounded-full" data-alt="Female manager profile picture" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCahdXoX69zkapWsHqsdT9AEHHDyxcwd7d88KNa0rLJbKbiDU0myjL6y_cPDvkU2NAjxT2mwTe8WzDIRVxnII6HFVhkQ5t0CShhdUt0YtmiaeIP5zdzjH4hkwkjYsuW46nON-HYMXbLb39NOQTWDhgRt89J7ar73HueL0f3ZTFyIHEq3oxMJsb20Xd5-FlTGf1esJIWOkMB9RjeJq-BZgUbebZ9s5gHEO5YrJiBsZKtmN5KP0ywejaTP087jIBXDsNczoB2HViuKRc" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{props.approver}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={() => props.onClick(props.action)}
                    className="text-primary hover:text-primary/80 text-sm font-bold">{props.action}</button>
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

function RequestTable({ onClick }) {

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
                        {/* <!-- Row 1 --> */}
                        <Tr
                            onClick={onClick}
                            icon="event_available" requestType="Annual Leave" dates="Oct 15 - Oct 18, 2023" reason="Family Vacation at the Beach" status="Pending" approver="John Doe" action="View" />
                        {/* <!-- Row 2 --> */}
                        <Tr onClick={onClick}
                            icon="timer" requestType="Overtime (OT)" dates="Oct 12, 2023 (2h)" reason="Project Alpha Deadline Completion" status="Approved" approver="John Smith" action="View" />
                        {/* <!-- Row 3 --> */}
                        <Tr onClick={onClick}
                            icon="fingerprint" requestType="Adjustment" dates="Oct 10, 2023" reason="Missing Checkout - Biometric Error" status="Rejected" approver="System Admin" action="View" />
                        {/* <!-- Row 4 --> */}
                        <Tr onClick={onClick}
                            icon="home_work" requestType="WFH" dates="Oct 20, 2023" reason="Technician visit at home" status="Action Required" approver="Mike Ross" action="Review" />
                    </tbody>
                </table>
            </div>
            {/* <!-- Pagination --> */}
            <Pagination />
        </div>
    );
}


export default function MyRequestScreen() {
    const navigate = useNavigate();

    const newRequest = () => {
        navigate("/employee/new-request");
    }

    const viewRequest = (action) => {
        if (action == "View")
            navigate("/employee/request-details");
        else if (action == "Review")
            navigate("/employee/review-request");
    }


    return (
        <main className="flex-1 flex flex-col overflow-hidden">
            {/* <!-- Top Navigation Bar --> */}
            <Header />
            {/* <!-- Scrollable Content --> */}
            <div className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">

                {/* <!-- Stats / Summary Cards --> */}
                <StatsSection />

                {/* <!-- Primary Action & Filter Bar --> */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                    <ActionButton onClick={newRequest} />
                    <FilterBar>
                        <TypeFilter />
                        <StatusFilter />
                        <MoreFiltersButton />
                    </FilterBar>
                </div>

                {/* <!-- Request Table --> */}
                <RequestTable onClick={viewRequest} />
            </div>
        </main>
    );
}