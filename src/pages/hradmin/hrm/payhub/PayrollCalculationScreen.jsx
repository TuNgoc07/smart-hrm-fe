/**
 * PayrollCalculationScreen.jsx
 *
 * Màn hình chính điều phối quy trình đóng lương — 2-gate protection:
 *
 * Pipeline:
 *  1. Load danh sách payroll cycles → GET /api/hradmin/payroll-cycles
 *  2. Chọn cycle → load gate status → GET /api/hradmin/payroll-cycles/{id}/gate-status
 *     Response: { pendingRequestCount, pendingExceptionCount, canCloseAttendance, canRunPayroll, blockers }
 *
 *  Gate 1 — Close Attendance:
 *   - Button disabled nếu canCloseAttendance = false
 *   - Hiển thị blockers: còn N request / M exception chưa giải quyết
 *   - POST /api/hradmin/payroll-cycles/{id}/close-attendance
 *   - 409 → hiển thị error detail; 200 → refresh status
 *
 *  Gate 2 — Run Payroll:
 *   - Button disabled nếu canRunPayroll = false (attendance chưa closed)
 *   - POST /api/hradmin/payroll-cycles/{id}/run-payroll
 *   - 409 → hiển thị "đóng attendance trước"; 200 → hiển thị success
 */
import { useState, useEffect, useCallback } from "react";

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

