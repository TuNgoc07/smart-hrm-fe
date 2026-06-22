/**
 * Manager Portal API Utility
 *
 * Centralizes all /api/manager/* and /api/notifications/* calls for the manager portal screens.
 * Auth: Bearer token from localStorage.getItem("token")
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };
}

// ── Notifications ──────────────────────────────────────────────────────────────

/**
 * Fetch notifications for the current manager
 * @param {string} type - Filter by type: "all", "approval", "alert", "info"
 * @returns {Promise<Array>} Array of NotificationDTO objects
 */
export async function fetchNotifications(type = "all") {
    const res = await fetch(`${BASE_URL}/api/notifications?type=${type}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Notifications fetch failed: ${res.status}`);
    return res.json();
}

/**
 * Fetch unread count for the current manager
 * @returns {Promise<{count: number}>}
 */
export async function fetchUnreadCount() {
    const res = await fetch(`${BASE_URL}/api/notifications/unread-count`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Unread count fetch failed: ${res.status}`);
    return res.json();
}

/**
 * Fetch unread count by type for the current manager
 * @returns {Promise<{approval: number, alert: number, info: number, total: number}>}
 */
export async function fetchUnreadCountByType() {
    const res = await fetch(`${BASE_URL}/api/notifications/unread-count-by-type`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Unread count by type fetch failed: ${res.status}`);
    return res.json();
}

/**
 * Mark a notification as read
 * @param {number} notificationId - ID of the notification to mark as read
 * @returns {Promise<{status: string}>}
 */
export async function markNotificationAsRead(notificationId) {
    const res = await fetch(`${BASE_URL}/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Mark as read failed: ${res.status}`);
    return res.json();
}

/**
 * Mark all notifications as read
 * @returns {Promise<{status: string}>}
 */
export async function markAllNotificationsAsRead() {
    const res = await fetch(`${BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Mark all as read failed: ${res.status}`);
    return res.json();
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export async function fetchManagerHomeStats() {
    const res = await fetch(`${BASE_URL}/api/manager/home`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Manager home stats fetch failed: ${res.status}`);
    return res.json();
}

export async function fetchTeamOverview() {
    const res = await fetch(`${BASE_URL}/api/manager/team-overview`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Team overview fetch failed: ${res.status}`);
    return res.json();
}

export async function fetchTeamMembers() {
    const res = await fetch(`${BASE_URL}/api/manager/team-members`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Team members fetch failed: ${res.status}`);
    return res.json();
}

export async function fetchMemberProfile(employeeId) {
    const res = await fetch(`${BASE_URL}/api/manager/team-members/${employeeId}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Member profile fetch failed: ${res.status}`);
    return res.json();
}

// ── Requests ───────────────────────────────────────────────────────────────────

export async function fetchManagerRequests(tab = "all", page = 0, size = 10) {
    const res = await fetch(`${BASE_URL}/api/manager/requests?tab=${tab}&page=${page}&size=${size}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Manager requests fetch failed: ${res.status}`);
    return res.json();
}

export async function fetchManagerRequestDetail(requestId) {
    const res = await fetch(`${BASE_URL}/api/manager/requests/${requestId}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Manager request detail fetch failed: ${res.status}`);
    return res.json();
}

export async function decideRequest(requestId, decision, comment) {
    const res = await fetch(`${BASE_URL}/api/manager/requests/${requestId}/decide`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ decision, comment }),
    });
    if (!res.ok) throw new Error(`Request decision failed: ${res.status}`);
    return res.json();
}

// ── Workload Distribution ─────────────────────────────────────────────────────

export async function fetchWorkloadDistribution(periodStart, periodEnd) {
    const params = new URLSearchParams({ periodStart, periodEnd });
    const res = await fetch(`${BASE_URL}/api/manager/workload-distribution?${params}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Workload distribution fetch failed: ${res.status}`);
    return res.json();
}

// ── Line Manager Dashboard ────────────────────────────────────────────────────

export async function fetchLineManagerDashboard() {
    const res = await fetch(`${BASE_URL}/api/manager/line-manager-dashboard`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Line manager dashboard fetch failed: ${res.status}`);
    return res.json();
}

// ── Team Leave Balance ────────────────────────────────────────────────────────

export async function fetchTeamLeaveBalance(year) {
    const params = year ? `?year=${year}` : "";
    const res = await fetch(`${BASE_URL}/api/manager/team-leave-balance${params}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Team leave balance fetch failed: ${res.status}`);
    return res.json();
}

// ── Team Calendar ─────────────────────────────────────────────────────────────

export async function fetchTeamCalendar(weekStart) {
    const params = weekStart ? `?weekStart=${weekStart}` : "";
    const res = await fetch(`${BASE_URL}/api/manager/team-calendar${params}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Team calendar fetch failed: ${res.status}`);
    return res.json();
}

// ── Approval History ──────────────────────────────────────────────────────────

export async function fetchApprovalHistory({ dateRange = 30, type = "all", decision = "all", search = "" } = {}) {
    const params = new URLSearchParams({ dateRange, type, decision, search });
    const res = await fetch(`${BASE_URL}/api/manager/approval-history?${params}`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Approval history fetch failed: ${res.status}`);
    return res.json();
}

// ── Profile ───────────────────────────────────────────────────────────────────

/**
 * Fetch manager profile
 * @returns {Promise<ProfileDTO>}
 */
export async function fetchManagerProfile() {
    const res = await fetch(`${BASE_URL}/api/manager/me`, {
        headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`Manager profile fetch failed: ${res.status}`);
    return res.json();
}

/**
 * Update manager profile
 * @param {Object} profileData - profile data to update
 * @returns {Promise<ProfileDTO>}
 */
export async function updateManagerProfile(profileData) {
    const res = await fetch(`${BASE_URL}/api/manager/profile`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify(profileData),
    });
    if (!res.ok) throw new Error(`Profile update failed: ${res.status}`);
    return res.json();
}
