import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddContractTemplateModal from "./AddContractTemplateModal";
import ContractTemplateDetailModal from "./ContractTemplateDetailModal";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function ContractTemplateListScreen() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API}/api/hradmin/contract-templates`, { headers: authHeader() });
      const json = await res.json();
      console.log('templates: ' + JSON.stringify(json.data));

      if (json.status === "success") {

        setTemplates(json.data || []);
      }
    } catch (e) {
      console.error("Failed to load templates", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId) => {
    if (!window.confirm("Are you sure you want to deactivate this template?")) return;
    try {
      const res = await fetch(`${API}/api/hradmin/contract-templates/${templateId}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      if (res.ok) {
        fetchTemplates();
      }
    } catch (e) {
      console.error("Failed to delete template", e);
    }
  };

  return (
    <div className="space-y-6">
      {/* BREADCRUMB */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[#4c739a]">
          <span>HR Core</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-[#0d141b] font-medium">Contract Templates</span>
        </div>
        <button
          onClick={() => navigate("/hradmin/contracts")}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-bold text-[#4c739a] hover:bg-slate-50 hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Contracts
        </button>
      </div>

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#0d141b]">Contract Templates</h1>
          <p className="text-sm text-slate-500">Manage contract templates for different employment types</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-blue-600"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Template
        </button>
      </div>

      {/* TEMPLATES GRID */}
      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading templates…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.templateId}
              template={template}
              onView={() => setSelectedTemplate(template)}
              onDelete={() => handleDelete(template.templateId)}
            />
          ))}
        </div>
      )}

      {/* ADD MODAL */}
      {isAddModalOpen && (
        <AddContractTemplateModal
          onClose={() => {
            setIsAddModalOpen(false);
            fetchTemplates();
          }}
        />
      )}

      {/* DETAIL MODAL */}
      {selectedTemplate && (
        <ContractTemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}

function TemplateCard({ template, onView, onDelete }) {
  const typeColors = {
    probation: "bg-purple-100 text-purple-700",
    permanent: "bg-emerald-100 text-emerald-700",
    fixed_term: "bg-blue-100 text-blue-700",
    internship: "bg-amber-100 text-amber-700",
    part_time: "bg-slate-100 text-slate-700",
    freelance: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[template.templateType] || "bg-slate-100 text-slate-700"}`}>
            {template.templateType?.replace(/_/g, " ").toUpperCase()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onView}
              className="text-[#4c739a] hover:text-primary"
              title="View Details"
            >
              <span className="material-symbols-outlined text-xl">visibility</span>
            </button>
            <button
              onClick={onDelete}
              className="text-red-400 hover:text-red-600"
              title="Delete"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>
        </div>
        <h3 className="text-lg font-bold text-[#0d141b] mb-2">{template.templateName}</h3>
        <p className="text-sm text-slate-500 line-clamp-2">
          {template.templateContent || "No content"}
        </p>
      </div>
      <div className="px-6 py-4 bg-slate-50 border-t flex justify-between items-center text-xs text-slate-500">
        <span>Status: {template.isActive ? "Active" : "Inactive"}</span>
        <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
