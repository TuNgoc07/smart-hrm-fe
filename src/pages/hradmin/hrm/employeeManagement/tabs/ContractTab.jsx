import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import NewContractModal from "../NewContractModal";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function ContractTab() {
  const { emp_id } = useParams();
  const [contractsInfo, setContractsInfo] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchContracts = async () => {
    const res = await fetch(`${API_BASE_URL}/api/hradmin/contracts/employee/${emp_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    const data = await res.json()
    if (data.status === 'success') {
      setContractsInfo(data.data)
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [emp_id]);

  const handleTerminate = async (contractId) => {
    if (!window.confirm('Are you sure you want to terminate this contract? This will expire the compensation plan and set the employee to inactive.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/hradmin/contracts/${contractId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchContracts();
      } else {
        alert(data.message || 'Failed to terminate contract');
      }
    } catch (e) {
      console.error(e);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* ===== WARNING BANNER ===== */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
        <span className="material-symbols-outlined text-amber-600">
          warning
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold text-amber-800">
            Contract Expiring Soon
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            The current contract (CT-10293) is set to expire in 15 days on
            October 31, 2024. Please review and process an extension or
            transition.
          </p>
        </div>
        <button className="text-amber-700 hover:bg-amber-100 p-1 rounded">
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* ===== CONTRACT OVERVIEW ===== */}
      <Card title="Contract Overview" icon="description">
        <div className="flex flex-wrap gap-x-12 gap-y-6">
          <OverviewItem
            label="Employment Status"
            value={(contractsInfo[0]?.employmentStatus || "").replace(/_/g, " ")
              .replace(/\b\w/g, c => c.toUpperCase())}
            badge="Valid"
          />

          <OverviewItem
            label="Latest Contract ID"
            value={"CT - 0" + contractsInfo[0]?.contractId || ""}
          />

          <OverviewItem
            label="Effective Date"
            value={contractsInfo[0]?.startDate || ""}
          />

          <OverviewItem
            label="Salary Tier"
            value={contractsInfo[0]?.salaryTier || ""}
          />
        </div>
      </Card>

      {/* ===== CONTRACT HISTORY ===== */}
      <Card
        title="Contract History"
        icon="history"
        action={
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-[16px]">
              add
            </span>
            Add Contract
          </button>
        }
        noPadding
      >
        <ContractTable contracts={contractsInfo} onTerminate={handleTerminate} />
      </Card>

      <NewContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeId={emp_id}
        onSuccess={fetchContracts}
      />
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function Card({ title, icon, action, children, noPadding }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            {icon}
          </span>
          {title}
        </h3>
        {action}
      </div>
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}

function OverviewItem({ label, value, badge }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-500 mb-1">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-lg font-extrabold">{value}</span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function ContractTable({ contracts, onTerminate }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase font-bold">
            <th className="px-6 py-3 border-b text-left">Contract Type</th>
            <th className="px-6 py-3 border-b">Start Date</th>
            <th className="px-6 py-3 border-b">End Date</th>
            <th className="px-6 py-3 border-b">Status</th>
            <th className="px-6 py-3 border-b text-center">Document</th>
            <th className="px-6 py-3 border-b text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {contracts.map((contract) =>
            contract.contractStatus === 'active'
              ? <ActiveRow key={contract.contractId} contract={contract} onTerminate={() => onTerminate(contract.contractId)} />
              : <ExpiredRow key={contract.contractId} contract={contract} />
          )}




        </tbody>
      </table>
    </div>
  );
}

function Status({ active }) {
  return (
    <span
      className={`flex items-center gap-1.5 font-bold ${active ? "text-blue-600" : "text-slate-500"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-blue-600" : "bg-slate-300"
          }`}
      />
      {active ? "Active" : "Expired"}
    </span>
  );
}

function PdfButton() {
  return (
    <button className="text-red-500 hover:text-red-600">
      <span className="material-symbols-outlined">
        picture_as_pdf
      </span>
    </button>
  );
}

function ActionButtons({ active, onTerminate }) {
  return (
    <div className="flex justify-end gap-2">
      <button className="text-slate-500 hover:text-primary text-xs font-bold px-2 py-1 rounded">
        View
      </button>
      {active && (
        <>
          <button className="text-primary border border-primary/20 hover:bg-primary/10 text-xs font-bold px-2 py-1 rounded">
            Extend
          </button>
          <button
            className="text-red-500 hover:bg-red-50 text-xs font-bold px-2 py-1 rounded"
            onClick={onTerminate}
          >
            End
          </button>
        </>
      )}
    </div>
  );
}

function ExpiredRow({ contract }) {
  return (
    <tr className="border-t hover:bg-slate-50">
      <td className="px-6 py-4 font-bold">{contract.contractType}</td>
      <td className="px-6 py-4 text-slate-500">{contract.startDate}</td>
      <td className="px-6 py-4 text-slate-500">{contract.endDate || "-"}</td>
      <td className="px-6 py-4">
        <Status active={contract.contractStatus === 'active'} />
      </td>
      <td className="px-6 py-4 text-center">
        <PdfButton />
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-slate-500 hover:text-primary text-xs font-bold px-2 py-1 rounded">
          View
        </button>
      </td>
    </tr>
  );
}

function ActiveRow({ contract, onTerminate }) {
  return (
    <tr className="bg-blue-50/50 border-l-4 border-primary">
      <td className="px-6 py-4 font-bold">{contract.contractType}</td>
      <td className="px-6 py-4 text-slate-500">{contract.startDate}</td>
      <td className="px-6 py-4 text-slate-500 text-center">{contract.endDate || "-"}</td>
      <td className="px-6 py-4">
        <Status active={contract.contractStatus === 'active'} />
      </td>
      <td className="px-6 py-4 text-center">
        <PdfButton />
      </td>
      <td className="px-6 py-4 text-right">
        <ActionButtons active onTerminate={onTerminate} />
      </td>
    </tr>
  );
}
