import { useState, useEffect } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const APPROVER_ROLES = [
    { value: "DEPARTMENT_MANAGER", label: "Department Manager (auto-assign)" },
    { value: "HR_MANAGER", label: "HR Manager" },
    { value: "DIRECTOR", label: "Director" },
];

export default function AddStepModal({ open, onClose, workflow }) {
    const [stepName, setStepName] = useState("");
    const [stepOrder, setStepOrder] = useState("");
    const [approverType, setApproverType] = useState("By Role");
    const [approverRole, setApproverRole] = useState("DEPARTMENT_MANAGER");
    const [selectedApproverId, setSelectedApproverId] = useState("");
    const [dueInHours, setDueInHours] = useState("");
    const [escalationEnabled, setEscalationEnabled] = useState(false);
    const [escalateTo, setEscalateTo] = useState("");
    const [notes, setNotes] = useState("");
    const [isRequired, setIsRequired] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [approverOptions, setApproverOptions] = useState([]);
    const [loadingApprovers, setLoadingApprovers] = useState(false);

    // Fetch approver list khi modal mở
    useEffect(() => {
        if (!open) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        setLoadingApprovers(true);
        fetch(`${API_BASE_URL}/api/hradmin/workflows/approvers`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setApproverOptions(Array.isArray(data) ? data : []))
            .catch(() => setApproverOptions([]))
            .finally(() => setLoadingApprovers(false));
    }, [open]);

    // Reset form khi mở
    useEffect(() => {
        if (open) {
            setStepName("");
            setStepOrder(((workflow?.steps?.length ?? 0) + 1).toString());
            setApproverType("By Role");
            setApproverRole("DEPARTMENT_MANAGER");
            setSelectedApproverId("");
            setDueInHours("");
            setEscalationEnabled(false);
            setEscalateTo("");
            setNotes("");
            setIsRequired(true);
            setIsSubmitting(false);
        }
    }, [open, workflow?.steps?.length]);

    const selectedApprover = approverOptions.find(
        (a) => String(a.employeeId) === String(selectedApproverId)
    );

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!token || !stepName || !stepOrder) return;

        const payload = {
            stepName,
            stepOrder: parseInt(stepOrder),
            approverRole: approverType === "By Role" ? approverRole : null,
            approverId: approverType === "Specific User" && selectedApproverId
                ? parseInt(selectedApproverId) : null,
            approverName: approverType === "Specific User" && selectedApprover
                ? selectedApprover.fullName : null,
            dueInHours: dueInHours ? parseInt(dueInHours) : null,
            isRequired,
            escalationEnabled,
            escalateTo: escalationEnabled ? escalateTo : null,
            notes: notes || null,
        };

        setIsSubmitting(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/hradmin/workflows/${workflow?.workflowId}/steps`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );
            if (response.ok) {
                onClose();
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to add step:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!open) return null;

    const canSubmit = stepName && stepOrder &&
        (approverType === "By Role" ? !!approverRole : !!selectedApproverId);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b bg-slate-50">
                    <h2 className="text-lg font-bold">Add Approval Step</h2>
                </div>

                <div className="p-6 space-y-4">
                    {/* Step Name */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Step Name *</label>
                        <input
                            type="text"
                            value={stepName}
                            onChange={(e) => setStepName(e.target.value)}
                            className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm"
                            placeholder="e.g., Manager Approval"
                        />
                    </div>

                    {/* Step Order */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Step Order *</label>
                        <input
                            type="number"
                            value={stepOrder}
                            onChange={(e) => setStepOrder(e.target.value)}
                            className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm"
                            min={1}
                        />
                    </div>

                    {/* Approver Type */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Approver Type *</label>
                        <select
                            value={approverType}
                            onChange={(e) => {
                                setApproverType(e.target.value);
                                setSelectedApproverId("");
                                setApproverRole("DEPARTMENT_MANAGER");
                            }}
                            className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm bg-white"
                        >
                            <option value="By Role">By Role (auto-assign)</option>
                            <option value="Specific User">Specific Employee</option>
                        </select>
                    </div>

                    {/* By Role → dropdown */}
                    {approverType === "By Role" && (
                        <div>
                            <label className="text-sm font-medium text-slate-700">Approver Role *</label>
                            <select
                                value={approverRole}
                                onChange={(e) => setApproverRole(e.target.value)}
                                className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm bg-white"
                            >
                                {APPROVER_ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-slate-400">
                                Department Manager: tự động gán manager trực tiếp của nhân viên (fallback sang department manager nếu không có).
                            </p>
                        </div>
                    )}

                    {/* Specific User → dropdown từ backend */}
                    {approverType === "Specific User" && (
                        <div>
                            <label className="text-sm font-medium text-slate-700">Select Approver *</label>
                            {loadingApprovers ? (
                                <div className="mt-1 px-3 py-2.5 rounded-lg border bg-slate-50 text-sm text-slate-400">
                                    Loading...
                                </div>
                            ) : (
                                <select
                                    value={selectedApproverId}
                                    onChange={(e) => setSelectedApproverId(e.target.value)}
                                    className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm bg-white"
                                >
                                    <option value="">— Chọn người duyệt —</option>
                                    {approverOptions.map((opt) => (
                                        <option key={opt.employeeId} value={opt.employeeId}>
                                            {opt.fullName}
                                            {opt.departmentName ? ` — ${opt.departmentName}` : ""}
                                            {opt.positionName ? ` (${opt.positionName})` : ""}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {approverOptions.length === 0 && !loadingApprovers && (
                                <p className="mt-1 text-xs text-amber-500">
                                    Không tìm thấy manager nào đang active. Kiểm tra lại dữ liệu employee_positions.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Due After */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Due After (hours)</label>
                        <input
                            type="number"
                            value={dueInHours}
                            onChange={(e) => setDueInHours(e.target.value)}
                            className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm"
                            placeholder="e.g., 24"
                            min={1}
                        />
                    </div>

                    {/* Required */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="required"
                            checked={isRequired}
                            onChange={(e) => setIsRequired(e.target.checked)}
                            className="accent-primary w-4 h-4"
                        />
                        <label htmlFor="required" className="text-sm text-slate-700">
                            Required (must be completed)
                        </label>
                    </div>

                    {/* Escalation */}
                    <div className="border-t pt-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="escalation"
                                checked={escalationEnabled}
                                onChange={(e) => setEscalationEnabled(e.target.checked)}
                                className="accent-primary w-4 h-4"
                            />
                            <label htmlFor="escalation" className="text-sm text-slate-700">
                                Enable Escalation
                            </label>
                        </div>
                        {escalationEnabled && (
                            <div>
                                <label className="text-sm font-medium text-slate-700">Escalate To</label>
                                <input
                                    type="text"
                                    value={escalateTo}
                                    onChange={(e) => setEscalateTo(e.target.value)}
                                    className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm"
                                    placeholder="e.g., HR Director"
                                />
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="text-sm font-medium text-slate-700">Notes</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm resize-none"
                            rows={3}
                            placeholder="Additional notes or instructions..."
                        />
                    </div>
                </div>

                <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-lg border bg-white text-sm font-bold text-slate-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50"
                    >
                        {isSubmitting ? "Adding..." : "Add Step"}
                    </button>
                </div>
            </div>
        </div>
    );
}