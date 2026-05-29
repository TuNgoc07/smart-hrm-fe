import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";



export default function ReviewExceptionModal({ data, onClose, onResolved }) {

  const navigate = useNavigate();

  const [action, setAction]         = useState(null);

  const [checkoutTime, setCheckout] = useState("17:30");

  const [comment, setComment]       = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [workHours, setWorkHours]   = useState(null);



  useEffect(() => {

    if (!data?.checkIn || !checkoutTime) { setWorkHours(null); return; }

    const toMin = (t) => {

      const cleaned = t.replace(/\s?(AM|PM)/i, "").trim();

      const [h, m]  = cleaned.split(":").map(Number);

      return h * 60 + m;

    };

    const inMin  = toMin(data.checkIn);

    const outMin = toMin(checkoutTime);

    const worked = Math.max(0, outMin - inMin - 90);

    setWorkHours({ h: Math.floor(worked / 60), m: worked % 60 });

  }, [checkoutTime, data]);



  if (!data) return null;



  const hasExplanation = data.status === "explanation_submitted";

  const isReadOnly          = data.status === "approved" || data.status === "rejected";

  const isAwaiting          = data.status === "pending_employee";

  const isOTType            = data.exceptionType === "MISSING_CHECKOUT_POSSIBLE_OT" || data.exceptionType === "OVERTIME";

  const isMissingCheckout   = data.exceptionType?.includes("MISSING_CHECKOUT");

  const isLeaveOverride     = data.exceptionType === "LEAVE_OVERRIDE_CHECKIN";

  const needsTime      = action === "APPROVE_OT" || action === "MANUAL_CHECKOUT";



  const ACTION_CONFIG = isLeaveOverride

    ? [

        { key: "REVERT_TO_LEAVE", label: "Revert về Leave",      icon: "event_busy",    style: "border-amber-400 bg-amber-50 text-amber-700" },

        { key: "KEEP_PRESENT",    label: "Giữ nguyên Present",   icon: "how_to_reg",    style: "border-emerald-400 bg-emerald-50 text-emerald-700" },

      ]

    : hasExplanation

    ? [

        { key: "APPROVE_REQUEST", label: "Approve explanation",  icon: "check_circle",  style: "border-emerald-400 bg-emerald-50 text-emerald-700" },

        { key: "REJECT_REQUEST",  label: "Reject explanation",   icon: "cancel",        style: "border-rose-400 bg-rose-50 text-rose-700" },

        isMissingCheckout && { key: "MANUAL_CHECKOUT", label: "Nhập checkout thủ công", icon: "edit_calendar", style: "border-primary bg-blue-50 text-primary" },

      ].filter(Boolean)

    : [

        isOTType && { key: "APPROVE_OT",        label: "Xác nhận OT",           icon: "more_time",     style: "border-indigo-400 bg-indigo-50 text-indigo-700" },

        { key: "MANUAL_CHECKOUT",               label: "Nhập checkout thủ công", icon: "edit_calendar", style: "border-primary bg-blue-50 text-primary" },

        { key: "MARK_ABSENT",                   label: "Đánh dấu vắng mặt",     icon: "person_off",    style: "border-rose-400 bg-rose-50 text-rose-700" },

        { key: "REQUEST_SUBMISSION",            label: "Yêu cầu NV giải trình",  icon: "send",          style: "border-amber-400 bg-amber-50 text-amber-700" },

        { key: "REJECT",                        label: "Từ chối exception",      icon: "block",         style: "border-slate-300 bg-slate-50 text-slate-600" },

      ].filter(Boolean);



  const handleSubmit = async () => {

    if (!action) return;

    setSubmitting(true);



    const payload = {

      exceptionId:  data.exceptionId,

      action:       action.toUpperCase(),

      resolvedBy:   localStorage.getItem("employeeId"),

      checkoutTime: needsTime ? `${checkoutTime}:00` : undefined,

      comment:      comment || undefined,

    };



    try {

      const res = await fetch(`${API_BASE}/api/hradmin/attendance-exceptions/resolve`, {

        method:  "POST",

        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },

        body:    JSON.stringify(payload),

      });



      const result = await res.json();



      if (!res.ok) {

        alert(`Lỗi: ${result.message}`);

        return;

      }



      onResolved?.();

    } catch (err) {

      alert("Không thể kết nối hệ thống. Vui lòng thử lại.");

    } finally {

      setSubmitting(false);

    }

  };



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

      <div className="bg-white w-full max-w-[820px] max-h-[92vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border">



        {/* HEADER */}

        <div className="flex items-center justify-between px-6 py-4 border-b">

          <div className="flex items-center gap-3">

            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">

              <span className="material-symbols-outlined text-primary">rule_settings</span>

            </div>

            <div>

              <h2 className="text-lg font-bold">Review Exception</h2>

              <p className="text-xs text-slate-500">{data.name} • {data.date}</p>

            </div>

          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">

            <span className="material-symbols-outlined">close</span>

          </button>

        </div>



        {/* BODY */}

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">



          {/* EMPLOYEE + ATTENDANCE INFO */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border">

              <img src={data?.employeeInfo?.avatar} alt={data?.employeeInfo?.employeeName}

                className="w-14 h-14 rounded-full border-2 border-white shadow object-cover" />

              <div>

                <p className="font-bold text-base">{data?.employeeInfo?.employeeName}</p>

                <p className="text-xs text-slate-500">ID: {data?.employeeInfo?.employeeId} • {data?.employeeInfo?.departmentName || "—"}</p>

                <div className="flex items-center gap-2 mt-2 flex-wrap">

                  <TypeBadge type={data.type} />

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${

                    data.status === "Pending"  ? "bg-amber-100 text-amber-700" :

                    data.status === "Approved" ? "bg-emerald-100 text-emerald-700" :

                    "bg-rose-100 text-rose-700"}`}>

                    {data.status}

                  </span>

                </div>

              </div>

            </div>



            <div className="grid grid-cols-3 gap-3">

              <InfoBox icon="login"    label="Check-in"  value={data.checkIn  || "—"} color={data.checkIn ? "blue" : "red"} />

              <InfoBox icon="logout"   label="Check-out" value={(!data.checkOut || data.checkOut === "MISSING") ? "Missing" : data.checkOut} color={(!data.checkOut || data.checkOut === "MISSING") ? "red" : "blue"} />

              <InfoBox icon="schedule" label="Ca làm"    value={data.shift || "08:00–17:00"} color="slate" />

            </div>

          </div>



          {/* AI ANALYSIS */}

          {data.aiAnalysis && (

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-3">

              <div className="size-9 rounded-lg bg-primary text-white flex items-center justify-center flex-shrink-0">

                <span className="material-symbols-outlined text-sm">auto_awesome</span>

              </div>

              <div>

                <p className="text-xs font-bold text-primary uppercase tracking-wide">AI Analysis</p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{data.aiAnalysis}</p>

              </div>

            </div>

          )}



          {/* REFERENCE INFO */}

          {data.referenceId && (

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3">

              <div className="size-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">

                <span className="material-symbols-outlined text-sm">link</span>

              </div>

              <div className="flex-1">

                <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Linked Request</p>

                <p className="text-sm text-slate-700 mt-1 leading-relaxed">

                  This exception is linked to a <span className="font-semibold">{data.referenceType?.replace(/_/g, ' ')}</span> request.

                </p>

                <button

                  onClick={() => navigate(`/hr/request-details/${data.referenceId}`)}

                  className="mt-2 text-primary text-xs font-bold hover:underline flex items-center gap-1"

                >

                  <span className="material-symbols-outlined text-sm">open_in_new</span>

                  View Request Details (#{data.referenceId})

                </button>

              </div>

            </div>

          )}



          {/* PHÂN NHÁNH TRẠNG THÁI */}

          {isAwaiting    && <AwaitingBlock />}

          {isReadOnly    && <ResolvedBlock data={data} />}

          {hasExplanation && <ExplanationBlock data={data} />}

          {isLeaveOverride && !isReadOnly && <LeaveOverrideBlock data={data} />}

          {!isLeaveOverride && !hasExplanation && !isAwaiting && !isReadOnly && <NoExplanationBlock />}



          {/* ACTION SELECTION — ẩn khi read-only hoặc đang chờ NV */}

          {!isReadOnly && !isAwaiting && (

            <div>

              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">

                {hasExplanation ? "Quyết định" : "Chọn hành động xử lý"}

              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">

                {ACTION_CONFIG.map(cfg => (

                  <button key={cfg.key} onClick={() => setAction(cfg.key)}

                    className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-semibold transition-all text-left ${

                      action === cfg.key

                        ? cfg.style + " shadow-sm"

                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"

                    }`}>

                    <span className="material-symbols-outlined text-base">{cfg.icon}</span>

                    {cfg.label}

                  </button>

                ))}

              </div>

            </div>

          )}



          {/* CHECKOUT TIME — chỉ hiện khi approve_ot hoặc manual_checkout */}

          {needsTime && (

            <div className="bg-slate-50 p-4 rounded-xl border space-y-3">

              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin thời gian</p>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm font-semibold mb-1">Check-in (gốc)</label>

                  <div className="h-10 px-3 flex items-center bg-white border rounded-lg text-sm text-slate-500">

                    {data.checkIn || "—"}

                  </div>

                </div>

                <div>

                  <label className="block text-sm font-semibold mb-1">

                    Checkout thực tế <span className="text-red-500">*</span>

                  </label>

                  <input type="time" value={checkoutTime} onChange={e => setCheckout(e.target.value)}

                    className="w-full h-10 px-3 border rounded-lg text-sm focus:ring-primary focus:border-primary" />

                </div>

              </div>

              {workHours !== null && (

                <div className="flex gap-6 p-3 bg-blue-50 border border-blue-100 rounded-lg">

                  <CalcItem label="Tổng giờ làm" value={`${workHours.h}h ${workHours.m > 0 ? workHours.m + "m" : ""}`} />

                  {isOTType && action === "approve_ot" && (

                    <CalcItem label="OT (ước tính)" value={`${Math.max(0, workHours.h - 8)}h`} color="indigo" />

                  )}

                  <CalcItem label="Lưu ý" value="Đã trừ 90 phút nghỉ trưa" color="slate" />

                </div>

              )}

            </div>

          )}



          {/* REVERT_TO_LEAVE notice */}

          {action === "REVERT_TO_LEAVE" && (

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">

              <span className="material-symbols-outlined text-amber-500 flex-shrink-0">event_busy</span>

              <div>

                <p className="text-sm font-bold text-amber-800">Attendance sẽ được revert về Leave</p>

                <p className="text-xs text-amber-700 mt-1">

                  Checkin/checkout sẽ bị xóa, status sẽ về &quot;leave&quot;. Leave balance vẫn được giữ nguyên.

                </p>

              </div>

            </div>

          )}



          {/* KEEP_PRESENT notice */}

          {action === "KEEP_PRESENT" && (

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">

              <span className="material-symbols-outlined text-emerald-500 flex-shrink-0">how_to_reg</span>

              <div>

                <p className="text-sm font-bold text-emerald-800">Attendance sẽ được giữ nguyên là Present</p>

                <p className="text-xs text-emerald-700 mt-1">

                  Nhân viên sẽ được tính là có mặt trong ngày này. Leave balance đã bị trừ sẽ không được hoàn lại tự động.

                </p>

              </div>

            </div>

          )}



          {/* REQUEST_SUBMISSION notice */}

          {action === "REQUEST_SUBMISSION" && (

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">

              <span className="material-symbols-outlined text-amber-500 flex-shrink-0">send</span>

              <div>

                <p className="text-sm font-bold text-amber-800">Thông báo sẽ được gửi đến nhân viên</p>

                <p className="text-xs text-amber-700 mt-1">

                  Hệ thống sẽ gửi email/Zalo nhắc nhân viên tạo đơn điều chỉnh chấm công.

                  Exception giữ trạng thái Pending cho đến khi nhận được đơn.

                </p>

              </div>

            </div>

          )}



          {/* COMMENT — ẩn khi read-only hoặc đang chờ NV */}

          {!isReadOnly && !isAwaiting && (

          <div>

            <label className="block text-sm font-bold mb-2">

              Ghi chú{["REJECT_REQUEST","REJECT","APPROVE_REQUEST"].includes(action) && <span className="text-red-500"> *</span>}

            </label>

            <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}

              placeholder="Nhập lý do hoặc ghi chú cho quyết định này..."

              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-primary focus:border-primary" />

          </div>

          )}



          {/* PAYLOAD PREVIEW */}

          {action && (

            <details className="text-xs">

              <summary className="cursor-pointer text-slate-400 hover:text-slate-600 font-medium select-none">

                Xem payload gửi về hệ thống

              </summary>

              <pre className="mt-2 p-3 bg-slate-50 border rounded-lg text-slate-500 overflow-x-auto leading-relaxed whitespace-pre-wrap">

{JSON.stringify({

  exceptionId: data.exceptionId || data.id,

  employeeId: data?.employeeInfo?.employeeId,

  attendanceDate: data.date,

  resolvedBy: localStorage.getItem("employeeId"),

  action,

  checkoutTime: needsTime ? `${checkoutTime}:00` : null,

  workHours: workHours ? +(workHours.h + workHours.m / 60).toFixed(2) : null,

  comment: comment || null,

  requestId: data.requestId || null,

}, null, 2)}

              </pre>

            </details>

          )}

        </div>



        {/* FOOTER */}

        <div className="px-6 py-4 border-t bg-slate-50 flex justify-between items-center">

          <p className="text-xs text-slate-400">

            {action

              ? `Hành động: ${ACTION_CONFIG.find(c => c.key === action)?.label}`

              : "Chưa chọn hành động"}

          </p>

          <div className="flex gap-3">

            <button onClick={onClose}

              className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg text-sm border">

              {isReadOnly || isAwaiting ? "Đóng" : "Hủy"}

            </button>

            {!isReadOnly && !isAwaiting && (

            <button onClick={handleSubmit} disabled={!action || submitting}

              className={`px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all ${

                action && !submitting

                  ? "bg-primary text-white hover:bg-blue-600 shadow-sm shadow-primary/30"

                  : "bg-slate-200 text-slate-400 cursor-not-allowed"

              }`}>

              {submitting

                ? <><span className="material-symbols-outlined text-sm">autorenew</span> Đang xử lý...</>

                : <><span className="material-symbols-outlined text-sm">check</span> Xác nhận</>

              }

            </button>

            )}

          </div>

        </div>

      </div>

    </div>

  );

}



