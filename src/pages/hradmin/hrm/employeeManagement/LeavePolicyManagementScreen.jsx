import React, { useState, useEffect } from "react";
import LeavePolicyConfigModal from "./LeavePolicyConfigModal";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function LeavePolicyManagementScreen() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Fetch danh sách tất cả leave policies khi component mount
  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/hradmin/leave-policies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === "success" && data.data) {
        setPolicies(data.data);
      }
    } catch (err) {
      console.error("Error fetching leave policies:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mở modal tạo policy mới
  const handleAddPolicy = () => {
    setSelectedPolicy(null);
    setShowModal(true);
  };

  // Mở modal edit policy
  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setShowModal(true);
  };

  // Xóa policy (soft delete)
  const handleDeletePolicy = async (policyId) => {
    if (!confirm("Are you sure you want to deactivate this leave policy?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/hradmin/leave-policies/${policyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPolicies(); // reload danh sách sau khi xóa
      }
    } catch (err) {
      console.error("Error deleting leave policy:", err);
    }
  };

  // Callback khi modal save thành công
  const handleModalSuccess = () => {
    setShowModal(false);
    setSelectedPolicy(null);
    fetchPolicies();
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Leave Policy Management</h2>
        <button
          onClick={handleAddPolicy}
          className="px-4 py-2 bg-primary text-white rounded-lg font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Leave Policy
        </button>
      </div>

      {/* Policies Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Policy Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Code</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-slate-500">Leave Type</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase text-slate-500">Days/Year</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase text-slate-500">Max Carry-Over</th>
                <th className="px-6 py-3 text-center text-xs font-bold uppercase text-slate-500">Paid</th>
                <th className="px-6 py-3 text-center text-xs font-bold uppercase text-slate-500">Status</th>
                <th className="px-6 py-3 text-center text-xs font-bold uppercase text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : policies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">No leave policies found</td>
                </tr>
              ) : (
                policies.map((policy) => (
                  <tr key={policy.policyId} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium">{policy.policyName}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">{policy.policyCode}</span>
                    </td>
                    <td className="px-6 py-4">{policy.leaveType}</td>
                    <td className="px-6 py-4 text-right">{policy.daysPerYear}</td>
                    <td className="px-6 py-4 text-right">
                      {/* Hiển thị maxCarryOverDays: null = unlimited */}
                      {policy.maxCarryOverDays != null ? (
                        <span className="text-teal-600 font-medium">{policy.maxCarryOverDays}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unlimited</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {policy.isPaid === 1 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Yes</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {policy.isActive === 1 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Active</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditPolicy(policy)}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded transition-colors"
                          title="Edit policy"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        {policy.isActive === 1 && (
                          <button
                            onClick={() => handleDeletePolicy(policy.policyId)}
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Deactivate policy"
                          >
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Policy Config Modal */}
      {showModal && (
        <LeavePolicyConfigModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedPolicy(null);
          }}
          policyData={selectedPolicy}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}
