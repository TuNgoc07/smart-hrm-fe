const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const getHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export const fetchNotifications = async () => {
    const res = await fetch(`${API_BASE_URL}/api/notifications`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
};

export const fetchUnreadCount = async () => {
    const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Failed to fetch unread count");
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
