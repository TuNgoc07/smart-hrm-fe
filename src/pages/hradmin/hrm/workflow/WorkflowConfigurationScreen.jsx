import { useMemo, useState, useEffect } from "react";
import OverviewTab from "./tabs/WorkflowOverviewTab";
import ApprovalStepsTab from "./tabs/ApprovalStepsTab";
import UsageMonitoringTab from "./tabs/UsageMonitoringTab";
import HistoryTab from "./tabs/HistoryTab";
import NewWorkflowModal from "./modals/NewWorkflowModal";

const TAB_ITEMS = ["Overview", "Approval Steps", "Usage & Monitoring", "History"];

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function WorkflowConfigScreen() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [searchValue, setSearchValue] = useState("");
  const [requestTypeFilter, setRequestTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [integrationFilter, setIntegrationFilter] = useState("All Integrations");
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [workflowDetail, setWorkflowDetail] = useState(null);
  const [isNewWorkflowModalOpen, setIsNewWorkflowModalOpen] = useState(false);

  useEffect(() => {
    if (workflows && workflows.length > 0 && !selectedWorkflowId) {
      setSelectedWorkflowId(workflows[0].workflowId);
    }
  }, [workflows, selectedWorkflowId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const request = async () => {
      if (!token) {
        return;
      }

      const request = await fetch(`${API_BASE_URL}/api/hradmin/workflows`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await request.json();
      console.log("workflow configuration: ", JSON.stringify(data));
      setWorkflows(data);
    };
    request();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const request = async () => {
      if (!token || !selectedWorkflowId) {
        return;
      }

      const request = await fetch(`${API_BASE_URL}/api/hradmin/workflows/${selectedWorkflowId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await request.json();
      console.log("workflow detail: ", JSON.stringify(data));
      setWorkflowDetail(data);
    };
    request();
  }, [selectedWorkflowId]);

  const filteredWorkflows = useMemo(() => {
    return workflows?.filter((workflow) => {
      const matchesSearch = !searchValue || `${workflow.workflowName} ${workflow.requestType || ""}`.toLowerCase().includes(searchValue.toLowerCase());
      const matchesType = requestTypeFilter === "All Types" || workflow.requestType === requestTypeFilter;
      const matchesStatus = statusFilter === "All Statuses" || (statusFilter === "Active" ? workflow.active : !workflow.active);
      const matchesIntegration = integrationFilter === "All Integrations" || (integrationFilter === "n8n" ? workflow.integrationEnabled : integrationFilter === "none" ? !workflow.integrationEnabled : false);

      return matchesSearch && matchesType && matchesStatus && matchesIntegration;
    });
  }, [integrationFilter, requestTypeFilter, searchValue, statusFilter, workflows]);

  const selectedWorkflow = workflowDetail || filteredWorkflows.find((workflow) => workflow.workflowId === selectedWorkflowId) || filteredWorkflows[0] || null;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <PageHeader workflows={workflows} searchValue={searchValue} onSearchChange={setSearchValue} onNewWorkflow={() => setIsNewWorkflowModalOpen(true)} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-4">
          <FilterBar
            workflows={workflows}
            requestTypeFilter={requestTypeFilter}
            onRequestTypeChange={setRequestTypeFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            integrationFilter={integrationFilter}
            onIntegrationChange={setIntegrationFilter}
          />
          <WorkflowListPanel
            workflows={workflows}
            selectedWorkflowId={selectedWorkflow?.workflowId}
            onSelectWorkflow={setSelectedWorkflowId}
            onNewWorkflow={() => setIsNewWorkflowModalOpen(true)}
          />
        </div>

        <div className="xl:col-span-8">
          {selectedWorkflow ? (
            <WorkflowDetailWorkspace
              activeTab={activeTab}
              onTabChange={setActiveTab}
              workflow={selectedWorkflow}
            />
          ) : (
            <EmptyWorkflowState />
          )}
        </div>
      </div>

      <NewWorkflowModal open={isNewWorkflowModalOpen} onClose={() => setIsNewWorkflowModalOpen(false)} workflows={workflows} />
    </div>
  );
}

function PageHeader({ workflows, searchValue, onSearchChange, onNewWorkflow }) {
  return (
    <div className="space-y-4">
      <div>
        <nav className="flex text-xs text-slate-500 mb-2">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span>HR Module</span>
          <span className="mx-2">/</span>
          <span className="text-primary font-semibold">Workflow Configuration</span>
        </nav>

        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold">Workflow Configuration</h1>
            <p className="text-sm text-slate-500 mt-1">Configure approval flows and automation for HR requests</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm w-72"
                placeholder="Search workflows..."
              />
            </div>
            <IconButton icon="tune" label="Filter" />
            <IconButton icon="refresh" label="Refresh" />
            <SecondaryButton icon="content_copy" label="Duplicate Workflow" />
            <SecondaryButton icon="download" label="Export Config" />
            <PrimaryButton icon="add" label="New Workflow" onClick={onNewWorkflow} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterBar({ workflows, requestTypeFilter, onRequestTypeChange, statusFilter, onStatusChange, integrationFilter, onIntegrationChange }) {
  return (
    <section className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Filter Workflows</h3>
        <span className="text-xs text-slate-400">Updated newest</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-3">
        <SelectField label="Request Type" value={requestTypeFilter} onChange={onRequestTypeChange} options={["All Types", ...new Set(workflows?.map((w) => w.requestType))].filter(Boolean)} />
        <SelectField label="Status" value={statusFilter} onChange={onStatusChange} options={["All Statuses", "Active", "Inactive"]} />
        <SelectField label="Integration" value={integrationFilter} onChange={onIntegrationChange} options={["All Integrations", "n8n", "none"]} />
      </div>
    </section>
  );
}

function WorkflowListPanel({ workflows, selectedWorkflowId, onSelectWorkflow, onNewWorkflow }) {
  return (
    <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b bg-slate-50 flex items-center justify-between">
        <div>
          <h3 className="font-bold">Workflow Templates</h3>
          <p className="text-xs text-slate-500 mt-1">Manage request-type mapping, approval chains, and integration status</p>
        </div>
        <button onClick={onNewWorkflow} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          New Workflow
        </button>
      </div>

      {workflows?.length ? (
        <div className="divide-y">
          {workflows?.map((workflow) => (
            <WorkflowListItem
              key={workflow.workflowId}
              workflow={workflow}
              isSelected={selectedWorkflowId === workflow.workflowId}
              onClick={() => onSelectWorkflow(workflow.workflowId)}
            />
          ))}
        </div>
      ) : (
        <EmptyWorkflowState compact />
      )}
    </section>
  );
}

function WorkflowListItem({ workflow, isSelected, onClick }) {
  return (
    <button onClick={onClick} className={`w-full text-left p-5 hover:bg-slate-50 transition-colors ${isSelected ? "bg-primary/5 border-l-4 border-primary" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-slate-900">{workflow.workflowName}</h4>
            <StatusBadge active={workflow.active} />
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{workflow.integrationLabel}</span>
          </div>
          <p className="text-sm text-slate-500">{workflow.requestType || ""}</p>
          <p className="text-sm text-slate-600">{workflow.description || "No description"}</p>
        </div>

        <span className="text-primary text-sm font-bold">View</span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-slate-500">
        <InfoPill label="Approval Steps" value={`${workflow.approvalStepCount || 0} steps`} />
        <InfoPill label="Updated At" value={workflow.updatedAt} />
      </div>
    </button>
  );
}

function WorkflowDetailWorkspace({ activeTab, onTabChange, workflow }) {
  return (
    <div className="space-y-4">
      <WorkflowStatusBanner workflow={workflow} />
      <WorkflowWorkspaceHeader workflow={workflow} />

      <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 border-b bg-slate-50">
          <div className="flex flex-wrap gap-2 py-3">
            {TAB_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => onTabChange(item)}
                className={`px-4 py-2 rounded-lg text-sm font-bold ${activeTab === item ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === "Overview" ? <OverviewTab workflow={workflow} /> : null}
          {activeTab === "Approval Steps" ? <ApprovalStepsTab workflow={workflow} /> : null}
          {/* {activeTab === "Automation" ? <AutomationTab workflow={workflow} /> : null} */}
          {activeTab === "Usage & Monitoring" ? <UsageMonitoringTab workflow={workflow} /> : null}
          {activeTab === "History" ? <HistoryTab workflow={workflow} /> : null}
        </div>
      </section>
    </div>
  );
}

function WorkflowStatusBanner({ workflow }) {
  if (!workflow.active) {
    return <AlertBanner tone="warning" title="This workflow is inactive and will not be assigned to new requests" description="Review approval steps and reactivate when ready for use." />;
  }

  if (workflow.pendingRequests > 0) {
    return <AlertBanner tone="info" title={`This workflow is active and currently used by ${workflow.pendingRequests} pending requests`} description="Changes here may affect in-flight approvals and runtime behavior." />;
  }

  return null;
}

function WorkflowWorkspaceHeader({ workflow }) {
  const handleToggleStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/hradmin/workflows/${workflow.workflowId}/toggle-status?active=${!workflow.active}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(Number(localStorage.getItem("employeeId"))),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to toggle workflow status:", error);
    }
  };

  return (
    <section className="bg-white rounded-xl border shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-extrabold">{workflow.workflowName}</h2>
          <StatusBadge active={workflow.active} />
        </div>
        <p className="text-sm text-slate-500 mt-1">{workflow.requestType || ""} · {workflow.description || ""}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <SecondaryButton icon="edit" label="Edit" />
        <SecondaryButton icon="save" label="Save Draft" />
        <SecondaryButton icon="content_copy" label="Duplicate" />
        <SecondaryButton icon="delete" label="Delete" />
        {workflow.active ? <PrimaryButton icon="pause_circle" label="Deactivate" onClick={handleToggleStatus} /> : <PrimaryButton icon="play_circle" label="Activate" onClick={handleToggleStatus} />}
      </div>
    </section>
  );
}

function EmptyWorkflowState({ compact = false }) {
  return (
    <div className={`bg-white rounded-xl border shadow-sm flex flex-col items-center justify-center text-center ${compact ? "p-8" : "p-16 min-h-[520px]"}`}>
      <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        <span className="material-symbols-outlined text-3xl">schema</span>
      </div>
      <h3 className="text-lg font-bold">No workflow configured yet</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-md">Create workflow templates for leave, OT, onboarding, expense claim, and other HR request types.</p>
      <button className="mt-5 px-5 py-2.5 bg-primary text-white rounded-lg font-bold">Create your first workflow</button>
    </div>
  );
}

function SelectField({ label, options, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-500">{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border bg-white text-sm text-slate-700">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({ active }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${active ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"}`}>{active ? "Active" : "Inactive"}</span>;
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[11px] uppercase font-bold text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-700 mt-1">{value}</p>
    </div>
  );
}

function AlertBanner({ tone, title, description }) {
  const toneClasses = tone === "danger"
    ? "bg-rose-50 border-rose-200 text-rose-700"
    : tone === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-blue-50 border-blue-200 text-blue-700";

  return (
    <div className={`rounded-xl border px-5 py-4 ${toneClasses}`}>
      <p className="font-bold">{title}</p>
      <p className="text-sm mt-1 opacity-90">{description}</p>
    </div>
  );
}

function IconButton({ icon, label }) {
  return (
    <button className="px-3 py-2.5 rounded-lg border bg-white text-sm font-bold text-slate-600 flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  );
}

function PrimaryButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  );
}

function SecondaryButton({ icon, label }) {
  return (
    <button className="px-4 py-2.5 rounded-lg border bg-white text-sm font-bold text-slate-700 flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  );
}