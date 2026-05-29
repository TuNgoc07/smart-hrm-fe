import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchMyRequestDetail,
    cancelMyRequest,
    formatDate,
    getStatusConfig,
    formatCurrency,
} from "../../../../utils/employeeApi";

// ── Metadata constants ──────────────────────────────────────────────────────

/** Icon và label hiển thị theo loại request */
const REQUEST_TYPE_META = {
    LEAVE:      { icon: "calendar_month", label: "Leave Request" },
    OT:         { icon: "timer",          label: "Overtime Request" },
    ADJUSTMENT: { icon: "fingerprint",    label: "Attendance Adjustment" },
    OTHER:      { icon: "description",    label: "Request" },
};

/** Nhãn thân thiện cho dayType của OT request */
const DAY_TYPE_LABEL = {
    normal:  "Normal Day (≥ 150%)",
    weekend: "Weekend (≥ 200%)",
    holiday: "Holiday (≥ 300%)",
};

/** Nhãn thân thiện cho duration_unit của Leave request */
const DURATION_UNIT_LABEL = {
    full_day: "Full Day",
    half_am:  "Half Day (Morning)",
    half_pm:  "Half Day (Afternoon)",
};

// ── Shared UI helpers ───────────────────────────────────────────────────────

/** Field hiển thị label + value theo dạng stacked */
function DetailField({ label, value, colSpan = 1 }) {
    return (
        <div className={`space-y-1 ${colSpan === 2 ? "md:col-span-2" : ""}`}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-base font-medium text-slate-900 dark:text-slate-100">{value ?? "–"}</p>
        </div>
    );
}

/** Row hiển thị giá trị cũ → giá trị mới (dùng cho Adjustment) */
function ChangedValueRow({ label, oldVal, newVal }) {
    if (!oldVal && !newVal) return null;
    return (
        <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <div className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-slate-100">
                <span className="text-slate-400 line-through">{oldVal || "–"}</span>
                <span className="material-symbols-outlined text-[18px] text-slate-400">arrow_forward</span>
                <span className="text-emerald-600 dark:text-emerald-400">{newVal || "–"}</span>
            </div>
        </div>
    );
}

// ── Request Detail Card — polymorphic theo requestType ──────────────────────

/**
 * Hiển thị thông tin chi tiết theo loại request:
 *  - LEAVE     : leaveType, date range, duration, auto-split info, reason
 *  - OT        : date, time range, otHours, dayType, estimatedPay, reason
 *  - ADJUSTMENT: date, adjustmentType, checkin/checkout changes, reason
 */
function RequestDetailCard({ requestType, requestDetail }) {
    if (!requestDetail) return null;

    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Request Details</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">

                {/* ── LEAVE fields ── */}
                {requestType === "LEAVE" && (<>
                    <DetailField label="Leave Type" value={requestDetail.leaveType} />
                    <DetailField
                        label="Duration"
                        value={`${requestDetail.durationDays} ${DURATION_UNIT_LABEL[requestDetail.durationUnit] || requestDetail.durationUnit || "day(s)"}`}
                    />
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start & End Date</p>
                        <div className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-slate-100">
                            <span>{formatDate(requestDetail.startDate)}</span>
                            <span className="material-symbols-outlined text-[18px] text-slate-400">arrow_forward</span>
                            <span>{formatDate(requestDetail.endDate)}</span>
                        </div>
                    </div>
                    {/* Auto-split info: hiện khi balance không đủ và hệ thống tự tách paid/unpaid */}
                    {requestDetail.isAutoSplit === 1 && (
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Auto-Split (balance exceeded)</p>
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    ✓ {requestDetail.paidDays} day(s) Paid Leave
                                </span>
                                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                    ⚠ {requestDetail.unpaidDays} day(s) Unpaid (balance insufficient)
                                </span>
                            </div>
                        </div>
                    )}
                    <DetailField label="Reason" value={requestDetail.reason} colSpan={2} />
                </>)}

                {/* ── OT fields ── */}
                {requestType === "OT" && (<>
                    <DetailField label="OT Date" value={formatDate(requestDetail.otDate)} />
                    <DetailField label="Day Type" value={DAY_TYPE_LABEL[requestDetail.dayType] || requestDetail.dayType} />
                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Time Range</p>
                        <div className="flex items-center gap-2 text-base font-medium text-slate-900 dark:text-slate-100">
                            <span>{requestDetail.startTime}</span>
                            <span className="material-symbols-outlined text-[18px] text-slate-400">arrow_forward</span>
                            <span>{requestDetail.endTime}</span>
                            <span className="text-sm text-slate-500">({requestDetail.otHours}h)</span>
                        </div>
                    </div>
                    <DetailField label="Estimated Pay" value={formatCurrency(requestDetail.calculatedPay)} />
                    <DetailField label="Reason" value={requestDetail.reason} colSpan={2} />
                </>)}

                {/* ── ADJUSTMENT fields ── */}
                {requestType === "ADJUSTMENT" && (<>
                    <DetailField label="Attendance Date" value={formatDate(requestDetail.attendanceDate)} />
                    <DetailField label="Adjustment Type" value={requestDetail.adjustmentType} />
                    <ChangedValueRow
                        label="Check-in"
                        oldVal={requestDetail.originalCheckin}
                        newVal={requestDetail.newCheckin}
                    />
                    <ChangedValueRow
                        label="Check-out"
                        oldVal={requestDetail.originalCheckout}
                        newVal={requestDetail.newCheckout}
                    />
                    <DetailField label="Reason" value={requestDetail.reason} colSpan={2} />
                    {requestDetail.attachmentUrl && (
                        <div className="md:col-span-2 space-y-1">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attachment</p>
                            <a
                                href={requestDetail.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-primary text-sm font-medium hover:underline"
                            >
                                <span className="material-symbols-outlined text-[18px]">attach_file</span>
                                View Attachment
                            </a>
                        </div>
                    )}
                </>)}
            </div>
        </section>
    );
}

