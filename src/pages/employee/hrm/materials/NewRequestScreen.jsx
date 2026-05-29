import { useState } from "react";
import LeaveRequestForm from "./form/LeaveRequestForm";
import OTRequestForm from "./form/OTRequestForm";
import AdjustmentRequestForm from "./form/AdjustmentRequestForm";
import { FormHeader, CalculatedDuration, CalculatedOTHours, ReasonTextarea, AttachmentUpload } from "./form/RequestFormComponents";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

/**
 * Lấy employeeId từ JWT token trong localStorage.
 * Backend encode userId vào claim "sub" khi issue token.
 * Frontend có thể lưu employeeId trực tiếp hoặc parse từ token.
 */
function getEmployeeIdFromToken() {
  try {
    // Ưu tiên lấy employeeId trực tiếp từ localStorage (nếu backend đã trả về)
    const directEmployeeId = localStorage.getItem('employeeId');
    if (directEmployeeId) return parseInt(directEmployeeId, 10);

    // Fallback: parse từ JWT token
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Backend trả về userId trong "sub", cần gọi API để lấy employeeId
    // Hoặc nếu backend encode employeeId trực tiếp vào token
    return payload.employeeId || payload.sub || null;
  } catch {
    return null;
  }
}

// Mock data (approval chain — sẽ replace bằng API sau)
const MOCK_DATA = {
  approvalChain: {
    manager: { name: "Direct Manager", title: "Direct Manager", avatar: "" },
    estimatedTime: "24h"
  }
};

const REQUEST_TYPES = [
  { key: "LEAVE", label: "Leave Request", icon: "event_busy" },
  { key: "OT", label: "Overtime", icon: "more_time" },
  { key: "ADJUSTMENT", label: "Adjustment", icon: "rule" }
];

function Breadcrumbs() {
  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <a className="hover:text-primary" href="#">Home</a>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <a className="hover:text-primary" href="#">HR</a>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-slate-900 dark:text-white">New Request</span>
      </nav>
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Create New HR Request</h1>
        <p className="text-slate-500 mt-1">Select your request category and fill in the required information for processing.</p>
      </div>
    </div>
  );
}

