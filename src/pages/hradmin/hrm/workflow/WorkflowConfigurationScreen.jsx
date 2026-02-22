export default function WorkflowConfigScreen() {
    return (
      <div className="space-y-8 max-w-[1400px] mx-auto">
  
        {/* ===== BREADCRUMB + TITLE ===== */}
        <div>
          <nav className="flex text-xs text-slate-500 mb-2">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>HR Module</span>
            <span className="mx-2">/</span>
            <span className="text-primary font-semibold">Workflow Configuration</span>
          </nav>
  
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-extrabold">
              Workflow Configuration (n8n Integration)
            </h1>
  
            <div className="flex items-center gap-4">
              <input
                className="pl-4 pr-4 py-2 bg-slate-100 rounded-lg text-sm w-64"
                placeholder="Search workflows..."
              />
              <button className="p-2 bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined">notifications</span>
              </button>
            </div>
          </div>
        </div>
  
        {/* ===== WORKFLOW MAPPING LIST ===== */}
        <WorkflowMappingList />
  
        {/* ===== CONFIG + LOGIC ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <WorkflowConfiguration />
          <WorkflowLogic />
        </div>
  
        {/* ===== ACTIVATE ===== */}
        <WorkflowActivation />
  
        {/* ===== HISTORY ===== */}
        <WorkflowHistory />
      </div>
    );
  }
  
  /* ================= TABLE ================= */
  
  function WorkflowMappingList() {
    return (
      <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold">Workflow Mapping List</h3>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex gap-2">
            <span className="material-symbols-outlined text-sm">add</span>
            New Integration
          </button>
        </div>
  
        <table className="w-full text-left">
          <thead className="text-xs uppercase text-slate-500 border-b">
            <tr>
              <th className="px-6 py-3">Request Type</th>
              <th className="px-6 py-3">Workflow Name</th>
              <th className="px-6 py-3">n8n ID</th>
              <th className="px-6 py-3">Version</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
  
          <tbody className="divide-y">
            <Row type="Leave Request" name="Employee Time Off" id="n8n-10293" ver="v1.2" status="Active" />
            <Row type="Onboarding" name="New Hire Sync" id="n8n-44921" ver="v2.0" status="Inactive" active />
            <Row type="Expense Claim" name="Finance Approval" id="n8n-88210" ver="v1.1" status="Active" />
          </tbody>
        </table>
      </section>
    );
  }
  
  function Row({ type, name, id, ver, status, active }) {
    return (
      <tr className={`${active ? "bg-primary/5 border-l-4 border-primary" : ""} hover:bg-slate-50`}>
        <td className="px-6 py-4 text-sm text-slate-500">{type}</td>
        <td className="px-6 py-4 font-bold">{name}</td>
        <td className="px-6 py-4 font-mono text-sm text-slate-500">{id}</td>
        <td className="px-6 py-4 text-sm">{ver}</td>
        <td className="px-6 py-4">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            status === "Active"
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}>
            {status}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <button className="text-primary font-bold text-sm hover:underline">
            Edit
          </button>
        </td>
      </tr>
    );
  }
  
  /* ================= CONFIG ================= */
  
  function WorkflowConfiguration() {
    return (
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-6 py-4 border-b font-bold">
          Workflow Configuration
        </div>
  
        <div className="p-6 space-y-4">
          <Field label="Request Type" value="Onboarding" />
          <Field label="Workflow Name" value="New Hire Sync" />
          <Field label="Webhook URL" value="https://n8n.enterprise-ops.com/webhook/new-hire" mono />
          <Field label="Workflow ID" value="n8n-44921" mono />
        </div>
      </div>
    );
  }
  
  function Field({ label, value, mono }) {
    return (
      <div>
        <label className="text-xs text-slate-500">{label}</label>
        <div className={`mt-1 p-2 rounded-lg bg-slate-50 text-sm ${mono ? "font-mono text-primary" : ""}`}>
          {value}
        </div>
      </div>
    );
  }
  
  /* ================= LOGIC ================= */
  
  function WorkflowLogic() {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <h3 className="font-bold">Logic & Controls</h3>
  
        {["On Request Created", "On Approved", "On Rejected"].map(label => (
          <label key={label} className="flex items-center gap-3">
            <input type="checkbox" className="accent-primary w-5 h-5" />
            <span className="text-sm">{label}</span>
          </label>
        ))}
      </div>
    );
  }
  
  /* ================= ACTIVATE ================= */
  
  function WorkflowActivation() {
    return (
      <div className="bg-white rounded-xl border shadow-sm p-6 flex justify-between items-center">
        <div>
          <p className="font-bold">Workflow Status</p>
          <p className="text-xs text-slate-500">
            This workflow is currently <span className="text-red-500 font-bold">Inactive</span>
          </p>
        </div>
  
        <div className="flex gap-3">
          <button className="px-6 py-2 border rounded-lg font-bold">
            Deactivate
          </button>
          <button className="px-6 py-2 bg-primary text-white rounded-lg font-bold">
            Activate Workflow
          </button>
        </div>
      </div>
    );
  }
  
  /* ================= HISTORY ================= */
  
  function WorkflowHistory() {
    return (
      <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b font-bold bg-slate-50">
          Workflow Change History
        </div>
  
        <table className="w-full text-left">
          <thead className="text-xs uppercase text-slate-500 border-b">
            <tr>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Changed By</th>
              <th className="px-6 py-3">Notes</th>
            </tr>
          </thead>
  
          <tbody className="divide-y">
            <HistoryRow action="Modified Config" by="Sarah Reed" />
            <HistoryRow action="Deactivated" by="Mark Kim" />
            <HistoryRow action="Version Update" by="John Doe" />
          </tbody>
        </table>
      </section>
    );
  }
  
  function HistoryRow({ action, by }) {
    return (
      <tr>
        <td className="px-6 py-4 text-sm text-slate-500">Oct 24, 2023</td>
        <td className="px-6 py-4">
          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">
            {action}
          </span>
        </td>
        <td className="px-6 py-4 font-medium">{by}</td>
        <td className="px-6 py-4 text-sm text-slate-500">
          Updated workflow configuration.
        </td>
      </tr>
    );
  }
  