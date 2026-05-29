import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyChecklists, fetchMyDocuments } from "../../../../utils/employeeApi";

// ── Status configs ──────────────────────────────────────────────────────────
const CHECKLIST_STATUS = {
    pending:     { label: "Pending",     cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    in_progress: { label: "In Progress", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    completed:   { label: "Completed",   cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

const ITEM_STATUS = {
    not_started: { label: "Not Started", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
    uploaded:    { label: "Uploaded",    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    approved:    { label: "Approved",    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    rejected:    { label: "Rejected",    cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function MyDocumentScreen() {
    const [activeTab, setActiveTab] = useState("documents");

    return (
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="mx-auto space-y-6">
                <Header />
                {/* Tabs */}
                <div className="flex gap-1 border-b border-[#cfdbe7] dark:border-slate-800">
                    {[
                        { key: "documents", label: "My Documents", icon: "folder" },
                        { key: "checklists", label: "Checklists", icon: "checklist" },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors ${
                                activeTab === tab.key
                                    ? "border-primary text-primary"
                                    : "border-transparent text-[#4c739a] hover:text-primary"
                            }`}
                        >
                            <span className="material-symbols-outlined text-base">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "documents" && <DocumentsTab />}
                {activeTab === "checklists" && <ChecklistsTab />}
            </div>
        </main>
    );
}

function Header() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-extrabold text-[#0d141b] dark:text-white">My Documents</h1>
                <p className="text-sm text-[#4c739a] mt-0.5">View and manage your personal documents & checklists</p>
            </div>
        </div>
    );
}

// ── DOCUMENTS TAB ───────────────────────────────────────────────────────────

const DOC_TYPE_BADGE = {
    contract: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    payslip:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    policy:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    other:    "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

function DocumentsTab() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 8;

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchMyDocuments()
            .then(data => {
                // Map contracts + uploadedFiles to document format
                const mappedDocs = [
                    ...(data.contracts || []).map(c => ({
                        documentId: c.contractId,
                        fileName: c.contractCode || "Contract",
                        category: "contract",
                        period: c.startDate ? new Date(c.startDate).getFullYear().toString() : "",
                        uploadedDate: c.createdAt,
                        createdAt: c.createdAt,
                        fileUrl: c.documentUrl,
                        fileSize: "",
                    })),
                    ...(data.uploadedFiles || []).map(f => ({
                        documentId: f.responseId,
                        fileName: f.fileName,
                        category: "checklist",
                        period: f.uploadedAt ? new Date(f.uploadedAt).getFullYear().toString() : "",
                        uploadedDate: f.uploadedAt,
                        createdAt: f.uploadedAt,
                        fileUrl: f.fileUrl,
                        fileSize: "",
                    })),
                ];
                setDocs(mappedDocs);
            })
            .catch(err => {
                setError(err.message);
                setDocs([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = docs.filter(d =>
        !search || d.fileName?.toLowerCase().includes(search.toLowerCase())
    );
    const total = filtered.length;
    const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const counts = {
        total: docs.length,
        contract: docs.filter(d => d.category === "contract").length,
        payslip: docs.filter(d => d.category === "payslip").length,
        policy: docs.filter(d => d.category === "policy").length,
    };

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { type: "Total Documents", amount: counts.total, icon: "folder" },
                    { type: "Contracts", amount: counts.contract, icon: "assignment" },
                    { type: "Payslips", amount: counts.payslip, icon: "payments" },
                    { type: "Policies", amount: counts.policy, icon: "gavel" },
                ].map(c => (
                    <div key={c.type} className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 p-5 rounded-xl flex flex-col gap-1 shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="text-[#4c739a] text-sm font-semibold uppercase tracking-wider">{c.type}</span>
                            <span className="material-symbols-outlined text-primary">{c.icon}</span>
                        </div>
                        <p className="text-[#0d141b] dark:text-white text-3xl font-extrabold">{loading ? "–" : c.amount}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 p-4 rounded-xl shadow-sm flex items-end gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold text-[#0d141b] dark:text-white pb-2">Search</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4c739a] text-xl">search</span>
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(0); }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm dark:text-white"
                            placeholder="Search by file name..."
                        />
                    </div>
                </div>
                <div className="w-44">
                    <label className="block text-sm font-bold text-[#0d141b] dark:text-white pb-2">Document Type</label>
                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm dark:text-white"
                    >
                        <option value="">All Types</option>
                        <option value="contract">Contract</option>
                        <option value="payslip">Payslip</option>
                        <option value="policy">Policy</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="w-28">
                    <label className="block text-sm font-bold text-[#0d141b] dark:text-white pb-2">Year</label>
                    <select
                        value={yearFilter}
                        onChange={e => { setYearFilter(e.target.value); setPage(0); }}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm dark:text-white"
                    >
                        <option value="">All Years</option>
                        {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <button
                    onClick={() => { setSearch(""); setTypeFilter(""); setYearFilter(""); setPage(0); }}
                    className="bg-slate-100 dark:bg-slate-800 text-[#0d141b] dark:text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    Clear
                </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[#cfdbe7] dark:border-slate-800">
                            {["Document Name", "Type", "Period", "Uploaded Date", "Actions"].map((h, i) => (
                                <th key={h} className={`px-6 py-4 text-xs font-bold text-[#4c739a] uppercase tracking-wider ${i === 4 ? "text-right" : ""}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#4c739a]">
                                <span className="material-symbols-outlined animate-spin text-2xl block mx-auto mb-2">progress_activity</span>Loading...
                            </td></tr>
                        ) : error ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-red-500">{error}</td></tr>
                        ) : paged.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-[#4c739a]">
                                <span className="material-symbols-outlined text-4xl block mx-auto mb-2 text-slate-300">folder_open</span>
                                No documents found.
                            </td></tr>
                        ) : paged.map(doc => (
                            <DocRow key={doc.documentId || doc.id} doc={doc} />
                        ))}
                    </tbody>
                </table>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-[#cfdbe7] dark:border-slate-800">
                    <p className="text-xs font-semibold text-[#4c739a]">
                        {loading ? "–" : `Showing ${Math.min(page * PAGE_SIZE + 1, total)}–${Math.min((page + 1) * PAGE_SIZE, total)} of ${total} documents`}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-[#4c739a] disabled:opacity-50">Previous</button>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 text-xs font-bold border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-[#4c739a] disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-2 gap-6">
                {[
                    { title: "Confidentiality Note", desc: "All documents are strictly confidential. Do not share your login credentials or downloaded copies with unauthorized personnel." },
                    { title: "Need Assistance?", desc: "If you can't find a specific document or notice an error in your payslip, please contact the HR support desk." },
                ].map(card => (
                    <div key={card.title} className="bg-blue-50 dark:bg-primary/10 p-6 rounded-xl border border-primary/20 flex gap-4">
                        <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined">info</span>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#0d141b] dark:text-white mb-1">{card.title}</h4>
                            <p className="text-xs text-[#4c739a] leading-relaxed">{card.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DocRow({ doc }) {
    const cat = (doc.category || "other").toLowerCase();
    const badgeCls = DOC_TYPE_BADGE[cat] || DOC_TYPE_BADGE.other;
    return (
        <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-red-50 dark:bg-red-900/20 rounded flex items-center justify-center text-red-500">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#0d141b] dark:text-white">{doc.fileName || doc.name || "–"}</p>
                        <p className="text-xs text-[#4c739a]">{doc.fileSize || ""}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badgeCls}`}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">{doc.period || "–"}</td>
            <td className="px-6 py-4 text-sm text-[#4c739a] dark:text-slate-400">{doc.uploadedDate || doc.createdAt || "–"}</td>
            <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                    {doc.fileUrl && (
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="View">
                            <span className="material-symbols-outlined">visibility</span>
                        </a>
                    )}
                    {doc.fileUrl && (
                        <a href={doc.fileUrl} download className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Download">
                            <span className="material-symbols-outlined">download</span>
                        </a>
                    )}
                </div>
            </td>
        </tr>
    );
}

// ── CHECKLISTS TAB ──────────────────────────────────────────────────────────

function ChecklistsTab() {
    const navigate = useNavigate();
    const [checklists, setChecklists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetchMyChecklists()
            .then(data => setChecklists(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const counts = {
        total: checklists.length,
        pending: checklists.filter(c => c.status === "pending").length,
        in_progress: checklists.filter(c => c.status === "in_progress").length,
        completed: checklists.filter(c => c.status === "completed").length,
    };

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { type: "Total Checklists", amount: counts.total, icon: "checklist", color: "text-primary" },
                    { type: "Pending", amount: counts.pending, icon: "pending", color: "text-amber-500" },
                    { type: "In Progress", amount: counts.in_progress, icon: "sync", color: "text-blue-500" },
                    { type: "Completed", amount: counts.completed, icon: "check_circle", color: "text-emerald-500" },
                ].map(c => (
                    <div key={c.type} className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 p-5 rounded-xl flex flex-col gap-1 shadow-sm">
                        <div className="flex justify-between items-start">
                            <span className="text-[#4c739a] text-sm font-semibold uppercase tracking-wider">{c.type}</span>
                            <span className={`material-symbols-outlined ${c.color}`}>{c.icon}</span>
                        </div>
                        <p className="text-[#0d141b] dark:text-white text-3xl font-extrabold">{loading ? "–" : c.amount}</p>
                    </div>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-16 text-[#4c739a]">
                    <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-500 text-sm">{error}</div>
            ) : checklists.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 rounded-xl p-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">checklist</span>
                    <p className="text-sm font-bold text-[#4c739a]">No checklists assigned yet.</p>
                    <p className="text-xs text-[#4c739a] mt-1">HR will assign checklists when needed (e.g. onboarding, annual compliance).</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {checklists.map(cl => (
                        <ChecklistCard key={cl.assignmentId} checklist={cl} onView={() => navigate(`/employee/my-checklists/${cl.assignmentId}`)} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ChecklistCard({ checklist, onView }) {
    const statusCfg = CHECKLIST_STATUS[checklist.status] || CHECKLIST_STATUS.pending;
    const pct = checklist.progressPct || 0;
    const isOverdue = checklist.dueDate && new Date(checklist.dueDate) < new Date() && checklist.status !== "completed";

    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base font-bold text-[#0d141b] dark:text-white">{checklist.templateName}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.cls}`}>
                            {statusCfg.label}
                        </span>
                        {isOverdue && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                <span className="material-symbols-outlined text-sm">warning</span> Overdue
                            </span>
                        )}
                    </div>
                    {checklist.templateDescription && (
                        <p className="text-xs text-[#4c739a] mt-1 truncate">{checklist.templateDescription}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#4c739a]">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">task_alt</span>
                            {checklist.approvedItems}/{checklist.totalItems} approved
                        </span>
                        {checklist.dueDate && (
                            <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-bold" : ""}`}>
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                Due: {new Date(checklist.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                    <div className="text-right">
                        <p className="text-2xl font-extrabold text-[#0d141b] dark:text-white">{pct}%</p>
                        <p className="text-xs text-[#4c739a]">completed</p>
                    </div>
                    <button
                        onClick={onView}
                        className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        View Details
                    </button>
                </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-xs text-[#4c739a]">
                    <span>{checklist.uploadedItems || 0} uploaded, awaiting review</span>
                    <span>{checklist.totalItems - (checklist.approvedItems || 0) - (checklist.uploadedItems || 0)} remaining</span>
                </div>
            </div>
        </div>
    );
}