/* ===== ExplanationBlock ===== */

function ExplanationBlock({ data }) {

  return (

    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 overflow-hidden">

      <div className="px-4 py-3 bg-emerald-100/60 border-b border-emerald-200 flex items-center gap-2">

        <span className="material-symbols-outlined text-emerald-600 text-base">assignment_turned_in</span>

        <p className="text-sm font-bold text-emerald-800">Nhân viên đã gửi giải trình</p>

        <span className="ml-auto text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">

          {data.explanationSubmittedAt || ""}

        </span>

      </div>

      <div className="p-4">

        <p className="text-xs text-slate-500 font-bold uppercase mb-1">Nội dung giải trình</p>

        <p className="text-sm text-slate-800 leading-relaxed bg-white border rounded-lg p-3">

          {data.explanationNote || "(Không có nội dung)"}

        </p>

      </div>

    </div>

  );

}



/* ===== NoExplanationBlock ===== */

function NoExplanationBlock() {

  return (

    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 flex gap-3">

      <span className="material-symbols-outlined text-amber-500 flex-shrink-0 mt-0.5">info</span>

      <div>

        <p className="text-sm font-bold text-amber-800">Chưa có giải trình từ nhân viên</p>

        <p className="text-xs text-amber-700 mt-1 leading-relaxed">

          Exception này được phát hiện tự động bởi hệ thống. HR có thể tự xử lý trực tiếp

          hoặc chọn "Yêu cầu NV giải trình" để đợi nhân viên phản hồi trước khi quyết định.

        </p>

      </div>

    </div>

  );

}