function RequestTypeSelector({ selectedType, onSelect }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-[10px] font-bold tracking-tighter">01</span>
        <h3 className="text-lg font-bold">Select Request Type</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {REQUEST_TYPES.map(type => (
          <button
            key={type.key}
            onClick={() => onSelect(type.key)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 gap-2 text-center transition-all ${
              selectedType === type.key
                ? "border-primary bg-primary/5 text-primary"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-primary/50 hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-3xl">{type.icon}</span>
            <span className="text-sm font-bold">{type.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MainFormCard({ selectedType, formData, onChange, employeeId }) {
  const renderForm = () => {
    switch (selectedType) {
      case "LEAVE":
        return <LeaveRequestForm formData={formData} onChange={onChange} employeeId={employeeId} />;
      case "OT":
        return <OTRequestForm formData={formData} onChange={onChange} />;
      case "ADJUSTMENT":
        return <AdjustmentRequestForm formData={formData} onChange={onChange} />;
      default:
        return null;
    }
  };

  const renderCalculation = () => {
    switch (selectedType) {
      case "LEAVE":
        return <CalculatedDuration duration={formData.duration} />;
      case "OT":
        return <CalculatedOTHours hours={formData.hours} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {renderForm()}
      {renderCalculation()}
      <ReasonTextarea
        value={formData.reason}
        onChange={(e) => onChange({ ...formData, reason: e.target.value })}
      />
      <AttachmentUpload />
    </div>
  );
}

function ApprovalChain() {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Approval Chain</h4>
      <div className="flex items-center gap-3">
        <div
          className="size-10 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url('${MOCK_DATA.approvalChain.manager.avatar}')` }}
        />
        <div>
          <p className="text-sm font-bold">{MOCK_DATA.approvalChain.manager.name}</p>
          <p className="text-[10px] text-slate-500">{MOCK_DATA.approvalChain.manager.title}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
        <span className="material-symbols-outlined text-base">info</span>
        Estimated processing: {MOCK_DATA.approvalChain.estimatedTime}
      </div>
    </div>
  );
}

function PolicyReminder({ selectedType }) {
  const policies = {
    LEAVE: [
      "Requests should be submitted at least 48 hours in advance.",
      "Annual leave requires direct manager approval via email or portal.",
      "Supporting docs mandatory for medical leaves > 1 day."
    ],
    OT: [
      "OT requests must be approved by manager before the work is performed.",
      "Weekend OT requires prior approval from HR.",
      "Maximum OT hours per month: 40 hours."
    ],
    ADJUSTMENT: [
      "Adjustment requests should be submitted within 24 hours of the incident.",
      "Supporting documentation may be required for approval.",
      "Frequent adjustments may affect performance evaluation."
    ]
  };

  const currentPolicies = policies[selectedType] || policies.LEAVE;

  return (
    <div className="bg-slate-100 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Policy Reminder</h4>
      <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
        {currentPolicies.map((policy, index) => (
          <li key={index}>{policy}</li>
        ))}
      </ul>
    </div>
  );
}

function InfoSidebar({ selectedType }) {
  return (
    <div className="lg:w-72 space-y-4">
      <ApprovalChain />
      <PolicyReminder selectedType={selectedType} />
    </div>
  );
}

function DynamicFormArea({ selectedType, formData, onChange, employeeId }) {
  const getFormTitle = () => {
    switch (selectedType) {
      case "LEAVE":
        return "Leave Request Details";
      case "OT":
        return "Overtime Request Details";
      case "ADJUSTMENT":
        return "Adjustment Request Details";
      default:
        return "Request Details";
    }
  };

  if (!selectedType) {
    return (
      <div className="bg-white dark:bg-slate-900 p-16 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center text-slate-400">
        <span className="material-symbols-outlined text-5xl block mb-3">touch_app</span>
        <p className="font-semibold">Please select a request type above</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <FormHeader stepNumber="02" title={getFormTitle()} />
      <div className="flex flex-col lg:flex-row gap-6">
        <MainFormCard selectedType={selectedType} formData={formData} onChange={onChange} employeeId={employeeId} />
        <InfoSidebar selectedType={selectedType} />
      </div>
    </section>
  );
}

function ActionButton({ selectedType, onCancel, onSubmit, submitting }) {
  return (
    <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-4">
      <button
        onClick={onCancel}
        disabled={submitting}
        className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
      >
        Cancel Request
      </button>
      <button
        onClick={onSubmit}
        disabled={!selectedType || submitting}
        className="px-8 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Đang gửi...' : 'Submit Request'}
        <span className="material-symbols-outlined text-sm">{submitting ? 'hourglass_top' : 'send'}</span>
      </button>
    </div>
  );
}

export default function NewRequestScreen() {
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({
    // Leave Request fields
    leaveType: "",
    policyId: null,
    startDate: "",
    endDate: "",
    durationUnit: "full_day",
    // OT Request fields
    otDate: "",
    dayType: "",
    startTime: "",
    endTime: "",
    // Adjustment Request fields
    adjustmentType: "",
    adjustmentDate: "",
    originalTime: "",
    adjustedTime: "",
    // Common fields
    reason: "",
    duration: "",
    hours: ""
  });

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    // Reset form when switching types
    setFormData({
      leaveType: "",
      policyId: null,
      startDate: "",
      endDate: "",
      durationUnit: "full_day",
      otDate: "",
      dayType: "",
      startTime: "",
      endTime: "",
      adjustmentType: "",
      adjustmentDate: "",
      originalTime: "",
      adjustedTime: "",
      reason: "",
      duration: "",
      hours: ""
    });
  };

  const handleCancel = () => {
    setSelectedType(null);
    setFormData({
      leaveType: "",
      policyId: null,
      startDate: "",
      endDate: "",
      durationUnit: "full_day",
      otDate: "",
      dayType: "",
      startTime: "",
      endTime: "",
      adjustmentType: "",
      adjustmentDate: "",
      originalTime: "",
      adjustedTime: "",
      reason: "",
      duration: "",
      hours: ""
    });
  };

  /**
   * Submit request lên backend.
   * Pipeline:
   *  LEAVE → POST /api/employee/requests/leave
   *  OT    → POST /api/employee/requests/ot
   *          Backend tự detect dayType (hoặc dùng dayType từ form)
   *          Tính calculatedPay từ compensation plan của nhân viên
   */
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    try {
      const employeeId = getEmployeeIdFromToken();
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      };

      // Fetch workflowId by request type
      // Map frontend types to database workflow types
      const requestTypeMap = {
        'LEAVE': 'leave_request',
        'OT': 'ot',
        'ADJUSTMENT': 'adjustment_request'
      };
      const dbRequestType = requestTypeMap[selectedType] || selectedType.toLowerCase();
      const workflowRes = await fetch(`${API_BASE_URL}/api/workflows/by-type?requestType=${dbRequestType}`, { headers });
      if (!workflowRes.ok) {
        alert('❌ Không tìm thấy workflow cấu hình cho loại request này. Vui lòng liên hệ HR Admin.');
        setSubmitting(false);
        return;
      }
      const workflow = await workflowRes.json();
      const workflowId = workflow.workflowId;

      let url, payload;
      if (selectedType === 'LEAVE') {
        url = `${API_BASE_URL}/api/employee/requests/leave`;
        payload = {
          employeeId,
          workflowId,
          title: `Leave Request - ${formData.leaveType}`,
          description: formData.reason,
          leaveType: formData.leaveType,
          policyId: formData.policyId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          durationDays: formData.duration || 1,
          durationUnit: formData.durationUnit || 'full_day',
          reason: formData.reason,
        };
      } else if (selectedType === 'OT') {
        url = `${API_BASE_URL}/api/employee/requests/ot`;
        payload = {
          employeeId,
          workflowId,
          title: `OT Request - ${formData.otDate}`,
          description: formData.reason,
          otDate: formData.otDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          reason: formData.reason,
          dayType: formData.dayType || '',
        };
      } else if (selectedType === 'ADJUSTMENT') {
        if (!formData.adjustmentType || !formData.adjustmentDate || !formData.adjustedTime) {
          alert('Vui lòng chọn loại điều chỉnh, ngày và giờ.');
          setSubmitting(false);
          return;
        }
        url = `${API_BASE_URL}/api/employee/requests/adjustment`;
        payload = {
          employeeId,
          workflowId,
          title: `Adjustment Request - ${formData.adjustmentType} - ${formData.adjustmentDate}`,
          description: formData.reason,
          adjustmentType: formData.adjustmentType,
          date: formData.adjustmentDate,
          originalTime: formData.originalTime || null,
          adjustedTime: formData.adjustedTime,
          reason: formData.reason,
        };
      } else {
        setSubmitting(false);
        return;
      }

      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        // Nếu body không phải JSON, dùng status text
        alert('❌ Lỗi server: ' + (res.statusText || 'Unknown error'));
        setSubmitting(false);
        return;
      }

      if (data.status === 'success') {
        alert('✅ Request submitted successfully!');
        handleCancel();
      } else {
        alert('❌ ' + (data.message || 'Submit failed'));
      }
    } catch (err) {
      alert('❌ Lỗi kết nối: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="space-y-8">
        <Breadcrumbs />
        <RequestTypeSelector selectedType={selectedType} onSelect={handleTypeSelect} />
        <DynamicFormArea selectedType={selectedType} formData={formData} onChange={setFormData} employeeId={getEmployeeIdFromToken()} />
        {selectedType && (
          <ActionButton selectedType={selectedType} onCancel={handleCancel} onSubmit={handleSubmit} submitting={submitting} />
        )}
      </div>
    </main>
  );
}

