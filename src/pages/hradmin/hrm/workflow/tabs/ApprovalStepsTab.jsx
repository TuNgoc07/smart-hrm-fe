import { useState, useEffect } from 'react';
import AddStepModal from '../modals/AddStepModal';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function ApprovalStepsTab({ workflow }) {    
    const [selectedStep, setSelectedStep] = useState(null);
    const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold">Approval Steps</h3>
                    <p className="text-sm text-slate-500 mt-1">Configure order, approver rules, required flags, and SLA for each step</p>
                </div>
                <PrimaryButton icon="add" label="Add Step" onClick={() => setIsAddStepModalOpen(true)} />
            </div>

            {workflow.steps && workflow.steps.length ? (
                <SectionCard title="Step Table">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase text-slate-500 border-b">
                            <tr>
                                <th className="px-4 py-3">Order</th>
                                <th className="px-4 py-3">Step Name</th>
                                <th className="px-4 py-3">Approver Rule</th>
                                <th className="px-4 py-3">Assigned Approver</th>
                                <th className="px-4 py-3">Required</th>
                                <th className="px-4 py-3">SLA / Due</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {workflow?.steps?.map((step) => (
                                <tr
                                    key={step.stepOrder}
                                    onClick={() => setSelectedStep(step)}
                                    className={`cursor-pointer hover:bg-slate-50 ${selectedStep?.stepOrder === step.stepOrder ? "bg-primary/5" : ""}`}
                                >
                                    <td className="px-4 py-4 font-bold">{step?.stepOrder}</td>
                                    <td className="px-4 py-4">{step?.stepName}</td>
                                    <td className="px-4 py-4 text-sm text-slate-600">{step?.approverLabel}</td>
                                    <td className="px-4 py-4 text-sm text-slate-600">{step?.approverName}</td>
                                    <td className="px-4 py-4">{step?.required ? <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">Required</span> : <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">Optional</span>}</td>
                                    <td className="px-4 py-4 text-sm text-slate-600">{step?.dueInHours ? `${step?.dueInHours}h` : 'N/A'}</td>
                                    <td className="px-4 py-4 text-right"><button className="text-primary text-sm font-bold" onClick={(e) => { e.stopPropagation(); setSelectedStep(step); }}>Edit</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </SectionCard>
            ) : (
                <EmptyStepState />
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SectionCard title="Step Editor">
                    {selectedStep ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField onChange={(e) => setSelectedStep({ ...selectedStep, stepName: e.target.value })} label="Step Name" value={selectedStep?.stepName || ""} />
                            <InputField onChange={(e) => setSelectedStep({ ...selectedStep, stepOrder: e.target.value })} label="Step Order" value={selectedStep?.stepOrder || ""} />
                            <InputField onChange={(e) => setSelectedStep({ ...selectedStep, approverType: e.target.value })} label="Approver Type" value={selectedStep?.approverType || "By Role"} />
                            <InputField onChange={(e) => setSelectedStep({ ...selectedStep, approverRole: e.target.value })} label="Approver Role" value={selectedStep?.approverRole || ""} />
                            <InputField onChange={(e) => setSelectedStep({ ...selectedStep, approverName: e.target.value })} label="Specific User" value={selectedStep?.approverName || ""} />
                            <InputField onChange={(e) => setSelectedStep({ ...selectedStep, dueInHours: e.target.value })} label="Due After" value={selectedStep?.dueInHours ? `${selectedStep?.dueInHours} hours` : ""} />
                            <InputField onChange={(e) => setSelectedStep({ ...selectedStep, escalationEnabled: e.target.value === "Yes" })} label="Escalation Enabled" value={selectedStep?.escalationEnabled ? "Yes" : "No"} />
                            <InputField onChange={(e) => setSelectedStep({ ...selectedStep, escalateTo: e.target.value })} label="Escalate To" value={selectedStep?.escalateTo || ""} />
                            <div className="md:col-span-2">
                                <InputField onChange={(e) => setSelectedStep({ ...selectedStep, notes: e.target.value })} label="Notes" value={selectedStep?.notes || ""} />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <p>Select a step from the table to edit</p>
                        </div>
                    )}
                </SectionCard>

                <SectionCard title="Approval Flow Preview">
                    <div className="space-y-4">
                        {workflow?.steps?.map((step, index) => (
                            <div key={step?.stepOrder} className="flex gap-4 items-start">
                                <div className="flex flex-col items-center">
                                    <div className="size-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">{step?.stepOrder}</div>
                                    {index < workflow?.steps?.length - 1 ? <div className="w-px h-10 bg-slate-200 mt-2" /> : null}
                                </div>
                                <div className="pt-1">
                                    <p className="font-bold">{step?.stepName}</p>
                                    <p className="text-sm text-slate-500">{step?.approverLabel}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            <AddStepModal open={isAddStepModalOpen} onClose={() => setIsAddStepModalOpen(false)} workflow={workflow} />
        </div>
    );
}

function EmptyStepState() {
    return <EmptyDataPlaceholder title="No approval steps configured" description="Add the first step to define approver chain, required rules, and SLA." actionLabel="Add first step" />;
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

function SectionCard({ title, children }) {
    return (
        <section className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50 font-bold">{title}</div>
            <div className="p-6">{children}</div>
        </section>
    );
}
function InputField({ label, value, onChange }) {
    return (
        <div>
            <label className="text-xs text-slate-500">{label}</label>
            <input onChange={onChange} type="text" value={value} className="mt-1 w-full px-3 py-2.5 rounded-lg border bg-slate-50 text-sm text-slate-700" />
        </div>
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