/* ===== AwaitingBlock ===== */

function AwaitingBlock() {

  return (

    <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 flex gap-3">

      <span className="material-symbols-outlined text-indigo-500 flex-shrink-0 mt-0.5">hourglass_top</span>

      <div>

        <p className="text-sm font-bold text-indigo-800">Đang chờ nhân viên giải trình</p>

        <p className="text-xs text-indigo-700 mt-1 leading-relaxed">

          Thông báo đã được gửi đến nhân viên. Exception sẽ chuyển sang trạng thái

          "Explanation Ready" khi nhân viên nộp giải trình.

        </p>

      </div>

    </div>

  );

}



/* ===== ResolvedBlock ===== */

function ResolvedBlock({ data }) {

  const isApproved = data.status === "approved";

  return (

    <div className={`rounded-xl border p-4 flex gap-3 ${

      isApproved ? "border-emerald-200 bg-emerald-50/40" : "border-rose-200 bg-rose-50/40"

    }`}>

      <span className={`material-symbols-outlined flex-shrink-0 mt-0.5 ${

        isApproved ? "text-emerald-500" : "text-rose-500"

      }`}>{isApproved ? "check_circle" : "cancel"}</span>

      <div className="flex-1">

        <p className={`text-sm font-bold ${isApproved ? "text-emerald-800" : "text-rose-800"}`}>

          Exception đã được {isApproved ? "chấp nhận" : "từ chối"}

        </p>

        {data.hrComment && (

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">

            <span className="font-semibold">HR Comment:</span> {data.hrComment}

          </p>

        )}

        {data.approvedAt && (

          <p className="text-xs text-slate-400 mt-1">Resolved at: {data.approvedAt}</p>

        )}

      </div>

    </div>

  );

}