// ── Leave Balance Card ──────────────────────────────────────────────────────

/**
 * Hiển thị số ngày phép còn lại của leave policy liên quan đến request.
 * Chỉ render khi requestType = "LEAVE" và có leaveBalance data từ backend.
 */
function LeaveBalanceCard({ leaveBalance }) {
    if (!leaveBalance) return null;

    const entitled  = parseFloat(leaveBalance.entitledDays  || 0);
    const used      = parseFloat(leaveBalance.usedDays      || 0);
    const pending   = parseFloat(leaveBalance.pendingDays   || 0);
    const remaining = parseFloat(leaveBalance.remainingDays || 0);
    const usedPct    = entitled > 0 ? Math.min(100, Math.round((used    / entitled) * 100)) : 0;
    const pendingPct = entitled > 0 ? Math.min(100 - usedPct, Math.round((pending / entitled) * 100)) : 0;

    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Leave Balance {leaveBalance.year}</h3>
                <span className="text-xs text-slate-400 font-medium">{leaveBalance.policyName}</span>
            </div>
            <div className="p-6 space-y-4">
                {/* Three summary numbers */}
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{entitled}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Entitled</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pending}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Pending</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{remaining}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Remaining</p>
                    </div>
                </div>
                {/* Visual usage bar */}
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                    <div className="h-full bg-rose-400 transition-all" style={{ width: `${usedPct}%` }} />
                    <div className="h-full bg-amber-400 transition-all" style={{ width: `${pendingPct}%` }} />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-rose-400 inline-block" />{used} used
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-amber-400 inline-block" />{pending} pending
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-emerald-400 inline-block" />{remaining} remaining
                    </span>
                </div>
            </div>
        </section>
    );
}

// ── Feedback / Final Comment Card ───────────────────────────────────────────

