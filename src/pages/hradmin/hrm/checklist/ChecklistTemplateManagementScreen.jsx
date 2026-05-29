import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    fetchChecklistTemplates,
    fetchChecklistTemplateDetail,
    createChecklistTemplate,
    updateChecklistTemplate,
} from "../../../../utils/hrApi";

export default function ChecklistTemplateManagementScreen() {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const load = () => {
        setLoading(true);
        fetchChecklistTemplates()
            .then(data => setTemplates(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async (data) => {
        setSubmitting(true);
        try {
            await createChecklistTemplate(data.name, data.description, data.items);
            setShowModal(false);
            load();
        } catch (err) {
            alert("Failed to create template: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (templateId, data) => {
        setSubmitting(true);
        try {
            await updateChecklistTemplate(templateId, data.name, data.description, data.isActive);
            setShowModal(false);
            setEditingTemplate(null);
            load();
        } catch (err) {
            alert("Failed to update template: " + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const openEdit = async (templateId) => {
        const template = await fetchChecklistTemplateDetail(templateId);
        setEditingTemplate(template);
        setShowModal(true);
    };

    return (
        <main className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            <div className="mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-[#0d141b] dark:text-white">Checklist Templates</h1>
                        <p className="text-sm text-[#4c739a] mt-0.5">Create and manage document checklist templates</p>
                    </div>
                    <button
                        onClick={() => { setEditingTemplate(null); setShowModal(true); }}
                        className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">add</span>
                        New Template
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500 text-sm">{error}</div>
                ) : templates.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 rounded-xl p-16 text-center">
                        <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">checklist</span>
                        <p className="text-sm font-bold text-[#4c739a]">No templates yet.</p>
                        <p className="text-xs text-[#4c739a] mt-1">Create your first template to start assigning checklists to employees.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map(t => (
                            <TemplateCard key={t.templateId} template={t} onEdit={() => openEdit(t.templateId)} />
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <TemplateModal
                    template={editingTemplate}
                    submitting={submitting}
                    onClose={() => { setShowModal(false); setEditingTemplate(null); }}
                    onSubmit={editingTemplate ? (d) => handleEdit(editingTemplate.templateId, d) : handleCreate}
                />
            )}
        </main>
    );
}

function TemplateCard({ template, onEdit }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-[#cfdbe7] dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-[#0d141b] dark:text-white truncate">{template.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${template.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"}`}>
                            {template.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    {template.description && (
                        <p className="text-xs text-[#4c739a] mt-1 line-clamp-2">{template.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-[#4c739a]">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">task_alt</span>
                            {template.itemCount} items
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {new Date(template.createdAt).toLocaleDateString("en-GB")}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onEdit}
                    className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                    title="Edit Template"
                >
                    <span className="material-symbols-outlined">edit</span>
                </button>
            </div>
        </div>
    );
}

function TemplateModal({ template, submitting, onClose, onSubmit }) {
    const [name, setName] = useState(template?.name || "");
    const [description, setDescription] = useState(template?.description || "");
    const [isActive, setIsActive] = useState(template?.isActive !== false);
    const [items, setItems] = useState(template?.items || [{ title: "", description: "", isRequired: true, category: "other" }]);

    const addItem = () => setItems([...items, { title: "", description: "", isRequired: true, category: "other" }]);
    const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));
    const updateItem = (idx, field, value) => {
        const newItems = [...items];
        newItems[idx] = { ...newItems[idx], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return alert("Template name is required");
        const validItems = items.filter(i => i.title.trim());
        if (validItems.length === 0) return alert("At least one item is required");
        onSubmit({ name, description, isActive, items: validItems });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-[#cfdbe7] dark:border-slate-800 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-[#cfdbe7] dark:border-slate-800">
                    <h2 className="text-base font-bold text-[#0d141b] dark:text-white">
                        {template ? "Edit Template" : "New Template"}
                    </h2>
                    <button onClick={onClose} className="p-2 text-[#4c739a] hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-[#0d141b] dark:text-white mb-2">Template Name <span className="text-red-500">*</span></label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Onboarding Checklist 2024"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#0d141b] dark:text-white mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Brief description of this checklist..."
                            rows={2}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={isActive}
                            onChange={e => setIsActive(e.target.checked)}
                            className="w-4 h-4 accent-primary"
                        />
                        <label htmlFor="isActive" className="text-sm font-bold text-[#0d141b] dark:text-white">Active</label>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-bold text-[#0d141b] dark:text-white">Checklist Items</label>
                            <button type="button" onClick={addItem} className="text-xs font-bold text-primary hover:underline">+ Add Item</button>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <input
                                                value={item.title}
                                                onChange={e => updateItem(idx, "title", e.target.value)}
                                                placeholder="Item title (e.g. Employment Contract)"
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                                            />
                                        </div>
                                        <button type="button" onClick={() => removeItem(idx)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                            <span className="material-symbols-outlined text-base">delete</span>
                                        </button>
                                    </div>
                                    <input
                                        value={item.description}
                                        onChange={e => updateItem(idx, "description", e.target.value)}
                                        placeholder="Description (optional)"
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    />
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 text-xs text-[#4c739a]">
                                            <input
                                                type="checkbox"
                                                checked={item.isRequired}
                                                onChange={e => updateItem(idx, "isRequired", e.target.checked)}
                                                className="w-3 h-3 accent-primary"
                                            />
                                            Required
                                        </label>
                                        <select
                                            value={item.category}
                                            onChange={e => updateItem(idx, "category", e.target.value)}
                                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs dark:text-white"
                                        >
                                            <option value="other">Other</option>
                                            <option value="contract">Contract</option>
                                            <option value="id">ID Document</option>
                                            <option value="tax">Tax</option>
                                            <option value="certificate">Certificate</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[#cfdbe7] dark:border-slate-800">
                        <button type="button" onClick={onClose} disabled={submitting}
                            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 text-sm font-bold rounded-lg text-[#4c739a] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting}
                            className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting ? (
                                <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Saving...</>
                            ) : (
                                <><span className="material-symbols-outlined text-base">save</span> Save Template</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