/* ===== UI Helpers ===== */

function LeaveOverrideBlock({ data }) {

  return (

    <div className="rounded-xl border border-amber-200 bg-amber-50/40 overflow-hidden">

      <div className="px-4 py-3 bg-amber-100/60 border-b border-amber-200 flex items-center gap-2">

        <span className="material-symbols-outlined text-amber-600 text-base">event_busy</span>

        <p className="text-sm font-bold text-amber-800">Nhân viên có approved leave nhưng vẫn chấm công</p>

      </div>

      <div className="p-4 space-y-2">

        <p className="text-xs text-slate-600 leading-relaxed">

          Nhân viên đã có leave request được approved cho ngày này, nhưng vẫn thực hiện check-in.

          HR cần quyết định giữ trạng thái nào cho attendance record:

        </p>

        <div className="grid grid-cols-2 gap-3 mt-2">

          <div className="bg-white border rounded-lg p-3">

            <p className="text-xs font-bold text-amber-700 flex items-center gap-1"><span className="material-symbols-outlined text-sm">event_busy</span> Revert về Leave</p>

            <p className="text-xs text-slate-500 mt-1">Xóa checkin, giữ leave balance đã trừ.</p>

          </div>

          <div className="bg-white border rounded-lg p-3">

            <p className="text-xs font-bold text-emerald-700 flex items-center gap-1"><span className="material-symbols-outlined text-sm">how_to_reg</span> Giữ nguyên Present</p>

            <p className="text-xs text-slate-500 mt-1">Tính là có mặt. Leave balance vẫn bị trừ.</p>

          </div>

        </div>

      </div>

    </div>

  );

}