/* ── Status config ─────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  open:                { label: "Open", color: "bg-amber-100 text-amber-700 border-amber-200" },
  attendance_closed:   { label: "Attendance Closed", color: "bg-blue-100 text-blue-700 border-blue-200" },
  payroll_processing:  { label: "Processing…", color: "bg-violet-100 text-violet-700 border-violet-200" },
  completed:           { label: "Completed", color: "bg-green-100 text-green-700 border-green-200" },
  locked:              { label: "Locked", color: "bg-red-100 text-red-700 border-red-200" },
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";
const statusCfg = (s) => STATUS_CONFIG[s?.toLowerCase()] || { label: s, color: "bg-slate-100 text-slate-600" };

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function PayrollCalculationScreen() {
  const [cycles, setCycles]         = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [gate, setGate]             = useState(null);  // gate status của cycle đang chọn
  const [loadingList, setLoadingList]   = useState(true);
  const [loadingGate, setLoadingGate]   = useState(false);
  const [actionLoading, setActionLoading] = useState("");  // "close" | "run" | "lock" | ""
  const [toast, setToast]           = useState(null);    // { type: "success"|"error", msg }
  const [createOpen, setCreateOpen] = useState(false);

  /* ── 1. Load cycle list ─────────────────────────────────────────────────── */
  const loadCycles = useCallback(async () => {
    setLoadingList(true);
    try {
      const res  = await fetch(`${API}/api/hradmin/payroll-cycles`, { headers: authH() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      setCycles(list);
      if (list.length > 0 && !selectedId) setSelectedId(list[0].cycleId);
    } finally {
      setLoadingList(false);
    }
  }, [selectedId]);

  /* ── 2. Load gate status khi chọn cycle ────────────────────────────────── */
  const loadGate = useCallback(async (id) => {
    if (!id) return;
    setLoadingGate(true);
    try {
      const res  = await fetch(`${API}/api/hradmin/payroll-cycles/${id}/gate-status`, { headers: authH() });
      const data = await res.json();
      setGate(data);
    } finally {
      setLoadingGate(false);
    }
  }, []);

  useEffect(() => { loadCycles(); }, []);
  useEffect(() => { if (selectedId) loadGate(selectedId); }, [selectedId]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 6000);
  };

  /* ── Gate 1: Close Attendance ───────────────────────────────────────────── */
  const handleCloseAttendance = async () => {
    setActionLoading("close");
    try {
      const res  = await fetch(`${API}/api/hradmin/payroll-cycles/${selectedId}/close-attendance`, {
        method: "POST", headers: authH(),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        showToast("success", "✅ Attendance đã được đóng. Có thể run payroll.");
        await loadCycles();
        await loadGate(selectedId);
      } else {
        showToast("error", data.message || "Không thể đóng attendance.");
      }
    } catch (e) {
      showToast("error", "Lỗi kết nối: " + e.message);
    } finally {
      setActionLoading("");
    }
  };

  /* ── Gate 2: Run Payroll ────────────────────────────────────────────────── */
  const handleRunPayroll = async () => {
    setActionLoading("run");
    try {
      const res  = await fetch(`${API}/api/hradmin/payroll-cycles/${selectedId}/run-payroll`, {
        method: "POST", headers: authH(),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        showToast("success", "✅ Payroll đã được tính toán thành công!");
        await loadCycles();
        await loadGate(selectedId);
      } else {
        showToast("error", data.message || "Không thể run payroll.");
      }
    } catch (e) {
      showToast("error", "Lỗi kết nối: " + e.message);
    } finally {
      setActionLoading("");
    }
  };

  /* ── Gate 3: Lock Payroll Period ───────────────────────────────────────── */
  const handleLockPayroll = async () => {
    if (!confirm("Bạn có chắc chắn muốn lock payroll period này không? Sau khi lock, không thể sửa đổi payroll results nữa.")) {
      return;
    }

    setActionLoading("lock");
    try {
      const res  = await fetch(`${API}/api/hradmin/payroll-cycles/${selectedId}/lock`, {
        method: "POST", headers: authH(),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        showToast("success", "✅ Payroll period đã được lock thành công!");
        await loadCycles();
        await loadGate(selectedId);
      } else {
        showToast("error", data.message || "Không thể lock payroll period.");
      }
    } catch (e) {
      showToast("error", "Lỗi kết nối: " + e.message);
    } finally {
      setActionLoading("");
    }
  };

  const selected = cycles.find((c) => c.cycleId === selectedId);

  return (
    <div className="space-y-6 w-full">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Payroll</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="font-bold text-slate-800">Calculation</span>
          </div>
          <h1 className="text-2xl font-black">Payroll Calculation</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Quản lý và kiểm soát quy trình tính lương theo 2-gate protection
          </p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 shadow shadow-primary/20">
          <span className="material-symbols-outlined text-base">add</span>
          Tạo Cycle mới
        </button>
      </div>

      {/* ── Pipeline steps ───────────────────────────────────────────────── */}
      <PipelineSteps status={selected?.status} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* ── Cycle list ───────────────────────────────────────────────── */}
        <section className="xl:col-span-4 bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
            <span className="font-bold text-sm">Payroll Cycles</span>
            <span className="text-xs text-slate-400">{cycles.length} cycles</span>
          </div>
          {loadingList ? (
            <div className="p-8 text-center text-slate-400 text-sm">Đang tải...</div>
          ) : cycles.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Chưa có cycle. Tạo mới để bắt đầu.</div>
          ) : (
            <div className="divide-y">
              {cycles.map((c) => {
                const cfg = statusCfg(c.status);
                return (
                  <button key={c.cycleId} onClick={() => setSelectedId(c.cycleId)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${selectedId === c.cycleId ? "bg-primary/5 border-l-4 border-primary" : ""}`}>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-sm text-slate-800">{c.cycleName || `Cycle #${c.cycleId}`}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{fmt(c.startDate)} → {fmt(c.endDate)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Gate Panel ───────────────────────────────────────────────── */}
        <section className="xl:col-span-8 space-y-5">
          {!selected ? (
            <div className="bg-white rounded-xl border p-10 text-center text-slate-400">
              Chọn một payroll cycle để xem trạng thái gate
            </div>
          ) : loadingGate ? (
            <div className="bg-white rounded-xl border p-10 text-center text-slate-400">Đang load gate status...</div>
          ) : (
            <>
              {/* Cycle info header */}
              <div className="bg-white rounded-xl border p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-black text-lg">{selected.cycleName || `Cycle #${selected.cycleId}`}</h2>
                  <p className="text-slate-500 text-sm">{fmt(selected.startDate)} → {fmt(selected.endDate)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusCfg(selected.status).color}`}>
                  {statusCfg(selected.status).label}
                </span>
              </div>

              {/* ── Gate 1: Close Attendance ─────────────────────────── */}
              <GateCard
                step="01"
                title="Đóng Attendance"
                subtitle="Yêu cầu: Không còn pending requests (OT/Leave/Adjustment) và exceptions trong period"
                passed={selected.status !== "open"}
                can={gate?.canCloseAttendance}
                blockers={gate?.blockers || []}
                stats={[
                  { icon: "pending_actions", label: "Pending Requests", value: gate?.pendingRequestCount ?? "—", danger: gate?.pendingRequestCount > 0 },
                  { icon: "report_problem", label: "Pending Exceptions", value: gate?.pendingExceptionCount ?? "—", danger: gate?.pendingExceptionCount > 0 },
                ]}
                actionLabel="Đóng Attendance"
                actionIcon="lock"
                loading={actionLoading === "close"}
                onClick={handleCloseAttendance}
                completedAt={selected.status !== "open" ? selected.updatedAt : null}
              />

              {/* ── Gate 2: Run Payroll ──────────────────────────────── */}
              <GateCard
                step="02"
                title="Run Payroll"
                subtitle="Yêu cầu: Attendance phải được đóng (Gate 1 phải pass)"
                passed={selected.status === "completed" || selected.status === "locked"}
                can={gate?.canRunPayroll}
                blockers={gate?.canRunPayroll ? [] : ["Attendance chưa được đóng — hoàn thành Gate 1 trước"]}
                stats={[
                  {
                    icon: "lock",
                    label: "Attendance Status",
                    value: selected.status === "attendance_closed" || selected.status === "completed" || selected.status === "locked" ? "Đã đóng" : "Chưa đóng",
                    danger: selected.status === "open",
                  },
                ]}
                actionLabel="Run Payroll"
                actionIcon="play_circle"
                actionColor="bg-green-600 hover:bg-green-700"
                loading={actionLoading === "run"}
                onClick={handleRunPayroll}
                completedAt={selected.status === "completed" || selected.status === "locked" ? selected.updatedAt : null}
              />

              {/* ── Gate 3: Lock Payroll Period ──────────────────────────────── */}
              <GateCard
                step="03"
                title="Lock Payroll Period"
                subtitle="Yêu cầu: Payroll phải được completed (Gate 2 phải pass). Sau khi lock, không thể sửa đổi payroll results nữa."
                passed={selected.status === "locked"}
                can={selected.status === "completed" && !selected.locked}
                blockers={selected.status !== "completed" ? ["Payroll chưa completed — hoàn thành Gate 2 trước"] : (selected.locked ? ["Payroll period đã được lock"] : [])}
                stats={[
                  {
                    icon: "lock",
                    label: "Lock Status",
                    value: selected.locked ? "Locked" : "Not Locked",
                    danger: false,
                  },
                  selected.locked && {
                    icon: "person",
                    label: "Locked By",
                    value: selected.lockedBy || "—",
                    danger: false,
                  },
                ].filter(Boolean)}
                actionLabel="Lock Payroll Period"
                actionIcon="lock"
                actionColor="bg-red-600 hover:bg-red-700"
                loading={actionLoading === "lock"}
                onClick={handleLockPayroll}
                completedAt={selected.locked ? selected.lockedAt : null}
              />
            </>
          )}
        </section>
      </div>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
      {toast && <Toast type={toast.type} msg={toast.msg} onClose={() => setToast(null)} />}

      {/* ── Create Cycle Modal ───────────────────────────────────────────── */}
      {createOpen && (
        <CreateCycleModal
          onClose={() => setCreateOpen(false)}
          onCreated={async (id) => {
            setCreateOpen(false);
            await loadCycles();
            setSelectedId(id);
          }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* Pipeline progress bar                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
function PipelineSteps({ status }) {
  const steps = [
    { key: "open",               label: "Period Open" },
    { key: "gate1",              label: "Gate 1: Close Attendance" },
    { key: "attendance_closed",  label: "Attendance Closed" },
    { key: "gate2",              label: "Gate 2: Run Payroll" },
    { key: "completed",          label: "Completed" },
    { key: "gate3",              label: "Gate 3: Lock" },
    { key: "locked",             label: "Locked" },
  ];
  const activeIdx = status === "open" ? 0
    : status === "attendance_closed" ? 2
    : status === "payroll_processing" ? 3
    : status === "completed" ? 4
    : status === "locked" ? 6
    : 0;

  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center flex-1">
          <div className={`flex-1 flex flex-col items-center gap-1`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
              i <= activeIdx ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-400"
            }`}>
              {i <= activeIdx
                ? <span className="material-symbols-outlined text-[14px]">check</span>
                : i + 1}
            </div>
            <p className={`text-[10px] text-center leading-tight max-w-[80px] ${i <= activeIdx ? "text-primary font-bold" : "text-slate-400"}`}>
              {s.label}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 ${i < activeIdx ? "bg-primary" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* Gate Card component                                                         */
/* ═══════════════════════════════════════════════════════════════════════════ */
function GateCard({ step, title, subtitle, passed, can, blockers, stats, actionLabel, actionIcon,
                    actionColor = "bg-primary hover:bg-primary/90", loading, onClick, completedAt }) {
  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all ${passed ? "border-green-200" : can ? "border-primary/30" : "border-slate-200"}`}>
      {/* Header */}
      <div className={`px-5 py-4 flex items-center gap-4 ${passed ? "bg-green-50" : can ? "bg-primary/5" : "bg-slate-50"}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
          passed ? "bg-green-500 text-white" : can ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
        }`}>
          {passed ? <span className="material-symbols-outlined text-[18px]">check</span> : step}
        </div>
        <div className="flex-1">
          <h3 className="font-black text-base">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {passed && completedAt && (
          <p className="text-xs text-green-600 font-bold">✅ Hoàn thành {new Date(completedAt).toLocaleDateString("vi-VN")}</p>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className={`rounded-lg border p-3 flex items-center gap-3 ${s.danger ? "border-red-200 bg-red-50" : "border-slate-100 bg-slate-50"}`}>
              <span className={`material-symbols-outlined text-[20px] ${s.danger ? "text-red-500" : "text-slate-400"}`}>{s.icon}</span>
              <div>
                <p className="text-[10px] uppercase text-slate-500">{s.label}</p>
                <p className={`text-xl font-black leading-tight ${s.danger ? "text-red-600" : "text-slate-800"}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Blockers */}
        {!passed && blockers.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
            <p className="text-xs font-bold text-red-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">block</span>
              Blocker — cần xử lý trước:
            </p>
            {blockers.map((b, i) => (
              <p key={i} className="text-xs text-red-600 pl-4">• {b}</p>
            ))}
          </div>
        )}

        {/* Action button */}
        {!passed && (
          <div className="flex justify-end">
            <button
              onClick={onClick}
              disabled={!can || loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white text-sm font-bold transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${actionColor}`}
            >
              {loading
                ? <><span className="material-symbols-outlined text-base animate-spin">autorenew</span> Đang xử lý...</>
                : <><span className="material-symbols-outlined text-base">{actionIcon}</span> {actionLabel}</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* Toast                                                                       */
/* ═══════════════════════════════════════════════════════════════════════════ */
function Toast({ type, msg, onClose }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 max-w-md rounded-xl shadow-xl p-4 flex items-start gap-3 border ${
      type === "success" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
    }`}>
      <span className="material-symbols-outlined text-[20px] flex-shrink-0">
        {type === "success" ? "check_circle" : "error"}
      </span>
      <p className="text-sm flex-1 whitespace-pre-line">{msg}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* Create Cycle Modal                                                          */
/* ═══════════════════════════════════════════════════════════════════════════ */
function CreateCycleModal({ onClose, onCreated }) {
  const now   = new Date();
  const y     = now.getFullYear();
  const m     = String(now.getMonth() + 1).padStart(2, "0");
  const [form, setForm]     = useState({
    cycleName: `Payroll ${m}/${y}`,
    startDate: `${y}-${m}-01`,
    endDate:   `${y}-${m}-${new Date(y, now.getMonth() + 1, 0).getDate()}`,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr]       = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      const res  = await fetch(`${API}/api/hradmin/payroll-cycles`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authH() },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated(data.cycleId);
      } else {
        setErr(data.message || "Tạo cycle thất bại");
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-bold">Tạo Payroll Cycle mới</h2>
          <button onClick={onClose}><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          {err && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{err}</p>}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tên cycle *</label>
            <input required value={form.cycleName} onChange={(e) => setForm({ ...form, cycleName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Từ ngày *</label>
            <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Đến ngày *</label>
            <input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border text-slate-600 text-sm font-bold hover:bg-slate-50">Hủy</button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50">
              {saving ? "Đang tạo..." : "Tạo cycle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
