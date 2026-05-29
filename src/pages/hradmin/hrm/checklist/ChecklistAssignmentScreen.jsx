import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchChecklistAssignments,
    fetchChecklistAssignmentDetail,
    assignChecklist,
    reviewChecklistResponse,
} from "../../../../utils/hrApi";

const ASSIGNMENT_STATUS = {
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

export default function ChecklistAssignmentScreen() {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const load = () => {
        setLoading(true);
        fetchChecklistAssignments()
            .then(data => setAssignments(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleAssign = async (data) => {
        setSubmitting(true);
        try {
            await assignChecklist(data.employeeId, data.templateId, data.dueDate);
            setShowAssignModal(false);
            load();
        } catch (err) {
            alert("Failed to assign checklist: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const openDetail = async (assignmentId) => {
        const detail = await fetchChecklistAssignmentDetail(assignmentId);
        setSelectedAssignment(detail);
    };

    const handleReview = async (responseId, status, notes) => {
        setSubmitting(true);
        try {
            await reviewChecklistResponse(responseId, status, notes);
            if (selectedAssignment) {
                const updated = await fetchChecklistAssignmentDetail(selectedAssignment.assignmentId);
                setSelectedAssignment(updated);
            }
            load();
        } catch (err) {
            alert("Failed to review: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#0d141b] dark:text-white">Checklist Assignments</h1>
                        <p className="text-sm text-[#4c739a] mt-0.5">Assign checklists to employees and review submissions</p>
                    </div>
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">person_add</span>
                        Assign Checklist
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500 text-sm">{error}</div>
                ) : assignments.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 rounded-xl p-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">assignment</span>
                        <p className="text-sm font-bold text-[#4c739a]">No assignments yet.</p>
                        <p className="text-xs text-[#4c739a] mt-1">Assign checklists to employees to track document submissions.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {assignments.map(a => (
                            <AssignmentCard key={a.assignmentId} assignment={a} onDetail={() => openDetail(a.assignmentId)} />
                        ))}
                    </div>
                )}
            </div>

            {showAssignModal && (
                <AssignModal submitting={submitting} onClose={() => setShowAssignModal(false)} onSubmit={handleAssign} />
            )}

            {selectedAssignment && (
                <AssignmentDetailModal
                    assignment={selectedAssignment}
                    submitting={submitting}
                    onClose={() => setSelectedAssignment(null)}
                    onReview={handleReview}
                />
            )}
        </main>
    );
}

function AssignmentCard({ assignment, onDetail }) {
    const statusCfg = ASSIGNMENT_STATUS[assignment.status] || ASSIGNMENT_STATUS.pending;
    const pct = assignment.progressPct || 0;
    const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && assignment.status !== "completed";

    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-base font-bold text-[#0d141b] dark:text-white">{assignment.templateName}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.cls}`}>
                            {statusCfg.label}
                        </span>
                        {isOverdue && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                <span className="material-symbols-outlined text-sm">warning</span> Overdue
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#4c739a]">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">person</span>
                            Employee ID: {assignment.employeeId}
                        </span>
                        {assignment.dueDate && (
                            <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-bold" : ""}`}>
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                Due: {new Date(assignment.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                        <p className="text-2xl font-extrabold text-[#0d141b] dark:text-white">{pct}%</p>
                        <p className="text-xs text-[#4c739a]">{assignment.approvedItems}/{assignment.totalItems} approved</p>
                    </div>
                    <button
                        onClick={onDetail}
                        className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Review
                    </button>
                </div>
            </div>
        </div>
    );
}

function AssignModal({ submitting, onClose, onSubmit }) {
    const [employeeId, setEmployeeId] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [dueDate, setDueDate] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!employeeId || !templateId) return alert("Please fill all required fields");
        onSubmit({ employeeId: Number(employeeId), templateId: Number(templateId), dueDate });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-[#cfdbe7] dark:border-slate-800">
                <div className="flex items-center justify-between p-6 border-b border-[#cfdbe7] dark:border-slate-800">
                    <h2 className="text-base font-bold text-[#0d141b] dark:text-white">Assign Checklist</h2>
                    <button onClick={onClose} className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#0d141b] dark:text-white mb-2">Employee ID <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            value={employeeId}
                            onChange={e => setEmployeeId(e.target.value)}
                            placeholder="Enter employee ID"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#0d141b] dark:text-white mb-2">Template ID <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            value={templateId}
                            onChange={e => setTemplateId(e.target.value)}
                            placeholder="Enter template ID"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#0d141b] dark:text-white mb-2">Due Date (optional)</label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} disabled={submitting}
                            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-sm font-bold rounded-lg text-[#4c739a] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting ? (
                                <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Assigning...</>
                            ) : (
                                <><span className="material-symbols-outlined text-base">send</span> Assign</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AssignmentDetailModal({ assignment, submitting, onClose, onReview }) {
    const [reviewModal, setReviewModal] = useState(null);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-[#cfdbe7] dark:border-slate-800 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-[#cfdbe7] dark:border-slate-800">
                    <div>
                        <h2 className="text-base font-bold text-[#0d141b] dark:text-white">{assignment.templateName}</h2>
                        <p className="text-xs text-[#4c739a]">Employee ID: {assignment.employeeId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Progress */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-[#0d141b] dark:text-white">Progress</p>
                            <p className="text-sm font-bold text-primary">{assignment.progressPct}%</p>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${assignment.progressPct}%` }} />
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        {(assignment.items || []).map((item, idx) => {
                            const statusCfg = ITEM_STATUS[item.responseStatus] || ITEM_STATUS.not_started;
                            const canReview = item.responseStatus === "uploaded";
                            return (
                                <div key={item.itemId} className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 rounded-lg p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-sm font-bold text-[#0d141b] dark:text-white">{item.title}</h3>
                                                {item.isRequired && <span className="text-xs text-red-500 font-semibold">*Required</span>}
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${statusCfg.cls}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </div>
                                            {item.fileName && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                                                    <span className="text-xs text-[#4c739a]">{item.fileName}</span>
                                                    {item.fileUrl && (
                                                        <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">View</a>
                                                    )}
                                                </div>
                                            )}
                                            {item.reviewNotes && (
                                                <p className="text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-900/10 rounded px-2 py-1">{item.reviewNotes}</p>
                                            )}
                                        </div>
                                        {canReview && (
                                            <button
                                                onClick={() => setReviewModal({ responseId: item.responseId, title: item.title })}
                                                className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">rate_review</span>
                                                Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {reviewModal && (
                    <ReviewModal
                        itemTitle={reviewModal.title}
                        submitting={submitting}
                        onClose={() => setReviewModal(null)}
                        onSubmit={(status, notes) => {
                            onReview(reviewModal.responseId, status, notes);
                            setReviewModal(null);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

function ReviewModal({ itemTitle, submitting, onClose, onSubmit }) {
    const [status, setStatus] = useState("approved");
    const [notes, setNotes] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (status === "rejected" && !notes.trim()) return alert("Please provide rejection notes");
        onSubmit(status, notes);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-[#cfdbe7] dark:border-slate-800">
                <div className="flex items-center justify-between p-4 border-b border-[#cfdbe7] dark:border-slate-800">
                    <h3 className="text-sm font-bold text-[#0d141b] dark:text-white">Review: {itemTitle}</h3>
                    <button onClick={onClose} className="p-1.5 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-[#0d141b] dark:text-white mb-2">Decision</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setStatus("approved")}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                    status === "approved"
                                        ? "bg-emerald-100 border-emerald-300 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-400"
                                        : "border-slate-300 text-[#4c739a] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                                }`}
                            >
                                ✓ Approve
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus("rejected")}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                                    status === "rejected"
                                        ? "bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400"
                                        : "border-slate-300 text-[#4c739a] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                                }`}
                            >
                                ✕ Reject
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#0d141b] dark:text-white mb-2">Notes {status === "rejected" && <span className="text-red-500">*</span>}</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder={status === "rejected" ? "Reason for rejection..." : "Optional feedback..."}
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} disabled={submitting}
                            className="flex-1 py-2 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-lg text-[#4c739a] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="flex-1 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
                            {submitting ? "Submitting..." : "Submit Review"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