function TypeBadge({ type }) {

  const map = {

    "Missing Check-in":             "bg-rose-100 text-rose-700",

    "Missing checkout":             "bg-orange-100 text-orange-700",

    "Possible OT":                  "bg-indigo-100 text-indigo-700",

    "Out of Location":              "bg-purple-100 text-purple-700",

    "MISSING_CHECKOUT_POSSIBLE_OT": "bg-indigo-100 text-indigo-700",

    "LEAVE_OVERRIDE_CHECKIN":       "bg-amber-100 text-amber-700",

  };

  return (

    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[type] || "bg-slate-100 text-slate-600"}`}>

      {type}

    </span>

  );

}



function InfoBox({ icon, label, value, color }) {

  const colors = { blue:"text-primary bg-blue-50", red:"text-rose-500 bg-rose-50", slate:"text-slate-500 bg-slate-50" };

  return (

    <div className={`p-3 rounded-xl border flex flex-col gap-1 ${colors[color] || colors.slate}`}>

      <span className="material-symbols-outlined text-sm">{icon}</span>

      <p className="text-[10px] font-bold uppercase opacity-60">{label}</p>

      <p className="text-sm font-bold">{value}</p>

    </div>

  );

}



function InfoItem({ label, value, highlight }) {

  return (

    <div>

      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{label}</p>

      <p className={`text-sm font-semibold ${highlight ? "text-emerald-700" : "text-slate-800"}`}>{value}</p>

    </div>

  );

}



function CalcItem({ label, value, color }) {

  const c = color === "indigo" ? "text-indigo-700" : color === "slate" ? "text-slate-400" : "text-blue-700";

  return (

    <div>

      <p className="text-[10px] font-bold uppercase text-blue-500">{label}</p>

      <p className={`text-sm font-bold mt-0.5 ${c}`}>{value}</p>

    </div>

  );

}

