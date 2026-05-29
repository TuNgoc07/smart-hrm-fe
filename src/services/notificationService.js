const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export const fetchNotifications = async (type = "all") => {
    const res = await fetch(`${API_BASE_URL}/api/notifications?type=${type}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
};

export const fetchUnreadCount = async () => {
    const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch unread count");
    return res.json();
};

export const fetchUnreadCountByType = async () => {
    const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count-by-type`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch unread count by type");
    return res.json();
};

export const markAsRead = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to mark as read");
    return res.json();
};

export const markAllAsRead = async () => {
    const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to mark all as read");
    return res.json();
};

// HR Admin notification functions
export const fetchHrAdminNotifications = async (type = "all") => {
    const res = await fetch(`${API_BASE_URL}/api/hradmin/notifications?type=${type}`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch HR admin notifications");
    return res.json();
};

export const fetchHrAdminUnreadCount = async () => {
    const res = await fetch(`${API_BASE_URL}/api/hradmin/notifications/unread-count`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch HR admin unread count");
    return res.json();
};

export const fetchHrAdminUnreadCountByType = async () => {
    const res = await fetch(`${API_BASE_URL}/api/hradmin/notifications/unread-count-by-type`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch HR admin unread count by type");
    return res.json();
};

export const markHrAdminAsRead = async (id) => {
    const res = await fetch(`${API_BASE_URL}/api/hradmin/notifications/${id}/read`, {
        method: "PATCH",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to mark HR admin notification as read");
    return res.json();
};

export const markAllHrAdminAsRead = async () => {
    const res = await fetch(`${API_BASE_URL}/api/hradmin/notifications/read-all`, {
        method: "PATCH",
        headers: getHeaders()
    });
    if (!res.ok) throw new Error("Failed to mark all HR admin notifications as read");
    return res.json();
};
