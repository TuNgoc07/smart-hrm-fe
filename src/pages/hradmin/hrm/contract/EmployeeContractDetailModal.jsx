import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function EmployeeContractDetailModal({ contract, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resolveStatus = (c) => {
    if (c.contractStatus === "expired" || c.contractStatus === "terminated") return c.contractStatus;
    if (c.endDate && new Date(c.endDate) < new Date()) return "expired";
    return c.contractStatus || "active";
  };

  const statusColors = {
    active: "bg-emerald-100 text-emerald-700",
    expired: "bg-red-100 text-red-700",
    terminated: "bg-slate-100 text-slate-700",
  };

  if (!contract) return null;

  const status = resolveStatus(contract);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-[800px] rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e7edf3] sticky top-0 bg-white z-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-[#0d141b]">
            <span className="material-symbols-outlined text-primary">description</span>
            Contract Details
          </h2>
          <button onClick={onClose} className="text-[#4c739a] hover:text-[#0d141b]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* EMPLOYEE INFO */}
          <div className="bg-slate-50 rounded-lg p-4 border">
            <h3 className="text-sm font-bold text-[#4c739a] uppercase tracking-wider mb-3">Employee Information</h3>
            <div className="flex items-center gap-4">
              <img
                src={contract.avatar || contract.employeeInfo?.avatar || "https://via.placeholder.com/40"}
                alt="Avatar"
                className="w-16 h-16 rounded-full border-2 border-white"
              />
              <div>
                <p className="text-lg font-bold text-[#0d141b]">{contract.employeeInfo?.employeeName || "—"}</p>
                <p className="text-sm text-slate-500">{contract.employeeInfo?.employeeCode || "—"}</p>
                <p className="text-sm text-slate-500">{contract.department || "—"}</p>
              </div>
            </div>
          </div>

          {/* CONTRACT DETAILS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Contract ID</p>
              <p className="text-sm font-bold text-[#0d141b]">{contract.contractID || contract.contractCode || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Contract Type</p>
              <p className="text-sm text-[#0d141b]">{contract.contractType || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Template</p>
              <p className="text-sm text-[#0d141b]">{contract.templateName || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[status] || "bg-slate-100 text-slate-700"}`}>
                {status?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Start Date</p>
              <p className="text-sm text-[#0d141b]">{contract.startDate || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">End Date</p>
              <p className="text-sm text-[#0d141b]">{contract.endDate || "Indefinite"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Employment Status</p>
              <p className="text-sm text-[#0d141b]">{contract.employmentStatus?.replace(/_/g, " ") || "—"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Duration</p>
              <p className="text-sm text-[#0d141b]">{contract.duration || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Document URL</p>
              {contract.documentUrl ? (
                <a
                  href={contract.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View Document
                </a>
              ) : (
                <p className="text-sm text-slate-500">No document uploaded</p>
              )}
            </div>
          </div>

          {/* TIMELINE */}
          <div>
            <h3 className="text-sm font-bold text-[#4c739a] uppercase tracking-wider mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0d141b]">Created</p>
                  <p className="text-xs text-slate-500">{contract.createdAt ? new Date(contract.createdAt).toLocaleString() : "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0d141b]">Start Date</p>
                  <p className="text-xs text-slate-500">{contract.startDate || "—"}</p>
                </div>
              </div>
              {contract.endDate && (
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${status === "expired" ? "bg-red-500" : "bg-amber-500"}`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#0d141b]">End Date</p>
                    <p className="text-xs text-slate-500">{contract.endDate}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#0d141b]">Last Updated</p>
                  <p className="text-xs text-slate-500">{contract.updatedAt ? new Date(contract.updatedAt).toLocaleString() : "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-[#e7edf3] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-bold text-[#0d141b] hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
