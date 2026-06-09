/**
 * HR Admin API Utility
 *
 * Centralizes all /api/hradmin/* calls for HR Admin screens.
 * Auth: Bearer token from localStorage.getItem("token")
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
}

// ── Document Checklists ───────────────────────────────────────────────────

export async function fetchChecklistTemplates() {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/templates`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Templates fetch failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : [];
}

export async function fetchChecklistTemplateDetail(templateId) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/templates/${templateId}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Template detail fetch failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

export async function createChecklistTemplate(name, description, items) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/templates`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, description, items }),
    });
    if (!res.ok) throw new Error(`Template creation failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

export async function updateChecklistTemplate(templateId, name, description, isActive) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/templates/${templateId}`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ name, description, isActive }),
    });
    if (!res.ok) throw new Error(`Template update failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

export async function fetchChecklistAssignments() {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/assignments`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Assignments fetch failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : [];
}

export async function fetchChecklistAssignmentDetail(assignmentId) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/assignments/${assignmentId}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Assignment detail fetch failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

export async function assignChecklist(employeeId, templateId, dueDate) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/assignments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ employeeId, templateId, dueDate }),
    });
    if (!res.ok) throw new Error(`Assignment failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

// ── Payroll Dashboard ─────────────────────────────────────────────────────

export async function fetchAllPayrollCycles() {
    const res = await fetch(`${BASE_URL}/api/hradmin/payroll-cycles`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Payroll cycles fetch failed: ${res.status}`);
    const json = await res.json();
    return json.data ?? [];
}

export async function fetchPayrollDashboard(cycleId = null) {
    const url = cycleId
        ? `${BASE_URL}/api/hradmin/payroll-cycles/dashboard?cycleId=${cycleId}`
        : `${BASE_URL}/api/hradmin/payroll-cycles/dashboard`;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Payroll dashboard fetch failed: ${res.status}`);
    return await res.json();
}

export async function reviewChecklistResponse(responseId, status, notes) {
    const res = await fetch(`${BASE_URL}/api/hradmin/checklists/responses/${responseId}/review`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) throw new Error(`Review failed: ${res.status}`);
    const json = await res.json();
    return json.status === "success" ? json.data : null;
}

// ── AI Insights ───────────────────────────────────────────────────────────

/**
 * Lấy toàn bộ AI Insights trong 1 lần gọi — dùng cho AIInsightScreen dashboard.
 * Trả về: { kpi, attendanceAnomalies, payrollAnomalies, generatedAt }
 *
 * @param {number} lookbackDays số ngày nhìn về cho attendance analysis (mặc định 30)
 */
export async function fetchAiInsightsSummary(lookbackDays = 30) {
    const res = await fetch(
        `${BASE_URL}/api/hradmin/ai-insights/summary?lookbackDays=${lookbackDays}`,
        { headers: getHeaders() }
    );
    if (!res.ok) throw new Error(`AI Insights summary fetch failed: ${res.status}`);
    return await res.json();
}

/**
 * Lấy danh sách nhân viên có bất thường chấm công.
 * Trả về: List<AttendanceAnomalyDTO> sắp xếp HIGH → MEDIUM → LOW
 *
 * @param {number} lookbackDays số ngày phân tích (mặc định 30)
 */
export async function fetchAttendanceAnomalies(lookbackDays = 30) {
    const res = await fetch(
        `${BASE_URL}/api/hradmin/ai-insights/attendance-anomalies?lookbackDays=${lookbackDays}`,
        { headers: getHeaders() }
    );
    if (!res.ok) throw new Error(`Attendance anomalies fetch failed: ${res.status}`);
    return await res.json();
}

/**
 * Lấy danh sách nhân viên có bất thường lương (so sánh với baseline 6 kỳ trước).
 * Trả về: List<PayrollAnomalyDTO> sắp xếp HIGH → MEDIUM
 */
export async function fetchPayrollAnomalies() {
    const res = await fetch(
        `${BASE_URL}/api/hradmin/ai-insights/payroll-anomalies`,
        { headers: getHeaders() }
    );
    if (!res.ok) throw new Error(`Payroll anomalies fetch failed: ${res.status}`);
    return await res.json();
}
