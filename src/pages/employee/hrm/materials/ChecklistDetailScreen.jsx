import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMyChecklistDetail, submitChecklistItem } from "../../../../utils/employeeApi";

const ITEM_STATUS = {
    not_started: { label: "Not Started", icon: "radio_button_unchecked", cls: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
    uploaded:    { label: "Uploaded",    icon: "upload_file",            cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    approved:    { label: "Approved",    icon: "check_circle",           cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    rejected:    { label: "Rejected",    icon: "cancel",                 cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const CHECKLIST_STATUS = {
    pending:     { label: "Pending",     cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    in_progress: { label: "In Progress", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    completed:   { label: "Completed",   cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export default function ChecklistDetailScreen() {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const [checklist, setChecklist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitModal, setSubmitModal] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const load = () => {
        setLoading(true);
        fetchMyChecklistDetail(assignmentId)
            .then(data => setChecklist(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [assignmentId]);

    const handleSubmit = async (fileUrl, fileName) => {
        if (!submitModal) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            await submitChecklistItem(assignmentId, submitModal.itemId, fileUrl, fileName);
            setSubmitModal(null);
            load();
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
        </main>
    );

    if (error || !checklist) return (
        <main className="flex-1 overflow-y-auto p-8">
            <div className="text-center py-16">
                <span className="material-symbols-outlined text-5xl text-red-400 block mb-3">error</span>
                <p className="text-sm text-red-500">{error || "Checklist not found."}</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary text-sm font-bold">← Go back</button>
            </div>
        </main>
    );

    const statusCfg = CHECKLIST_STATUS[checklist.status] || CHECKLIST_STATUS.pending;
    const pct = checklist.progressPct || 0;
    const isOverdue = checklist.dueDate && new Date(checklist.dueDate) < new Date() && checklist.status !== "completed";

    return (
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Back + Header */}
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[#4c739a] hover:text-primary font-semibold mb-4 transition-colors">
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to My Documents
                    </button>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-extrabold text-[#0d141b] dark:text-white">{checklist.templateName}</h1>
                            {checklist.templateDescription && (
                                <p className="text-sm text-[#4c739a] mt-1">{checklist.templateDescription}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.cls}`}>
                                    {statusCfg.label}
                                </span>
                                {isOverdue && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        <span className="material-symbols-outlined text-sm">warning</span> Overdue
                                    </span>
                                )}
                                {checklist.dueDate && (
                                    <span className={`text-xs font-semibold ${isOverdue ? "text-red-500" : "text-[#4c739a]"}`}>
                                        Due: {new Date(checklist.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-4xl font-extrabold text-[#0d141b] dark:text-white">{pct}%</p>
                            <p className="text-xs text-[#4c739a]">{checklist.approvedItems}/{checklist.totalItems} items approved</p>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-[#0d141b] dark:text-white">Overall Progress</p>
                        <p className="text-sm font-bold text-primary">{pct}%</p>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-700 ${pct === 100 ? "bg-emerald-500" : "bg-primary"}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-3 mt-4">
                        {[
                            { label: "Total Items", val: checklist.totalItems, color: "text-[#0d141b] dark:text-white" },
                            { label: "Not Started", val: checklist.items?.filter(i => i.responseStatus === "not_started").length || 0, color: "text-slate-500" },
                            { label: "Pending Review", val: checklist.uploadedItems || 0, color: "text-blue-500" },
                            { label: "Approved", val: checklist.approvedItems || 0, color: "text-emerald-500" },
                        ].map(s => (
                            <div key={s.label} className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <p className={`text-xl font-extrabold ${s.color}`}>{s.val}</p>
                                <p className="text-xs text-[#4c739a] mt-0.5">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                    <h2 className="text-sm font-bold text-[#4c739a] uppercase tracking-wider">Checklist Items</h2>
                    {(checklist.items || []).map((item, idx) => (
                        <ChecklistItemCard
                            key={item.itemId}
                            item={item}
                            index={idx + 1}
                            onUpload={() => setSubmitModal({ itemId: item.itemId, title: item.title })}
                        />
                    ))}
                </div>
            </div>

            {/* Submit Modal */}
            {submitModal && (
                <SubmitModal
                    itemTitle={submitModal.title}
                    submitting={submitting}
                    submitError={submitError}
                    onClose={() => { setSubmitModal(null); setSubmitError(null); }}
                    onSubmit={handleSubmit}
                />
            )}
        </main>
    );
}

function ChecklistItemCard({ item, index, onUpload }) {
    const statusCfg = ITEM_STATUS[item.responseStatus] || ITEM_STATUS.not_started;
    const canUpload = item.responseStatus === "not_started" || item.responseStatus === "rejected";

    return (
        <div className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm transition-all ${
            item.responseStatus === "approved"
                ? "border-emerald-200 dark:border-emerald-800/50"
                : item.responseStatus === "rejected"
                ? "border-red-200 dark:border-red-800/50"
                : "border-[#cfdbe7] dark:border-slate-800"
        }`}>
            <div className="flex items-start gap-4">
                {/* Index circle */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 ${
                    item.responseStatus === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : item.responseStatus === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : item.responseStatus === "uploaded" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}>
                    {item.responseStatus === "approved" ? (
                        <span className="material-symbols-outlined text-base">check</span>
                    ) : item.responseStatus === "rejected" ? (
                        <span className="material-symbols-outlined text-base">close</span>
                    ) : (
                        index
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-[#0d141b] dark:text-white">{item.title}</h3>
                        {item.isRequired && (
                            <span className="text-xs text-red-500 font-semibold">*Required</span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${statusCfg.cls}`}>
                            <span className="material-symbols-outlined text-xs">{statusCfg.icon}</span>
                            {statusCfg.label}
                        </span>
                    </div>
                    {item.description && (
                        <p className="text-xs text-[#4c739a] mt-1">{item.description}</p>
                    )}

                    {/* Uploaded file info */}
                    {item.fileName && (
                        <div className="mt-2 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2 w-fit">
                            <span className="material-symbols-outlined text-red-500 text-base">picture_as_pdf</span>
                            <span className="text-xs font-semibold text-[#0d141b] dark:text-white truncate max-w-[200px]">{item.fileName}</span>
                            {item.fileUrl && (
                                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">View</a>
                            )}
                        </div>
                    )}

                    {/* Rejection notes */}
                    {item.responseStatus === "rejected" && item.reviewNotes && (
                        <div className="mt-2 flex items-start gap-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg px-3 py-2">
                            <span className="material-symbols-outlined text-red-500 text-base mt-0.5">info</span>
                            <div>
                                <p className="text-xs font-bold text-red-600 dark:text-red-400">Rejection Reason</p>
                                <p className="text-xs text-red-500 mt-0.5">{item.reviewNotes}</p>
                            </div>
                        </div>
                    )}

                    {/* Approved note */}
                    {item.responseStatus === "approved" && item.reviewedAt && (
                        <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                            Approved on {new Date(item.reviewedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                    )}
                </div>

                {/* Action button */}
                {canUpload && (
                    <button
                        onClick={onUpload}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                            item.responseStatus === "rejected"
                                ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800/30"
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">upload</span>
                        {item.responseStatus === "rejected" ? "Re-upload" : "Upload"}
                    </button>
                )}
                {item.responseStatus === "uploaded" && (
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold shrink-0 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <span className="material-symbols-outlined text-sm">hourglass_top</span>
                        Awaiting Review
                    </div>
                )}
            </div>
        </div>
    );
}

function SubmitModal({ itemTitle, submitting, submitError, onClose, onSubmit }) {
    const [fileUrl, setFileUrl] = useState("");
    const [fileName, setFileName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!fileUrl.trim() || !fileName.trim()) return;
        onSubmit(fileUrl.trim(), fileName.trim());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-[#cfdbe7] dark:border-slate-800">
                <div className="flex items-center justify-between p-6 border-b border-[#cfdbe7] dark:border-slate-800">
                    <div>
                        <h2 className="text-base font-bold text-[#0d141b] dark:text-white">Upload Document</h2>
                        <p className="text-xs text-[#4c739a] mt-0.5 truncate max-w-[300px]">{itemTitle}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-lg p-3 flex gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-base mt-0.5 shrink-0">info</span>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            Upload your file to a cloud service (Google Drive, Cloudinary, etc.) and paste the public link below.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#0d141b] dark:text-white mb-2">File Name <span className="text-red-500">*</span></label>
                        <input
                            value={fileName}
                            onChange={e => setFileName(e.target.value)}
                            placeholder="e.g. Employment_Contract_2024.pdf"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                            disabled={submitting}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#0d141b] dark:text-white mb-2">File URL <span className="text-red-500">*</span></label>
                        <input
                            value={fileUrl}
                            onChange={e => setFileUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                            disabled={submitting}
                        />
                    </div>

                    {submitError && (
                        <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg px-3 py-2">{submitError}</p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={submitting}
                            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-sm font-bold rounded-lg text-[#4c739a] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting || !fileUrl.trim() || !fileName.trim()}
                            className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting ? (
                                <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Submitting...</>
                            ) : (
                                <><span className="material-symbols-outlined text-base">upload</span> Submit</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
