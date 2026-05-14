// import {useState, useEffect} from 'react';

// export default function AutomationTab({ workflow }) {
//   return (
//     <div className="space-y-6">
//       {workflow?.automation?.hasIntegrationError ? <AlertBanner tone="danger" title="Last automation trigger failed" description={workflow.lastResponse} /> : null}

//       <SectionCard title="Integration Summary">
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
//           <DisplayField label="Integration Enabled" value={workflow?.automation?.integrationEnabled ? "Yes" : "No"} />
//           <DisplayField label="Integration Type" value={workflow?.automation?.integrationType || "-"} />
//           <DisplayField label="External Workflow ID" value={workflow?.automation?.externalWorkflowId || "-"} mono />
//           <DisplayField label="Webhook URL" value={workflow?.automation?.webhookUrl || "Not configured"} mono />
//           <DisplayField label="Method" value={workflow?.automation?.method || "-"} />
//           <DisplayField label="Auth Type" value={workflow?.automation?.authType || "-"} />
//           <DisplayField label="Environment" value={workflow?.automation?.environment || "-"} />
//           <DisplayField label="Last Triggered At" value={workflow?.automation?.lastTriggeredAt || "Never"} />
//           <DisplayField label="Last Trigger Status" value={workflow?.automation?.lastTriggerStatus || "Not configured"} />
//         </div>
//       </SectionCard>

//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//         <SectionCard title="Trigger Rules">
//           <div className="space-y-3">
//             {["On Request Created", "On Request Submitted", "On Step Approved", "On Fully Approved", "On Rejected", "On Completed"].map((trigger) => (
//               <label key={trigger} className="flex items-center gap-3">
//                 <input type="checkbox" checked={(workflow.automation?.triggers || []).includes(trigger)} readOnly className="accent-primary w-5 h-5" />
//                 <span className="text-sm">{trigger}</span>
//               </label>
//             ))}
//           </div>
//         </SectionCard>

//         <SectionCard title="Payload & Testing">
//           <div className="space-y-4">
//             <div className="rounded-lg bg-slate-50 p-4 font-mono text-xs text-slate-700 overflow-auto">
//               {JSON.stringify(workflow.payloadPreview || {}, null, 2)}
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <DisplayField label="Last Response" value={workflow.lastResponse || "-"} />
//               <DisplayField label="Retry Count" value={workflow.retryCount || 0} />
//             </div>
//             <div className="flex flex-wrap gap-3">
//               <PrimaryButton icon="send" label="Test Webhook" />
//               <SecondaryButton icon="visibility" label="View Payload" />
//               <SecondaryButton icon="replay" label="Retry Last Trigger" />
//             </div>
//           </div>
//         </SectionCard>
//       </div>
//     </div>
//   );
// }

// function SectionCard({ title, children }) {
//   return (
//     <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
//       <div className="px-6 py-4 border-b bg-slate-50 font-bold">{title}</div>
//       <div className="p-6">{children}</div>
//     </section>
//   );
// }

// function PrimaryButton({ icon, label }) {
//   return (
//     <button className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold flex items-center gap-2">
//       <span className="material-symbols-outlined text-[18px]">{icon}</span>
//       {label}
//     </button>
//   );
// }

// function SecondaryButton({ icon, label }) {
//   return (
//     <button className="px-4 py-2.5 rounded-lg border bg-white text-sm font-bold text-slate-700 flex items-center gap-2">
//       <span className="material-symbols-outlined text-[18px]">{icon}</span>
//       {label}
//     </button>
//   );
// }

// function DisplayField({ label, value, mono }) {
//   return (
//     <div>
//       <p className="text-xs text-slate-500">{label}</p>
//       <div className={`mt-1 p-3 rounded-lg bg-slate-50 text-sm ${mono ? "font-mono text-primary" : "text-slate-700"}`}>{value}</div>
//     </div>
//   );
// }

// function AlertBanner({ tone, title, description }) {
//   const toneClasses = tone === "danger"
//     ? "bg-rose-50 border-rose-200 text-rose-700"
//     : tone === "warning"
//       ? "bg-amber-50 border-amber-200 text-amber-700"
//       : "bg-blue-50 border-blue-200 text-blue-700";

//   return (
//     <div className={`rounded-xl border px-5 py-4 ${toneClasses}`}>
//       <p className="font-bold">{title}</p>
//       <p className="text-sm mt-1 opacity-90">{description}</p>
//     </div>
//   );
// }