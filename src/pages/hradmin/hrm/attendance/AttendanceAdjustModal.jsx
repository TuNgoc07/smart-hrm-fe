import { useState, useMemo } from "react";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080").replace(/\/$/, "");

function toHHMM(timeStr) {
  if (!timeStr) return "";
  return timeStr.substring(0, 5);
}

function toMin(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function fmtMin(minutes) {
  if (minutes == null || minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m > 0 ? m + "m" : ""}`.trim() : `${m}m`;
}

export default function AttendanceAdjustModal({ data, onClose, onSaved }) {
  const recordInfo   = data.recordInfo;
  const employeeInfo = data.employeeInfo;

  const shiftStart = toHHMM(recordInfo.shiftStart) || "08:00";
  const shiftEnd   = toHHMM(recordInfo.shiftEnd)   || "17:30";

  const [action,    setAction]    = useState("manual");
  const [checkin,   setCheckin]   = useState(toHHMM(recordInfo.checkin)  || "08:30");
  const [checkout,  setCheckout]  = useState(toHHMM(recordInfo.checkout) || "17:30");
  const [reason,    setReason]    = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]     = useState(null);

  const shiftStartMin = toMin(shiftStart);
  const shiftEndMin   = toMin(shiftEnd);

  const LATE_THRESHOLD = 15;
  const originalLateMin = recordInfo.lateMinutes ?? 0;

  const preview = useMemo(() => {
    if (action !== "manual") return null;
    const ciMin = toMin(checkin);
    const coMin = toMin(checkout);
    if (ciMin == null && coMin == null) return null;

    const lateMin  = ciMin != null ? Math.max(0, ciMin - shiftStartMin) : null;
    const otMin    = coMin != null && coMin > shiftEndMin ? coMin - shiftEndMin : null;
    const earlyMin = coMin != null && coMin < shiftEndMin ? shiftEndMin - coMin : null;
    const workMin  = ciMin != null && coMin != null ? Math.max(0, coMin - ciMin - 90) : null;

    // Exception impact
    let exceptionNote = null;
    if (lateMin != null && lateMin > LATE_THRESHOLD) {
      if (originalLateMin <= LATE_THRESHOLD) {
        exceptionNote = { type: "create", msg: `Sẽ tạo exception LATE_ARRIVAL (đi trễ ${lateMin} phút)` };
      }
      // else: đã có exception rồi, không cần thêm note
    } else if (lateMin != null && lateMin <= LATE_THRESHOLD && originalLateMin > LATE_THRESHOLD) {
      exceptionNote = { type: "resolve", msg: `Exception LATE_ARRIVAL hiện tại sẽ được tự động đóng` };
    }

    return { lateMin, otMin, earlyMin, workMin, exceptionNote };
  }, [action, checkin, checkout, shiftStartMin, shiftEndMin, originalLateMin]);

  const handleSubmit = async () => {
    if (!confirmed) { setError("Vui lòng xác nhận trước khi lưu."); return; }
    if (action === "manual" && !checkin && !checkout) { setError("Vui lòng nhập ít nhất giờ check-in hoặc check-out."); return; }
    if (!reason.trim()) { setError("Vui lòng nhập lý do điều chỉnh."); return; }

    setSubmitting(true);
    setError(null);

    const payload = {
      recordId:   recordInfo.recordId,
      action,
      checkin:    action === "manual" && checkin ? `${checkin}:00` : null,
      checkout:   action === "manual" && checkout ? `${checkout}:00` : null,
      reason,
      adjustedBy: Number(localStorage.getItem("employeeId")) || null,
    };

    try {
      const res = await fetch(`${API_BASE}/api/hradmin/attendance/adjust`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          Authorization:   `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message || "Có lỗi xảy ra. Vui lòng thử lại."); return; }
      onSaved?.();
    } catch {
      setError("Không thể kết nối hệ thống. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-[720px] rounded-xl shadow-2xl overflow-hidden border">

        {/* HEADER */}
        <div className="px-8 py-5 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Attendance Adjustment</h2>
            <p className="text-sm text-slate-500">
              {employeeInfo.employeeName} • {recordInfo.attendanceDate}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* BODY */}
        <div className="p-8 space-y-7 max-h-[70vh] overflow-y-auto">

          {/* EMPLOYEE INFO */}
          <Section title="Employee Information">
            <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border">
              <Info label="Name"       value={employeeInfo.employeeName} />
              <Info label="Code"       value={"#EMP" + employeeInfo.employeeId} />
              <Info label="Department" value={employeeInfo.departmentName || "—"} />
              <Info label="Ca làm"     value={`${shiftStart} – ${shiftEnd}`} />
            </div>
          </Section>

          {/* ORIGINAL DATA */}
          <Section title="Dữ liệu hệ thống hiện tại">
            <div className="flex gap-4">
              <SystemBox icon="login"    label="Check-in"  value={recordInfo.checkin  || "-- (Missing)"} color="primary" />
              <SystemBox icon="logout"   label="Check-out" value={recordInfo.checkout || "-- (Missing)"} color="red" />
              <SystemBox icon="schedule" label="Work Time"  value={recordInfo.workHours || "—"} color="slate" />
              <SystemBox icon="warning"  label="Status"     value={(recordInfo.status || "—").toUpperCase()} color="amber" />
            </div>
          </Section>

          {/* ACTION */}
          <Section title="Loại điều chỉnh">
            <div className="grid grid-cols-3 gap-3">
              <Radio checked={action === "manual"} onChange={() => setAction("manual")} label="Manual Time Adjustment" active={action === "manual"} />
              <Radio checked={action === "leave"}  onChange={() => setAction("leave")}  label="Mark as Leave"          active={action === "leave"} />
              <Radio checked={action === "absent"} onChange={() => setAction("absent")} label="Mark as Absent"         active={action === "absent"} />
            </div>
          </Section>

          {/* TIME INPUTS — chỉ hiện khi manual */}
          {action === "manual" && (
            <Section title="Giờ điều chỉnh">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    Check-in
                  </label>
                  <input
                    type="time"
                    value={checkin}
                    onChange={e => setCheckin(e.target.value)}
                    className="w-full rounded-lg border p-2.5 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">
                    Check-out
                  </label>
                  <input
                    type="time"
                    value={checkout}
                    onChange={e => setCheckout(e.target.value)}
                    className="w-full rounded-lg border p-2.5 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </Section>
          )}

          {/* LIVE PREVIEW */}
          {action === "manual" && preview && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase text-blue-500 mb-3 tracking-wider">
                Preview — Kết quả sẽ được lưu
              </p>
              <div className="grid grid-cols-4 gap-4">
                <PreviewItem
                  label="Work Duration"
                  value={fmtMin(preview.workMin)}
                  color="blue"
                />
                <PreviewItem
                  label="Late Minutes"
                  value={preview.lateMin > 0 ? fmtMin(preview.lateMin) : "On-time"}
                  color={preview.lateMin > 0 ? "amber" : "green"}
                />
                <PreviewItem
                  label="OT Minutes"
                  value={preview.otMin > 0 ? fmtMin(preview.otMin) : "—"}
                  color={preview.otMin > 0 ? "indigo" : "slate"}
                />
                <PreviewItem
                  label="Early Leave"
                  value={preview.earlyMin > 0 ? fmtMin(preview.earlyMin) : "—"}
                  color={preview.earlyMin > 0 ? "rose" : "slate"}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-3">* Work duration đã trừ 90 phút nghỉ trưa</p>

              {preview.exceptionNote && (
                <div className={`mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                  preview.exceptionNote.type === "create"
                    ? "bg-amber-50 border border-amber-200 text-amber-700"
                    : "bg-emerald-50 border border-emerald-200 text-emerald-700"
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {preview.exceptionNote.type === "create" ? "warning" : "check_circle"}
                  </span>
                  {preview.exceptionNote.msg}
                </div>
              )}
            </div>
          )}

          {/* LEAVE / ABSENT notice */}
          {action === "leave" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
              <span className="material-symbols-outlined text-blue-500">beach_access</span>
              <p className="text-sm text-blue-800">
                Trạng thái sẽ được đổi thành <strong>Leave</strong>. Checkin/checkout và tất cả dữ liệu giờ làm sẽ bị xóa.
              </p>
            </div>
          )}
          {action === "absent" && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3">
              <span className="material-symbols-outlined text-rose-500">person_off</span>
              <p className="text-sm text-rose-800">
                Trạng thái sẽ được đổi thành <strong>Absent</strong>. Dữ liệu OT và work duration sẽ bị reset về 0.
              </p>
            </div>
          )}

          {/* REASON */}
          <Section>
            <label className="block text-sm font-bold mb-2">
              Lý do điều chỉnh <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setError(null); }}
              className="w-full h-24 rounded-lg border p-3 text-sm focus:ring-primary focus:border-primary"
              placeholder="Ví dụ: Nhân viên quên chấm công, lỗi hệ thống..."
            />
          </Section>

          {/* CONFIRM */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={e => { setConfirmed(e.target.checked); setError(null); }}
              className="mt-1 rounded text-primary"
            />
            <div>
              <p className="font-bold text-sm">Tôi xác nhận điều chỉnh này là chính xác</p>
              <p className="text-xs text-slate-500">Dữ liệu sẽ được dùng cho tính lương & audit</p>
            </div>
          </label>

          {/* ERROR */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 bg-slate-50 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border text-slate-500 font-bold text-sm hover:bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${
              submitting
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-primary text-white hover:bg-blue-600"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {submitting ? "autorenew" : "save"}
            </span>
            {submitting ? "Đang lưu..." : "Save Adjustment"}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function Section({ title, children }) {
  return (
    <section>
      {title && (
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase text-slate-500 font-bold">
        {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}

function SystemBox({ icon, label, value, color }) {
  const colors = {
    primary: "text-primary",
    red:     "text-red-500",
    amber:   "text-amber-500",
    slate:   "text-slate-500",
  };

  return (
    <div className="flex-1 p-3 border rounded-lg flex items-center gap-3">
      <span className={`material-symbols-outlined ${colors[color]}`}>
        {icon}
      </span>
      <div>
        <p className="text-[10px] uppercase text-slate-500 font-bold">
          {label}
        </p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>
  );
}

function Radio({ label, checked, onChange, active }) {
  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${checked || active
        ? "border-primary bg-primary/5"
        : "hover:bg-slate-50"
        }`}
    >
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="text-primary"
      />
      <span className="text-sm font-semibold">{label}</span>
    </label>
  );
}

function PreviewItem({ label, value, color }) {
  const c = {
    blue:   "text-blue-700",
    amber:  "text-amber-600",
    green:  "text-emerald-600",
    indigo: "text-indigo-700",
    rose:   "text-rose-600",
    slate:  "text-slate-400",
  }[color] || "text-slate-700";
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">{label}</p>
      <p className={`text-sm font-bold ${c}`}>{value}</p>
    </div>
  );
}