/** Hiển thị final comment của người phê duyệt (hoặc empty state) */
function FeedbackCard({ finalComment, status }) {
    const isRejected = (status || "").toLowerCase() === "rejected";

    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Decision Feedback</h3>
            </div>
            {finalComment ? (
                <div className={`p-6 rounded-b-xl ${isRejected ? "bg-red-50 dark:bg-red-900/10" : ""}`}>
                    <p className={`text-sm font-medium leading-relaxed ${isRejected ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}>
                        {finalComment}
                    </p>
                </div>
            ) : (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full">
                        <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-[40px]">forum</span>
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 text-sm italic font-medium">
                        No feedback or comments yet.
                    </p>
                </div>
            )}
        </section>
    );
}

// ── Approval Timeline ───────────────────────────────────────────────────────

/**
 * Hiển thị vertical stepper với tất cả workflow steps.
 * Mỗi step có thể ở 1 trong 4 trạng thái:
 *   approved → green check
 *   rejected → red X
 *   active   → blue dot (đang chờ)
 *   pending  → grey (chưa đến lượt)
 */
function TimelineSection({ timeline }) {
    if (!timeline || timeline.length === 0) return null;

    /** Trả về styles tương ứng với step status */
    const getStepStyle = (status) => {
        if (status === "approved") return {
            circle: "bg-green-100 dark:bg-green-900/30 border-green-500",
            icon: <span className="material-symbols-outlined text-[14px] text-green-600 font-bold">check</span>,
            nameClass: "text-emerald-600 dark:text-emerald-400 font-bold",
        };
        if (status === "rejected") return {
            circle: "bg-red-100 dark:bg-red-900/30 border-red-500",
            icon: <span className="material-symbols-outlined text-[14px] text-red-500 font-bold">close</span>,
            nameClass: "text-red-600 dark:text-red-400 font-bold",
        };
        if (status === "active") return {
            circle: "bg-primary/10 border-primary",
            icon: <div className="size-2 bg-primary rounded-full animate-pulse" />,
            nameClass: "text-primary font-bold",
        };
        return {
            circle: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
            icon: null,
            nameClass: "text-slate-400 dark:text-slate-600",
        };
    };

    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Approval Timeline</h3>
            <div className="relative space-y-8">
                {timeline.map((step, i) => {
                    const style = getStepStyle(step.status);
                    const isLast = i === timeline.length - 1;
                    return (
                        <div key={step.stepId} className="relative pl-8 flex flex-col">
                            {/* Step circle */}
                            <div className={`absolute left-0 top-1 size-6 rounded-full flex items-center justify-center border-2 z-10 ${style.circle}`}>
                                {style.icon}
                            </div>
                            {/* Connector line (không vẽ ở step cuối) */}
                            {!isLast && (
                                <div className="absolute left-[11px] top-7 w-[2px] h-[calc(100%+8px)] bg-slate-200 dark:bg-slate-800" />
                            )}
                            {/* Step name */}
                            <span className={`text-sm ${style.nameClass}`}>{step.stepName}</span>
                            {/* Approver name */}
                            {step.approverName && (
                                <span className="text-xs text-slate-500 mt-0.5">Assigned to: {step.approverName}</span>
                            )}
                            {/* Acted timestamp */}
                            {step.actedAt && (
                                <span className="text-xs text-slate-400 mt-0.5">
                                    {step.status === "approved" ? "Approved" : "Rejected"} · {formatDate(step.actedAt)}
                                </span>
                            )}
                            {/* Approver comment */}
                            {step.comment && (
                                <p className="text-xs italic text-slate-500 dark:text-slate-400 mt-1 bg-slate-50 dark:bg-slate-800 rounded px-2 py-1">
                                    "{step.comment}"
                                </p>
                            )}
                            {/* Active badge */}
                            {step.status === "active" && (
                                <span className="inline-flex mt-2 items-center px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-primary uppercase tracking-tight w-max border border-blue-100 dark:border-blue-800/50">
                                    In Progress
                                </span>
                            )}
                            {/* Pending hint */}
                            {step.status === "pending" && (
                                <span className="text-xs text-slate-400 mt-0.5 italic">Waiting for previous steps</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// ── Activity Feed ───────────────────────────────────────────────────────────

/**
 * Chronological feed của tất cả request events (submitted, approved, rejected, cancelled).
 * Actor = "You" nếu chính employee thực hiện, ngược lại tên người duyệt/hủy.
 */
function ActivitiesSection({ activities }) {
    if (!activities || activities.length === 0) return null;

    const getActivityStyle = (eventType) => {
        switch (eventType) {
            case "submitted":  return { bg: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",   icon: "send" };
            case "approved":   return { bg: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400", icon: "check_circle" };
            case "rejected":   return { bg: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",         icon: "cancel" };
            case "cancelled":  return { bg: "bg-slate-100 dark:bg-slate-800 text-slate-500",                        icon: "block" };
            default:           return { bg: "bg-slate-100 dark:bg-slate-800 text-slate-500",                        icon: "info" };
        }
    };

    return (
        <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Activity Feed</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activities.map((activity) => {
                    const style = getActivityStyle(activity.eventType);
                    return (
                        <div key={activity.eventId} className="px-6 py-4 flex items-start gap-4">
                            <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${style.bg}`}>
                                <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-900 dark:text-slate-100">
                                    <span className="font-bold">{activity.actorName}</span>
                                    {" "}{activity.eventType === "submitted" ? "submitted" : activity.eventType} this request
                                </p>
                                {activity.comment && (
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">
                                        "{activity.comment}"
                                    </p>
                                )}
                                <p className="text-xs text-slate-400 mt-1">{formatDate(activity.eventAt)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

// ── Cancel Confirmation Dialog ──────────────────────────────────────────────

/**
 * Inline confirm card thay thế window.confirm.
 * Hiện ra khi employee nhấn "Cancel Request", cho phép confirm hoặc dismiss.
 */
function CancelConfirmCard({ onConfirm, onDismiss, cancelling }) {
    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500 text-[24px]">warning</span>
                <div>
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">Cancel this request?</p>
                    <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
                        This action cannot be undone. The request will be permanently cancelled.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button
                    onClick={onConfirm}
                    disabled={cancelling}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-60"
                >
                    {cancelling ? "Cancelling…" : "Yes, Cancel Request"}
                </button>
                <button
                    onClick={onDismiss}
                    disabled={cancelling}
                    className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    Keep Request
                </button>
            </div>
        </div>
    );
}

// ── Loading Skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <main className="flex-1 flex flex-col overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
            <div className="space-y-4 max-w-7xl w-full mx-auto">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {[200, 160, 120].map((h, i) => (
                            <div key={i} className={`h-[${h}px] bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse`} style={{ height: h }} />
                        ))}
                    </div>
                    <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
                </div>
            </div>
        </main>
    );
}

// ── Main Screen ─────────────────────────────────────────────────────────────

/**
 * Request Detail Screen cho Employee Portal.
 *
 * Flow:
 *  1. Đọc requestId từ URL params (:requestId)
 *  2. Fetch GET /api/employee/my-requests/{requestId} khi mount
 *  3. Render các sections: header, requestDetail card, leaveBalance (nếu LEAVE),
 *     feedbackCard, activitiesSection (bên trái) + timelineSection (bên phải)
 *  4. Nếu canCancel = true → hiển thị nút "Cancel Request" và confirm card
 */
export default function RequestDetailScreen() {
    const { requestId } = useParams();
    const navigate = useNavigate();

    const [detail, setDetail]             = useState(null);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelling, setCancelling]     = useState(false);

    // Fetch request detail khi requestId thay đổi
    useEffect(() => {
        if (!requestId) return;
        setLoading(true);
        setError(null);
        fetchMyRequestDetail(requestId)
            .then((res) => {
                // Unpack { status: "success", data: {...} }
                const data = res.status === "success" ? res.data : res;
                setDetail(data);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [requestId]);

    /** Xử lý cancel: gọi POST /cancel, navigate về danh sách nếu thành công */
    const handleCancelConfirm = async () => {
        setCancelling(true);
        try {
            await cancelMyRequest(requestId);
            navigate("/employee/my-requests");
        } catch (err) {
            setError(err.message);
            setShowCancelConfirm(false);
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <LoadingSkeleton />;

    if (error || !detail) return (
        <main className="flex-1 flex flex-col items-center justify-center p-8 bg-background-light dark:bg-background-dark">
            <span className="material-symbols-outlined text-slate-300 text-[64px] mb-4">error</span>
            <p className="text-slate-500 text-center">{error || "Request not found."}</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-primary text-sm font-bold hover:underline">
                ← Go Back
            </button>
        </main>
    );

    const typeMeta  = REQUEST_TYPE_META[detail.requestType] || REQUEST_TYPE_META.OTHER;
    const statusCfg = getStatusConfig(detail.status);

    return (
        <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark">
            <div className="p-8 space-y-6 max-w-7xl w-full mx-auto">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                        {/* Back navigation */}
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary font-medium transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Back to My Requests
                        </button>
                        {/* Request type icon + title */}
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg text-primary">
                                <span className="material-symbols-outlined text-[28px]">{typeMeta.icon}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                    {typeMeta.label}
                                </h2>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        {detail.requestCode}
                                    </span>
                                    <span className="size-1 rounded-full bg-slate-300" />
                                    <span>Submitted: {formatDate(detail.submittedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status badge + Cancel button */}
                    <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-3 py-1.5 text-sm font-bold rounded-full ${statusCfg.bg}`}>
                            {statusCfg.label}
                        </span>
                        {detail.canCancel && !showCancelConfirm && (
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold rounded-lg border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            >
                                Cancel Request
                            </button>
                        )}
                    </div>
                </div>

                {/* Cancel confirmation card — hiện khi nhấn "Cancel Request" */}
                {showCancelConfirm && (
                    <CancelConfirmCard
                        onConfirm={handleCancelConfirm}
                        onDismiss={() => setShowCancelConfirm(false)}
                        cancelling={cancelling}
                    />
                )}

                {/* ── Main 2-col grid ─────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left column (2/3 width): detail + balance + feedback + activities */}
                    <div className="lg:col-span-2 space-y-6">
                        <RequestDetailCard
                            requestType={detail.requestType}
                            requestDetail={detail.requestDetail}
                        />
                        {/* Leave balance context: chỉ render với LEAVE request */}
                        {detail.requestType === "LEAVE" && (
                            <LeaveBalanceCard leaveBalance={detail.leaveBalance} />
                        )}
                        <FeedbackCard finalComment={detail.finalComment} status={detail.status} />
                        <ActivitiesSection activities={detail.activities} />
                    </div>

                    {/* Right column (1/3 width): approval timeline */}
                    <div className="space-y-6">
                        <TimelineSection timeline={detail.timeline} />
                    </div>
                </div>

            </div>
        </main>
    );
}