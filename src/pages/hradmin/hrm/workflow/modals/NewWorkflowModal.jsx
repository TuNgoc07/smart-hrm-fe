import { useState, useEffect } from "react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const REQUEST_TYPES = ["Leave Request", "Salary Increase", "Business Trip", "Expense Report", "Overtime Request"];
const REQUEST_TYPE_IDS = ["leave_request", "salary_increase", "business_trip", "expense_report", "ot"];

export default function NewWorkflowModal({ open, onClose, workflows }) {
  const [workflowName, setWorkflowName] = useState("");
  const [requestType, setRequestType] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [copyFromTemplate, setCopyFromTemplate] = useState("");
  const [addDefaultSteps, setAddDefaultSteps] = useState(false);

  useEffect(() => {
    if (open) {
      setWorkflowName("");
      setRequestType("");
      setDescription("");
      setActive(true);
      setCopyFromTemplate("");
      setAddDefaultSteps(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = {
      employeeId: localStorage.getItem("employeeId"),
      workflowName,
      requestType,
      description,
      active,
      copyFromWorkflowId: copyFromTemplate || undefined,
      addDefaultSteps,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/hradmin/workflows`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to create workflow:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold">Create New Workflow</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Workflow Name *</label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm"
              placeholder="e.g., Leave Request Workflow"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Request Type *</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm bg-white"
            >
              <option value="">Select request type...</option>
              {REQUEST_TYPES.map((_, index) => (
                <option key={index} value={REQUEST_TYPE_IDS[index]}>{REQUEST_TYPES[index]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border text-sm resize-none"
              rows={3}
              placeholder="Describe the workflow purpose..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="accent-primary w-5 h-5"
            />
            <label htmlFor="active" className="text-sm text-slate-700">Active (Enable this workflow)</label>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  checked={!!copyFromTemplate}
                  onChange={(e) => setCopyFromTemplate(e.target.checked ? (workflows?.[0]?.workflowId?.toString() || "") : "")}
                  className="accent-primary w-5 h-5"
                />
                Copy from existing template
              </label>
              {copyFromTemplate && (
                <select
                  value={copyFromTemplate}
                  onChange={(e) => setCopyFromTemplate(e.target.value)}
                  className="mt-2 w-full px-3 py-2.5 rounded-lg border text-sm bg-white"
                >
                  <option value="">Select template...</option>
                  {workflows?.map((w) => (
                    <option key={w.workflowId} value={w.workflowId}>{w.workflowName}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="defaultSteps"
                checked={addDefaultSteps}
                onChange={(e) => setAddDefaultSteps(e.target.checked)}
                className="accent-primary w-5 h-5"
              />
              <label htmlFor="defaultSteps" className="text-sm text-slate-700">
                Add default approval steps (Manager Approval → HR Approval)
              </label>
            </div>
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
            className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold"
            disabled={!workflowName || !requestType}
          >
            Create Workflow
          </button>
        </div>
      </div>
    </div>
  );
}
