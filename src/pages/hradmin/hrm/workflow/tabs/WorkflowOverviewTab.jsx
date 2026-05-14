import { useState, useEffect } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function OverviewTab({ workflow }) {
    return (
        <div className="space-y-6">
            <SectionCard title="Basic Information">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <DisplayField label="Workflow ID" value={workflow?.workflowId || workflow.workflowId} mono />
                    <DisplayField label="Workflow Code" value={workflow?.workflowCode || workflow.workflowCode || "-"} mono />
                    <DisplayField label="Workflow Name" value={workflow?.workflowName || workflow.workflowName} />
                    <DisplayField label="Request Type" value={workflow?.requestType || workflow.requestType || "-"} />
                    <DisplayField label="Description" value={workflow?.description || workflow.description || "-"} />
                    <DisplayField label="Status" value={workflow?.active ? "Active" : "Inactive"} />
                    <DisplayField label="Created At" value={workflow?.createdAt} />
                    <DisplayField label="Updated At" value={workflow?.updatedAt} />
                </div>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <SummaryCard label="Total Requests" value={workflow?.overview?.usageCount || 0} helper="Requests using this workflow" />
                <SummaryCard label="Pending Requests" value={workflow?.overview?.pendingRequests || 0} helper="Currently awaiting approval" />
                {/* <SummaryCard label="Current Escalations" value={workflow?.overview?.currentEscalations || 0} helper="Escalated approvals in runtime" />
                <SummaryCard label="Average Completion Time" value={workflow?.overview?.averageCompletionTime || "-"} helper="Average end-to-end approval time" /> */}
            </div>

            <SectionCard title="Current Configuration Snapshot">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    <SnapshotMetric label="Number of Steps" value={workflow?.overview?.approvalStepCount || 0} />
                    <SnapshotMetric label="Required Steps" value={workflow?.overview?.requiredStepsCount || 0} />
                    <SnapshotMetric label="Integration Status" value={workflow?.overview?.integrationEnabled ? "Enabled" : "Disabled"} />
                    <SnapshotMetric label="Last Config Changed By" value={workflow?.overview?.lastChangedBy || "-"} />
                    <SnapshotMetric label="Last Config Changed At" value={workflow?.overview?.lastChangedAt || "-"} />
                </div>
            </SectionCard>
        </div>
    );
}

function SnapshotMetric({ label, value }) {
  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-base font-bold mt-2">{value}</p>
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

function DisplayField({ label, value, mono }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <div className={`mt-1 p-3 rounded-lg bg-slate-50 text-sm ${mono ? "font-mono text-primary" : "text-slate-700"}`}>{value}</div>
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