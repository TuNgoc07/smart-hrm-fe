import { useState, useEffect } from 'react';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export default function HistoryTab({ workflow }) {
  const [history, setHistory] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const request = async () => {
      if (!token) {
        return;
      }

      const request = await fetch(`${API_BASE_URL}/api/hradmin/workflows/${workflow.workflowId}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await request.json();
      console.log("workflow history data: ", JSON.stringify(data));
      setHistory(data);
    };
    request();
  }, [workflow.workflowId]);
  return (
    <div className="space-y-6">
      <SectionCard title="Config Change History">
        {history?.length > 0 ? (
          <table className="w-full text-left">
            <thead className="text-xs uppercase text-slate-500 border-b">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Changed By</th>
                <th className="px-4 py-3">Field Changed</th>
                <th className="px-4 py-3">Old Value</th>
                <th className="px-4 py-3">New Value</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history?.map((item) => (
                <tr key={item.historyId}>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.time}</td>
                  <td className="px-4 py-4"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">{item.action}</span></td>
                  <td className="px-4 py-4">{item.changedBy}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{item.fieldChanged}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.oldValue}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.newValue}</td>
                  <td className="px-4 py-4 text-sm text-slate-500">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyDataPlaceholder title="No config change history" description="Config audit entries will appear here when available." />
        )}
      </SectionCard>
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

function EmptyDataPlaceholder({ title, description, actionLabel, compact = false }) {
  return (
    <div className={`rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center ${compact ? "p-6" : "p-10"}`}>
      <h4 className="font-bold">{title}</h4>
      <p className="text-sm text-slate-500 mt-2">{description}</p>
      {actionLabel ? <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold">{actionLabel}</button> : null}
    </div>
  );
}