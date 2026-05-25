/**
 * Employee Self-Service API Utility
 *
 * Centralizes all /api/employee/* calls for the employee portal screens.
 * Auth: Bearer token from localStorage.getItem("token")
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export async function fetchDashboard() {
    const res = await fetch(`${BASE_URL}/api/employee/dashboard`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
    return res.json();
}

// ── Profile ────────────────────────────────────────────────────────────────
export async function fetchMyProfile() {
    const res = await fetch(`${BASE_URL}/api/employee/me`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
    return res.json();
}

// ── Attendance ─────────────────────────────────────────────────────────────

/**
 * Lấy danh sách 12 kỳ chấm công để hiển thị trong dropdown.
 * Mỗi kỳ trả về: { startDate, endDate, label, isCurrent }
 * Fallback về calendar month nếu HR Admin chưa config kỳ.
 */
export async function fetchMyAttendanceCycles() {
    const res = await fetch(`${BASE_URL}/api/employee/my-attendance-cycles`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Attendance cycles fetch failed: ${res.status}`);
    const json = await res.json();
    /* Response: { status: "success", data: [ { startDate, endDate, label, isCurrent } ] } */
    return json.status === "success" ? json.data : [];
}

/**
 * Lấy lịch sử chấm công theo kỳ (startDate → endDate).
 * Nếu không truyền startDate/endDate → backend tự dùng kỳ hiện tại.
 *
 * @param {string|null} startDate  yyyy-MM-dd
 * @param {string|null} endDate    yyyy-MM-dd
 */
export async function fetchMyAttendance(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate)   params.set("endDate", endDate);
    const res = await fetch(`${BASE_URL}/api/employee/my-attendance?${params}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Attendance fetch failed: ${res.status}`);
    const json = await res.json();

    /* Transform backend response → cấu trúc frontend cần */
    if (json.status === "success" && json.data) {
        return {
            periodStart: json.data.periodStart,
            periodEnd:   json.data.periodEnd,
            stats: {
                workingDays:    json.data.summary?.present || 0,
                lateDays:       json.data.summary?.late || 0,
                missingRecords: json.data.summary?.absent || 0,
                leaveDays:      json.data.summary?.leave || 0,
                otHours:        json.data.summary?.otHours || 0,
            },
            today: json.data.todayAttendance ? {
                checkInTime:  json.data.todayAttendance.checkInTime || "",
                checkOutTime: json.data.todayAttendance.checkOutTime || "",
                status:       json.data.todayAttendance.status || "no_record",
                otMinutes:    json.data.todayAttendance.otMinutes || 0,
                shiftEnd:     "18:00",
            } : null,
            records: json.data.records || [],
        };
    }
    return json;
}

// ── Requests ───────────────────────────────────────────────────────────────
export async function fetchMyRequests(type, status) {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (status) params.set("status", status);
    const res = await fetch(`${BASE_URL}/api/employee/my-requests?${params}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Requests fetch failed: ${res.status}`);
    return res.json();
}

// ── Payslips ───────────────────────────────────────────────────────────────
export async function fetchMyPayslips() {
    const res = await fetch(`${BASE_URL}/api/employee/my-payslips`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Payslips fetch failed: ${res.status}`);
    return res.json();
}

export async function fetchMyPayslipDetail(payslipId) {
    const res = await fetch(`${BASE_URL}/api/employee/my-payslips/${payslipId}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Payslip detail fetch failed: ${res.status}`);
    return res.json();
}

// ── Leave Balances ─────────────────────────────────────────────────────────
export async function fetchMyLeaveBalances(year) {
    const params = year ? `?year=${year}` : "";
    const res = await fetch(`${BASE_URL}/api/employee/my-leave-balances${params}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Leave balances fetch failed: ${res.status}`);
    return res.json();
}

// ── Notifications ──────────────────────────────────────────────────────────
export async function fetchNotifications() {
    const res = await fetch(`${BASE_URL}/api/notifications`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Notifications fetch failed: ${res.status}`);
    return res.json();
}

export async function markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Mark read failed: ${res.status}`);
    return res.json();
}

export async function markAllNotificationsRead() {
    const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Mark all read failed: ${res.status}`);
    return res.json();
}

// ── Helpers ────────────────────────────────────────────────────────────────
export function formatCurrency(amount) {
    if (amount == null) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        minimumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(dateStr) {
    if (!dateStr) return "–";
    try {
        return new Date(dateStr).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export function getStatusConfig(status) {
    const s = (status || "").toLowerCase();
    if (s.includes("approved")) return { label: "Approved", bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
    if (s === "pending") return { label: "Pending", bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
    if (s === "rejected") return { label: "Rejected", bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    if (s === "in_progress") return { label: "In Progress", bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    if (s === "action_required") return { label: "Action Required", bg: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" };
    return { label: status || "Unknown", bg: "bg-slate-100 text-slate-600" };
}

export function getAttendanceStatusConfig(status) {
    const s = (status || "").toLowerCase();
    if (s === "present") return { label: "Present", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" };
    if (s === "late") return { label: "Late", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
    if (s === "working") return { label: "Working", dot: "bg-blue-500 animate-pulse", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" };
    if (s === "missing") return { label: "Missing", dot: "bg-red-500", badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" };
    if (s === "absent") return { label: "Absent", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600" };
    return { label: status || "–", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600" };
}
