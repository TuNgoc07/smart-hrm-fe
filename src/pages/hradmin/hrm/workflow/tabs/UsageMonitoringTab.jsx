import { useState, useEffect } from "react";
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function UsageMonitoringTab({ workflow }) {
  const [usage, setUsage] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");

    const request = async () => {
      if (!token) {
        return;
      }

      const request = await fetch(`${API_BASE_URL}/api/hradmin/workflows/${workflow.workflowId}/current-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await request.json();
      console.log("workflow usage data: ", JSON.stringify(data));
      setUsage(data);
    };
    request();
  }, [workflow.workflowId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <SummaryCard label="Requests using workflow" value={workflow?.overview?.usageCount} helper="Total runtime executions" />
        <SummaryCard label="Pending approvals" value={workflow?.overview?.pendingRequests} helper="Awaiting current approvers" />
        <SummaryCard label="Overdue approvals" value={0} helper="Past due SLA" />
        <SummaryCard label="Escalated requests" value={0} helper="Scheduled or executed" />
        <SummaryCard label="Rejected this month" value={0} helper="Monthly rejected volume" />
      </div>

      <SectionCard title="Current Requests Table">
        {workflow?.overview?.usageCount && workflow?.overview?.usageCount > 0 ? (
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-500 border-b">
              <tr>
                <th className="px-4 py-3">Request Code</th>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Current Step</th>
                <th className="px-4 py-3">Current Approver</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted At</th>
                <th className="px-4 py-3">Due At</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usage?.map((item) => (
                <tr key={item.code}>
                  <td className="px-4 py-4 font-mono text-sm">{item.code}</td>
                  <td className="px-4 py-4">{item.employee}</td>
                  <td className="px-4 py-4">{item.currentStep}</td>
                  <td className="px-4 py-4">{item.currentApprover}</td>
                  <td className="px-4 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.status === "Overdue" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>{item.status}</span></td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.submittedAt}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.dueAt}</td>
                  <td className="px-4 py-4 text-right"><button className="text-primary font-bold text-sm">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyDataPlaceholder title="No active requests using this workflow" description="Runtime requests will appear here once this workflow is assigned." />
        )}
      </SectionCard>

    </div>
  );
}

function SummaryCard({ label, value, helper }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-extrabold mt-2">{value}</p>
      <p className="text-xs text-slate-400 mt-2">{helper}</p>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b bg-slate-50 font-bold">{title}</div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function EmptyDataPlaceholder({ title, description, actionLabel, compact = false }) {
  return (
    <div className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center ${compact ? "p-6" : "p-10"}`}>
      <h4 className="font-bold">{title}</h4>
      <p className="text-sm text-slate-500 mt-2">{description}</p>
      {actionLabel ? <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">{actionLabel}</button> : null}
    </div>
  );
}